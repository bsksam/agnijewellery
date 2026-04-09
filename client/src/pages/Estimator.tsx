import React, { useState, useEffect } from 'react';
import { QuotationAPI, StockAPI, RatesAPI } from '../api/api';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  Search, 
  Clock, 
  ArrowRightCircle, 
  User, 
  Phone,
  Scan,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Estimator = () => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'HISTORY'>('NEW');
  const [stock, setStock] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // New Quote State
  const [customer, setCustomer] = useState({ name: '', mobile: '' });
  const [quoteItems, setQuoteItems] = useState<any[]>([]);
  const [searchTag, setSearchTag] = useState('');
  
  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, [activeTab]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'NEW') {
        const [stockRes, ratesRes] = await Promise.all([
          StockAPI.getAllStock(),
          RatesAPI.getLatestRates()
        ]);
        setStock(stockRes.data);
        setRates(ratesRes.data);
      } else {
        const historyRes = await QuotationAPI.getAll();
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const addItemToQuote = () => {
    const item = stock.find(s => s.tag_no === searchTag && s.status === 'AVAILABLE');
    if (!item) {
       alert('Item not found or already sold.');
       return;
    }
    
    // Check if already in quote
    if (quoteItems.find(q => q.tag_no === item.tag_no)) {
       alert('Item already in quotation');
       return;
    }

    const goldRate = rates.find(r => r.metal === 'GOLD')?.selling_rate || 0;
    const itemTotal = (goldRate * item.net_weight * (item.touch / 100)) + item.mc_total + item.stone_value + item.hallmark_charges;

    setQuoteItems([...quoteItems, {
       tag_no: item.tag_no,
       product_name: item.product_name,
       weight: item.net_weight,
       rate: goldRate,
       making_charges: item.mc_total,
       stone_charges: item.stone_value,
       total: itemTotal
    }]);
    setSearchTag('');
  };

  const saveQuote = async () => {
    if (quoteItems.length === 0) return;
    try {
       setSaving(true);
       const total = quoteItems.reduce((acc, i) => acc + i.total, 0);
       await QuotationAPI.create({
          customer_name: customer.name,
          customer_mobile: customer.mobile,
          items: quoteItems,
          total_amount: total,
          valid_hours: 24
       });
       alert('Quotation saved successfully!');
       setQuoteItems([]);
       setCustomer({ name: '', mobile: '' });
    } catch (err) {
       alert('Failed to save quotation');
    } finally {
       setSaving(false);
    }
  };

  const handleViewQuote = async (id: string) => {
    try {
       const res = await QuotationAPI.getById(id);
       setSelectedQuote(res.data);
    } catch (err) {
       alert('Failed to load quote details');
    }
  };

  if (loading && quoteItems.length === 0) return <div className="main-content">Initializing Estimation Desk...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Professional Quotation Desk</h1>
          <p>Quick estimations and branded proposal generation for customers.</p>
        </div>
        <div className="view-switcher">
           <button className={`btn ${activeTab === 'NEW' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('NEW')}>
              <Plus size={18} /> New Estimate
           </button>
           <button className={`btn ${activeTab === 'HISTORY' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('HISTORY')}>
              <Clock size={18} /> Pending Quotes
           </button>
        </div>
      </header>

      {activeTab === 'NEW' ? (
        <div className="estimator-layout">
           <div className="estimator-main">
              <div className="search-box">
                 <div className="form-group" style={{ flex: 1 }}>
                    <label>Scan / Enter Tag No</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       <input 
                         type="text" 
                         value={searchTag} 
                         placeholder="Barcode Scan..." 
                         onChange={(e) => setSearchTag(e.target.value.toUpperCase())}
                       />
                       <button className="btn btn-primary" onClick={addItemToQuote}><Plus /></button>
                    </div>
                 </div>
              </div>

              <div className="quote-items-list data-table-container">
                 <table className="custom-table">
                    <thead>
                       <tr>
                          <th>Item</th>
                          <th>Wt/Purity</th>
                          <th>Rate/MC</th>
                          <th>Stone</th>
                          <th>Total Estimate</th>
                          <th>Action</th>
                       </tr>
                    </thead>
                    <tbody>
                       {quoteItems.map((item, idx) => (
                         <tr key={idx}>
                            <td>
                               <strong>{item.product_name}</strong>
                               <div style={{ fontSize: '0.7rem', color: '#888' }}>{item.tag_no}</div>
                            </td>
                            <td>{item.weight}g / 91.6%</td>
                            <td>₹{item.rate}/g | ₹{Math.round(item.making_charges)}</td>
                            <td>₹{item.stone_charges.toLocaleString()}</td>
                            <td style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{Math.round(item.total).toLocaleString()}</td>
                            <td>
                               <button className="btn-icon delete" onClick={() => setQuoteItems(quoteItems.filter((_, i) => i !== idx))}>
                                  <Trash2 size={16} />
                               </button>
                            </td>
                         </tr>
                       ))}
                       {quoteItems.length === 0 && (
                         <tr><td colSpan={6} style={{ textAlign: 'center', color: '#444' }}>No items added to estimate.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="estimator-sidebar">
              <div className="sidebar-header">
                 <h3>Estimate Branding</h3>
              </div>
              <div className="customer-info-box">
                 <div className="form-group">
                    <label><User size={14} /> Guest Name</label>
                    <input type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="Full Name..." />
                 </div>
                 <div className="form-group">
                    <label><Phone size={14} /> Mobile No</label>
                    <input type="text" value={customer.mobile} onChange={e => setCustomer({...customer, mobile: e.target.value})} placeholder="Lead Tracking..." />
                 </div>
              </div>

              <div className="total-summary">
                 <div className="total-row">
                    <span>Subtotal</span>
                    <span>₹{Math.round(quoteItems.reduce((acc, i) => acc + i.total, 0)).toLocaleString()}</span>
                 </div>
                 <div className="total-row highlight">
                    <span>Grand Total</span>
                    <span>₹{Math.round(quoteItems.reduce((acc, i) => acc + i.total, 0) * 1.03).toLocaleString()} (Inc. 3% GST)</span>
                 </div>
              </div>

              <div className="actions">
                 <button className="btn btn-primary w-full" onClick={saveQuote} disabled={saving || quoteItems.length === 0}>
                    <Save size={18} /> Save & Record Lead
                 </button>
                 <button className="btn w-full" onClick={() => window.print()} disabled={quoteItems.length === 0}>
                    <Printer size={18} /> Print Branded Estimate
                 </button>
              </div>
              
              <div className="validity-warning">
                 <Clock size={14} /> Estimates are valid for 24 hours only based on live market gold rates.
              </div>
           </div>
        </div>
      ) : (
        <div className="history-view data-table-container">
           <table className="custom-table">
              <thead>
                 <tr>
                    <th>Quote No</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Valid Until</th>
                    <th>Status</th>
                    <th>Action</th>
                 </tr>
              </thead>
              <tbody>
                 {history.map(q => (
                   <tr key={q.id}>
                      <td style={{ fontWeight: 800 }}>{q.quote_no}</td>
                      <td>{q.customer_name} ({q.customer_mobile})</td>
                      <td>{new Date(q.created_at).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 700 }}>₹{Math.round(q.total_amount).toLocaleString()}</td>
                      <td style={{ color: new Date(q.valid_until) < new Date() ? '#ef4444' : '#888' }}>
                         {new Date(q.valid_until).toLocaleString()}
                      </td>
                      <td>
                         <span className={`status-pill ${q.status.toLowerCase()}`}>{q.status}</span>
                      </td>
                      <td>
                         <button className="btn btn-sm" onClick={() => handleViewQuote(q.id)}>View Items</button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {/* Quote Items Modal */}
      <AnimatePresence>
        {selectedQuote && (
          <div className="modal-overlay">
             <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="modal-content medium">
                <div className="modal-header">
                   <h3>Quote Details: {selectedQuote.quote_no}</h3>
                   <button className="close-btn" onClick={() => setSelectedQuote(null)}><X /></button>
                </div>
                <div className="quote-details-list">
                   {selectedQuote.items?.map((item: any) => (
                      <div key={item.id} className="quote-item-card">
                         <div className="q-head">
                            <strong>{item.product_name}</strong>
                            <span>₹{Math.round(item.total).toLocaleString()}</span>
                         </div>
                         <div className="q-body">
                            Tag: {item.tag_no} | Wt: {item.weight}g | Rate: ₹{item.rate}
                         </div>
                      </div>
                   ))}
                </div>
                <div className="modal-footer" style={{ marginTop: '2rem' }}>
                   <p style={{ color: '#888', fontSize: '0.8rem' }}>To finalize this sale, navigate to Billing and enter Tag ID.</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .estimator-layout { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; margin-top: 1rem; }
        .estimator-main { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 2rem; }
        .search-box { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border); }
        .estimator-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
        .customer-info-box { background: rgba(0,0,0,0.2); border: 1px solid var(--border); padding: 1.5rem; border-radius: 20px; }
        .total-summary { background: #111; padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border); }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem; color: #888; }
        .total-row.highlight { font-weight: 800; color: white; border-top: 1px solid var(--border); padding-top: 10px; margin-top: 10px; font-size: 1.1rem; }
        .validity-warning { font-size: 0.7rem; color: #D4AF37; display: flex; align-items: flex-start; gap: 8px; font-weight: 600; font-style: italic; }
        .w-full { width: 100%; justify-content: center; }
        .quote-item-card { background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 1rem; border-radius: 12px; margin-bottom: 0.75rem; }
        .q-head { display: flex; justify-content: space-between; font-weight: 700; color: white; margin-bottom: 4px; }
        .q-body { font-size: 0.75rem; color: #888; }
        .status-pill.pending { background: rgba(0,0,0,0.3); color: #888; }
      `}</style>
    </div>
  );
};

export default Estimator;
