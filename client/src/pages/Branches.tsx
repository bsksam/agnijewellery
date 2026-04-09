import React, { useState, useEffect } from 'react';
import { BranchAPI, StockAPI } from '../api/api';
import { 
  Building2, 
  ArrowLeftRight, 
  MapPin, 
  Plus, 
  Package, 
  CheckCircle2, 
  Clock, 
  Store, 
  Warehouse,
  Send,
  ArrowDownCircle,
  ShieldCheck,
  Search,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Branches = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'LOCATIONS' | 'TRANSFERS'>('LOCATIONS');
  
  // Modal states
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  
  // Form states
  const [newBranch, setNewBranch] = useState({ name: '', type: 'STORE', address: '', code: '' });
  const [transferForm, setTransferForm] = useState({ tag_no: '', to_branch_id: '' });
  const [transmitting, setTransmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await BranchAPI.getAll();
      setBranches(res.data);
      
      // Fetch pending transfers for the first branch (Corporate) by default in this view
      // In a real scenario, this would be based on the logged-in user's branch
      const transfers = await BranchAPI.getPendingTransfers(1);
      setPendingTransfers(transfers.data);
    } catch (err) {
      console.error('Failed to load branches', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await BranchAPI.create(newBranch);
      setIsAddBranchOpen(false);
      setNewBranch({ name: '', type: 'STORE', address: '', code: '' });
      fetchInitialData();
    } catch (err) {
      alert('Failed to register branch');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTransmitting(true);
      await BranchAPI.transfer({
        ...transferForm,
        transferred_by: 'Admin Corporate' // Simplified
      });
      setIsTransferOpen(false);
      setTransferForm({ tag_no: '', to_branch_id: '' });
      fetchInitialData();
      alert('Transfer initiated successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Transfer failed');
    } finally {
      setTransmitting(false);
    }
  };

  const handleAccept = async (id: number) => {
    if (!confirm('Confirm receipt of this stock?')) return;
    try {
      await BranchAPI.accept(id, 'Branch Manager');
      fetchInitialData();
    } catch (err) {
      alert('Failed to accept stock');
    }
  };

  if (loading) return <div className="main-content">Connecting Enterprise Nodes...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Multi-Store & Consolidation Hub</h1>
          <p>Managed your jewelry distribution network and corporate stock movements.</p>
        </div>
        <div className="view-switcher">
           <button className={`btn ${activeTab === 'LOCATIONS' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('LOCATIONS')}>
              <Building2 size={18} /> Location Manager
           </button>
           <button className={`btn ${activeTab === 'TRANSFERS' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('TRANSFERS')}>
              <ArrowLeftRight size={18} /> Transfer Hub
           </button>
        </div>
      </header>

      {activeTab === 'LOCATIONS' ? (
        <section className="locations-view">
           <div className="grid-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Showroom & Warehouse Network</h3>
              <button className="btn btn-primary" onClick={() => setIsAddBranchOpen(true)}>
                 <Plus size={18} /> Add New Location
              </button>
           </div>

           <div className="location-grid">
              {branches.map(b => (
                <div key={b.id} className={`location-card ${b.type}`}>
                   <div className="loc-icon">
                      {b.type === 'CORPORATE' ? <Warehouse size={24} /> : <Store size={24} />}
                   </div>
                   <div className="loc-info">
                      <h4>{b.name}</h4>
                      <p className="loc-code">{b.code}</p>
                      <p className="loc-address"><MapPin size={12} /> {b.address}</p>
                   </div>
                   <div className="loc-status">
                      <span className="badge active">Operational</span>
                   </div>
                </div>
              ))}
           </div>
        </section>
      ) : (
        <section className="transfers-view">
           <div className="transfer-panels">
              <div className="panel inbound-panel">
                 <div className="panel-header">
                    <h3><ArrowDownCircle size={20} color="var(--primary)" /> Pending Inbound (To Warehouse)</h3>
                 </div>
                 <div className="transfer-list">
                    {pendingTransfers.length === 0 ? (
                      <div className="empty-state">No pending inbound stock.</div>
                    ) : (
                      pendingTransfers.map(t => (
                        <div key={t.id} className="transfer-item">
                           <div className="t-info">
                              <strong>{t.product_name}</strong>
                              <span>Tag: {t.tag_no} | {t.gross_weight}g</span>
                              <div className="from">From: {t.from_branch_name}</div>
                           </div>
                           <button className="btn btn-sm" onClick={() => handleAccept(t.id)}>Accept Stock</button>
                        </div>
                      ))
                    )}
                 </div>
              </div>

              <div className="panel outbound-panel">
                 <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3><Send size={20} color="#D4AF37" /> Initiate Movement</h3>
                 </div>
                 <div className="quick-transfer-form">
                    <p>Move stock from Warehouse to a Showroom:</p>
                    <form onSubmit={handleTransfer} className="t-form">
                       <div className="form-group">
                          <label>Enter Tag No (Barcode Scan)</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="e.g., G-12345" 
                            value={transferForm.tag_no}
                            onChange={(e) => setTransferForm({...transferForm, tag_no: e.target.value.toUpperCase()})}
                          />
                       </div>
                       <div className="form-group">
                          <label>Target Showroom</label>
                          <select 
                            required 
                            value={transferForm.to_branch_id}
                            onChange={(e) => setTransferForm({...transferForm, to_branch_id: e.target.value})}
                          >
                             <option value="">Select Target...</option>
                             {branches.filter(b => b.type !== 'CORPORATE').map(b => (
                               <option key={b.id} value={b.id}>{b.name}</option>
                             ))}
                          </select>
                       </div>
                       <button className="btn btn-primary" type="submit" disabled={transmitting}>
                          {transmitting ? 'Transmitting...' : 'Execute Stock Movement'}
                       </button>
                    </form>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* Add Branch Modal */}
      <AnimatePresence>
        {isAddBranchOpen && (
          <div className="modal-overlay">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-content">
                <div className="modal-header">
                   <h3>Register New Location</h3>
                   <button className="close-btn" onClick={() => setIsAddBranchOpen(false)}><X /></button>
                </div>
                <form onSubmit={handleAddBranch} className="modal-form">
                   <div className="form-group">
                      <label>Branch Name</label>
                      <input type="text" required value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                   </div>
                   <div className="form-group">
                      <label>Type</label>
                      <select value={newBranch.type} onChange={e => setNewBranch({...newBranch, type: e.target.value})}>
                         <option value="STORE">Retail Showroom</option>
                         <option value="CORPORATE">Corporate Office / Warehouse</option>
                      </select>
                   </div>
                   <div className="form-group">
                      <label>Branch Code</label>
                      <input type="text" required placeholder="e.g., BLR-01" value={newBranch.code} onChange={e => setNewBranch({...newBranch, code: e.target.value})} />
                   </div>
                   <div className="form-group">
                      <label>Full Address</label>
                      <textarea required value={newBranch.address} onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
                   </div>
                   <button className="btn btn-primary w-full" type="submit">Complete Registration</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .location-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .location-card { background: var(--bg-card); border: 1px solid var(--border); padding: 1.5rem; border-radius: 20px; display: flex; align-items: center; gap: 1.25rem; }
        .location-card.CORPORATE { border: 1px solid #D4AF37; background: linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(0,0,0,0) 100%); }
        .loc-icon { width: 50px; height: 50px; background: rgba(255,255,255,0.03); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary); }
        .loc-info { flex: 1; }
        .loc-info h4 { margin: 0; font-size: 1.1rem; color: white; }
        .loc-code { font-size: 0.7rem; font-weight: 800; color: #888; text-transform: uppercase; margin: 4px 0; letter-spacing: 1px; }
        .loc-address { font-size: 0.8rem; color: #555; display: flex; align-items: center; gap: 6px; }
        
        .transfer-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1rem; }
        .panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; display: flex; flex-direction: column; min-height: 400px; }
        .panel-header { padding: 1.5rem; border-bottom: 1px solid var(--border); }
        .transfer-list { flex: 1; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .transfer-item { padding: 1rem; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
        .t-info { display: flex; flex-direction: column; gap: 4px; }
        .t-info strong { color: white; font-size: 0.9rem; }
        .t-info span { font-size: 0.75rem; color: #888; }
        .t-info .from { font-size: 0.7rem; font-weight: 800; color: var(--primary); margin-top: 4px; }
        .empty-state { text-align: center; color: #444; margin-top: 4rem; font-style: italic; }
        
        .quick-transfer-form { padding: 1.5rem; }
        .quick-transfer-form p { font-size: 0.85rem; color: #888; margin-bottom: 1.5rem; }
        .t-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .modal-form { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1rem; }
        .w-full { width: 100%; }
      `}</style>
    </div>
  );
};

export default Branches;
