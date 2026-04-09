import React, { useState, useEffect, useRef } from 'react';
import { StockAPI, MasterAPI, AuditAPI } from '../api/api';
import { 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  History, 
  ArrowRight, 
  ShieldAlert,
  Save,
  Trash2,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Audit = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAuditActive, setIsAuditActive] = useState(false);
  
  const [expectedStock, setExpectedStock] = useState<any[]>([]);
  const [foundTags, setFoundTags] = useState<Set<string>>(new Set());
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [catRes, historyRes] = await Promise.all([
        MasterAPI.getCategories(),
        AuditAPI.getHistory()
      ]);
      setCategories(catRes.data);
      setHistory(historyRes.data);
      if (catRes.data.length > 0) setSelectedCategory(catRes.data[0].id);
    } catch (err) {
      console.error('Failed to load audit data', err);
    } finally {
      setLoading(false);
    }
  };

  const startAudit = async () => {
    try {
      const allStock = await StockAPI.getAllStock();
      // Filter for available stock in selected category
      const expected = allStock.data.filter((s: any) => 
        s.category_id.toString() === selectedCategory.toString() && 
        s.status === 'AVAILABLE'
      );
      
      setExpectedStock(expected);
      setFoundTags(new Set());
      setErrors([]);
      setIsAuditActive(true);
      setTimeout(() => tagInputRef.current?.focus(), 100);
    } catch (err) {
      alert('Failed to start audit session');
    }
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = tagInput.trim().toUpperCase();
    if (!tag) return;

    const isExpected = expectedStock.find(s => s.tag_no === tag);
    
    if (foundTags.has(tag)) {
        // Already scanned
    } else if (isExpected) {
      setFoundTags(prev => new Set(prev).add(tag));
    } else {
      setErrors(prev => [`Unrecognized or out-of-category tag: ${tag}`, ...prev].slice(0, 5));
    }

    setTagInput('');
    tagInputRef.current?.focus();
  };

  const finishAudit = async () => {
    if (!window.confirm('Are you sure you want to finish this audit session and save results?')) return;

    const missingCount = expectedStock.length - foundTags.size;
    try {
      await AuditAPI.submit({
        category_id: selectedCategory,
        total_expected: expectedStock.length,
        total_found: foundTags.size,
        total_missing: missingCount,
        status: missingCount === 0 ? 'PERFECT' : 'DISCREPANCY'
      });
      setIsAuditActive(false);
      fetchInitialData();
    } catch (err) {
      alert('Failed to save audit results');
    }
  };

  const missingItems = expectedStock.filter(s => !foundTags.has(s.tag_no));

  if (loading) return <div className="main-content">Loading Audit Engine...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Stock Reconciliation</h1>
          <p>Verify physical jewelry trays against cloud inventory records.</p>
        </div>
        {!isAuditActive ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={startAudit}>
              <Scan size={18} /> Start Category Audit
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={finishAudit} style={{ background: '#22c55e' }}>
            <Save size={18} /> Finish & Save Report
          </button>
        )}
      </header>

      {isAuditActive ? (
        <div className="audit-workspace">
          <div className="audit-controls">
             <div className="scanner-container">
                <form onSubmit={handleScan}>
                  <div className="scan-input-wrapper">
                    <Scan className="scan-icon-anim" />
                    <input 
                      ref={tagInputRef}
                      type="text" 
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      placeholder="SCAN NOW..."
                      autoFocus
                    />
                  </div>
                </form>
             </div>

             <div className="audit-stats-grid">
                <div className="audit-stat matched">
                   <div className="s-label">Found / Scanned</div>
                   <div className="s-value">{foundTags.size}</div>
                </div>
                <div className="audit-stat missing">
                   <div className="s-label">Missing (Not Found)</div>
                   <div className="s-value">{expectedStock.length - foundTags.size}</div>
                </div>
                <div className="audit-stat total">
                   <div className="s-label">Total Expected</div>
                   <div className="s-value">{expectedStock.length}</div>
                </div>
             </div>

             {errors.length > 0 && (
               <div className="audit-errors">
                  <h4><ShieldAlert size={16} /> Scanning Alerts</h4>
                  {errors.map((err, i) => <div key={i} className="error-msg">{err}</div>)}
               </div>
             )}
          </div>

          <div className="audit-results-grid">
             <div className="data-table-container">
                <div className="table-header-simple">
                   <h3><AlertCircle size={18} color="#ef4444" /> Missing Items List</h3>
                   <span>{missingItems.length} items not yet located</span>
                </div>
                <div className="scroll-table-box">
                  <table className="custom-table smaller">
                    <thead>
                       <tr>
                          <th>Tag No</th>
                          <th>Product</th>
                          <th>Weight</th>
                          <th>HUID</th>
                       </tr>
                    </thead>
                    <tbody>
                       {missingItems.map(s => (
                         <tr key={s.tag_no}>
                            <td style={{ fontWeight: 800 }}>{s.tag_no}</td>
                            <td>{s.product_name}</td>
                            <td>{s.net_weight}g</td>
                            <td>{s.huid1 || '-'}</td>
                         </tr>
                       ))}
                       {missingItems.length === 0 && (
                         <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#22c55e' }}>🎉 All items matched! Ready to close audit.</td></tr>
                       )}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="audit-history">
           <div className="data-table-container">
              <div className="table-header-simple">
                 <h3><History size={18} /> Recent Audit History</h3>
              </div>
              <table className="custom-table">
                 <thead>
                    <tr>
                       <th>Date</th>
                       <th>Category</th>
                       <th>Stats (Expected / Found / Missing)</th>
                       <th>Status</th>
                       <th>Auditor</th>
                    </tr>
                 </thead>
                 <tbody>
                    {history.map(h => (
                      <tr key={h.id}>
                         <td>{new Date(h.audit_date).toLocaleString()}</td>
                         <td><strong>{h.category_name}</strong></td>
                         <td>
                            <div className="audit-progress-mini">
                               <div className="p-bar-bg"><div className="p-bar-fill" style={{ width: `${(h.total_found/h.total_expected)*100}%` }}></div></div>
                               <span>{h.total_found} / {h.total_expected} ({h.total_missing} Missing)</span>
                            </div>
                         </td>
                         <td>
                            <span className={`status-pill ${h.status.toLowerCase()}`}>
                               {h.status}
                            </span>
                         </td>
                         <td>{h.performed_by}</td>
                      </tr>
                    ))}
                    {history.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>No audit sessions recorded yet. Start your first category audit above.</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      <style>{`
        .audit-workspace { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; margin-top: 1rem; }
        .scanner-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border); padding: 1.5rem; margin-bottom: 1.5rem; }
        .scan-input-wrapper { display: flex; align-items: center; gap: 12px; background: #000; padding: 12px; border-radius: 12px; border: 1px solid #333; }
        .scan-input-wrapper input { background: none; border: none; color: white; width: 100%; font-size: 1.2rem; font-weight: 700; letter-spacing: 2px; }
        .scan-input-wrapper input:focus { outline: none; }
        .scan-icon-anim { color: var(--primary); animation: scan-pulse 2s infinite; }
        @keyframes scan-pulse { 0% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(1); } }
        
        .audit-stats-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1.5rem; }
        .audit-stat { padding: 1.25rem; border-radius: 16px; border: 1px solid var(--border); }
        .audit-stat .s-label { font-size: 0.75rem; text-transform: uppercase; color: #888; margin-bottom: 6px; }
        .audit-stat .s-value { font-size: 1.5rem; font-weight: 900; }
        .audit-stat.matched { background: rgba(34, 197, 94, 0.05); color: #22c55e; }
        .audit-stat.missing { background: rgba(239, 68, 68, 0.05); color: #ef4444; }
        .audit-stat.total { background: rgba(255, 255, 255, 0.03); color: white; }

        .audit-errors { padding: 1rem; background: rgba(255,165,0,0.05); border-radius: 12px; border: 1px solid rgba(255,165,0,0.2); }
        .audit-errors h4 { font-size: 0.8rem; color: orange; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .error-msg { font-size: 0.75rem; color: #BBB; margin-bottom: 4px; }

        .table-header-simple { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
        .table-header-simple h3 { font-size: 1rem; display: flex; align-items: center; gap: 8px; }
        .scroll-table-box { height: calc(100vh - 280px); overflow-y: auto; }
        .custom-table.smaller { font-size: 0.85rem; }
        .custom-table.smaller th, .custom-table.smaller td { padding: 10px 15px; }

        .audit-progress-mini { display: flex; flex-direction: column; gap: 4px; }
        .p-bar-bg { height: 6px; background: #222; border-radius: 3px; overflow: hidden; width: 150px; }
        .p-bar-fill { height: 100%; background: var(--primary); transition: width 0.3s ease; }
        .audit-progress-mini span { font-size: 0.7rem; color: #666; }

        .status-pill.perfect { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .status-pill.discrepancy { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
      `}</style>
    </div>
  );
};

export default Audit;
