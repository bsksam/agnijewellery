import React, { useState, useEffect } from 'react';
import { RepairAPI } from '../api/api';
import { 
  Hammer, 
  Plus, 
  Search as SearchIcon, 
  Clock, 
  CheckCircle2, 
  Truck, 
  User, 
  Smartphone, 
  Calendar, 
  ArrowRight,
  Printer,
  X,
  Trash2,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PrintJobCard from '../components/PrintJobCard';

const Repairs = () => {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [newRepair, setNewRepair] = useState({
    customer_name: '',
    customer_mobile: '',
    item_description: '',
    repair_details: '',
    promised_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    total_charge: 0,
    advance_paid: 0
  });

  useEffect(() => {
    fetchRepairs();
  }, [searchTerm]);

  const fetchRepairs = async () => {
    try {
      const res = await RepairAPI.getAll(searchTerm);
      setRepairs(res.data);
    } catch (err) {
      console.error('Repair fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await RepairAPI.create(newRepair);
      alert('Repair job card created successfully!');
      setShowAddModal(false);
      fetchRepairs();
    } catch (err) {
      alert('Failed to create repair ticket');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      if (status === 'DELIVERED') {
          await RepairAPI.deliver(id);
          alert('Item delivered and service income recorded');
      } else {
          await RepairAPI.updateStatus(id, status);
      }
      fetchRepairs();
    } catch (err) {
      alert('Status update failed');
    }
  };

  const cancelRepair = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this job?')) return;
    try {
      await RepairAPI.cancel(id);
      fetchRepairs();
    } catch (err) {
      alert('Cancel failed');
    }
  };

  const deleteRepair = async (id: number) => {
    if (!window.confirm('Permanently delete this record?')) return;
    try {
      await RepairAPI.delete(id);
      fetchRepairs();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handlePrint = (repair: any) => {
    setSelectedRepair(repair);
    setShowPrintModal(true);
  };

  const filteredRepairs = repairs.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  if (loading) return <div className="main-content">Accessing Job Card Vault...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Repair Management & Service Hub</h1>
          <p>Track job cards, resizing work, and specialized jewelry repairs.</p>
        </div>
        <div className="header-actions">
           <div className="search-box-container no-print">
              <SearchIcon size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search Job No / Customer..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Plus size={18} /> New Job Card</button>
        </div>
      </header>

      <div className="filter-bar no-print">
         {['ALL', 'RECEIVED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'].map(f => (
           <button 
             key={f} 
             className={`filter-btn ${filter === f ? 'active' : ''}`}
             onClick={() => setFilter(f)}
           >
             {f}
           </button>
         ))}
      </div>

      <div className="repairs-grid">
         {filteredRepairs.map(r => (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={r.id} className={`repair-card ${r.status}`}>
              <div className="r-header">
                 <div className="job-no">{r.job_card_no}</div>
                 <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className={`status-badge ${r.status}`}>{r.status}</div>
                    <button className="btn-icon no-print" onClick={() => handlePrint(r)} title="Print Job Card"><Printer size={16} /></button>
                 </div>
              </div>
              <div className="r-body">
                 <div className="r-item-main">
                    <h4>{r.item_description}</h4>
                    <p>{r.repair_details}</p>
                 </div>
                 <div className="r-detail-row">
                    <User size={14} /> <span>{r.customer_name}</span>
                 </div>
                 <div className="r-detail-row">
                    <Smartphone size={14} /> <span>{r.customer_mobile}</span>
                 </div>
                 <div className="r-detail-row">
                    <Calendar size={14} /> <span>Due: <strong>{new Date(r.promised_date).toLocaleDateString()}</strong></span>
                 </div>
              </div>
              <div className="r-pricing">
                 <div className="price-item">Total: ₹{r.total_charge}</div>
                 <div className="price-item">Advance: ₹{r.advance_paid}</div>
                 <div className="price-item final">Bal: <strong>₹{r.total_charge - r.advance_paid}</strong></div>
              </div>
              <div className="r-footer no-print">
                   {r.status === 'RECEIVED' && (
                     <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn" style={{ flex: 1 }} onClick={() => updateStatus(r.id, 'PROCESSING')}>Start Processing <ArrowRight size={14} /></button>
                        <button className="btn-icon" style={{ background: '#ef444422' }} onClick={() => deleteRepair(r.id)}><Trash2 size={16} color="#ef4444" /></button>
                     </div>
                   )}
                   {r.status === 'PROCESSING' && (
                     <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn" style={{ background: '#22c55e', color: '#000', flex: 1 }} onClick={() => updateStatus(r.id, 'READY')}>Mark Ready <CheckCircle2 size={14} /></button>
                        <button className="btn-icon" onClick={() => cancelRepair(r.id)} title="Cancel Job"><Ban size={16} color="#f97316" /></button>
                     </div>
                   )}
                   {r.status === 'READY' && (
                     <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => updateStatus(r.id, 'DELIVERED')}>Deliver & Close <Truck size={14} /></button>
                        <button className="btn-icon" onClick={() => cancelRepair(r.id)} title="Cancel Job"><Ban size={16} color="#f97316" /></button>
                     </div>
                   )}
                   {r.status === 'DELIVERED' && (
                     <div className="delivered-msg"><CheckCircle2 size={16} /> Fully Settled</div>
                   )}
                   {r.status === 'CANCELLED' && (
                     <div className="delivered-msg" style={{ color: '#ef4444' }}><Ban size={16} /> Order Cancelled</div>
                   )}
              </div>
           </motion.div>
         ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                   <h3>Create New Service Job Card</h3>
                   <button className="close-btn" onClick={() => setShowAddModal(false)}><X /></button>
                </div>
                <form onSubmit={handleCreate} style={{ marginTop: '1.5rem' }}>
                   <div className="form-grid">
                      <div className="form-group"><label>Customer Name</label><input type="text" value={newRepair.customer_name} onChange={e => setNewRepair({...newRepair, customer_name: e.target.value})} required /></div>
                      <div className="form-group"><label>Mobile Number</label><input type="text" value={newRepair.customer_mobile} onChange={e => setNewRepair({...newRepair, customer_mobile: e.target.value})} required /></div>
                   </div>
                   <div className="form-group"><label>Item Description (e.g. 22K Gold Bangle)</label><input type="text" value={newRepair.item_description} onChange={e => setNewRepair({...newRepair, item_description: e.target.value})} required /></div>
                   <div className="form-group"><label>Repair Work Needed</label><textarea value={newRepair.repair_details} onChange={e => setNewRepair({...newRepair, repair_details: e.target.value})} required style={{ height: '80px', padding: '10px' }} /></div>
                   <div className="form-grid">
                      <div className="form-group"><label>Promised Delivery Date</label><input type="date" value={newRepair.promised_date} onChange={e => setNewRepair({...newRepair, promised_date: e.target.value})} required /></div>
                      <div className="form-group"><label>Total Estimated Charge</label><input type="number" value={newRepair.total_charge} onChange={e => setNewRepair({...newRepair, total_charge: parseFloat(e.target.value)})} /></div>
                   </div>
                   <div className="form-group"><label>Advance Paid (if any)</label><input type="number" value={newRepair.advance_paid} onChange={e => setNewRepair({...newRepair, advance_paid: parseFloat(e.target.value)})} /></div>
                   <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Generate Digital Job Card</button>
                </form>
             </motion.div>
          </div>
        )}

        {showPrintModal && selectedRepair && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '850px', background: 'white', color: 'black' }}>
               <div className="modal-header no-print">
                  <h3 style={{ color: 'black' }}>Print Preview - Job Card</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                     <button className="btn btn-primary" onClick={() => window.print()}><Printer size={18} /> Print Now</button>
                     <button className="close-btn" onClick={() => setShowPrintModal(false)}><X color="black" /></button>
                  </div>
               </div>
               <div className="modal-body" style={{ background: 'white', padding: 0 }}>
                  <PrintJobCard repair={selectedRepair} />
               </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .header-actions { display: flex; gap: 1rem; align-items: center; }
        .search-box-container { position: relative; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 0 12px; height: 45px; display: flex; align-items: center; width: 300px; }
        .search-icon { color: #666; margin-right: 10px; }
        .search-box-container input { background: none; border: none; color: white; width: 100%; font-size: 0.9rem; outline: none; }

        .filter-bar { display: flex; gap: 8px; margin-bottom: 2rem; background: var(--bg-card); padding: 6px; border-radius: 12px; border: 1px solid var(--border); overflow-x: auto; }
        .filter-btn { padding: 8px 16px; border-radius: 8px; border: none; background: none; color: #888; cursor: pointer; font-size: 0.8rem; font-weight: 700; white-space: nowrap; }
        .filter-btn.active { background: var(--primary); color: #000; }

        .repairs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .repair-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; transition: 0.3s; }
        .repair-card:hover { border-color: var(--primary); }
        .repair-card.CANCELLED { border-color: #ef444444; opacity: 0.7; }

        .r-header { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .job-no { font-family: monospace; font-weight: 800; color: #888; font-size: 0.8rem; }
        .status-badge { font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
        .status-badge.RECEIVED { background: #3b82f633; color: #3b82f6; }
        .status-badge.PROCESSING { background: #d4af3733; color: #d4af37; }
        .status-badge.READY { background: #22c55e33; color: #22c55e; }
        .status-badge.DELIVERED { background: rgba(255,255,255,0.05); color: #888; }
        .status-badge.CANCELLED { background: #ef444433; color: #ef4444; }

        .r-body { padding: 1.5rem; flex: 1; }
        .r-item-main h4 { margin: 0; font-size: 1.2rem; color: white; }
        .r-item-main p { font-size: 0.85rem; color: #888; margin: 8px 0 1.5rem 0; }
        .r-detail-row { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #666; margin-bottom: 8px; }
        .r-detail-row strong { color: white; }

        .r-pricing { background: rgba(255,255,255,0.02); padding: 1rem 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-top: 1px solid rgba(255,255,255,0.05); }
        .price-item { font-size: 0.75rem; color: #888; }
        .price-item.final { grid-column: 1 / -1; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px; font-size: 0.9rem; }
        .price-item.final strong { color: var(--primary); }

        .r-footer { padding: 1rem; }
        .r-footer button { justify-content: center; }
        .delivered-msg { display: flex; align-items: center; justify-content: center; gap: 8px; color: #888; font-size: 0.9rem; padding: 12px; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

        @media print {
            .no-print { display: none !important; }
            .modal-overlay { background: white !important; display: block; overflow: visible; }
            .modal-content { border: none !important; box-shadow: none !important; width: 100% !important; max-width: none !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Repairs;
