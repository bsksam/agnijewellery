import React, { useState, useEffect } from 'react';
import { DealerAPI } from '../api/api';
import { 
  Hammer, 
  Weight, 
  Plus, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  UserPlus, 
  Phone, 
  MapPin, 
  Calculator,
  Scale,
  FileText,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dealers = () => {
  const [dealers, setDealers] = useState<any[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [showLedger, setShowLedger] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<'ISSUE' | 'RECEIVE'>('ISSUE');
  
  const [loading, setLoading] = useState(true);
  const [newDealer, setNewDealer] = useState({
    name: '',
    mobile: '',
    address: '',
    opening_metal_balance: 0
  });

  const [transaction, setTransaction] = useState({
    metal_type: 'GOLD',
    weight: '',
    description: ''
  });

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const res = await DealerAPI.getAll();
      setDealers(res.data);
    } catch (err) {
      console.error('Failed to fetch dealers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DealerAPI.create(newDealer);
      alert('Dealer/Smith registered successfully!');
      setShowAddModal(false);
      fetchDealers();
    } catch (err) {
      alert('Failed to register dealer');
    }
  };

  const openLedger = async (dealer: any) => {
    setSelectedDealer(dealer);
    try {
      const res = await DealerAPI.getLedger(dealer.id);
      setLedger(res.data);
      setShowLedger(true);
    } catch (err) {
      alert('Failed to load ledger');
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DealerAPI.recordTransaction({
        dealer_id: selectedDealer.id,
        ...transaction,
        type: txType,
        weight: parseFloat(transaction.weight)
      });
      alert(`Metal ${txType === 'ISSUE' ? 'issued to' : 'received from'} smith successfully.`);
      setShowTxModal(false);
      setTransaction({ metal_type: 'GOLD', weight: '', description: '' });
      fetchDealers();
      if (showLedger) openLedger(selectedDealer);
    } catch (err) {
      alert('Transaction failed');
    }
  };

  if (loading) return <div className="main-content">Accessing Metal Vault...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Dealer / Smith Registry</h1>
          <p>Real-time metal accounting and manufacturing pipeline oversight.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> Register New Smith/Dealer
        </button>
      </header>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
         <div className="stat-card">
            <div className="stat-header"><Scale size={18} color="var(--primary)" /> <span>Active Smiths</span></div>
            <div className="stat-value">{dealers.length}</div>
         </div>
         <div className="stat-card">
            <div className="stat-header"><ArrowUpRight size={18} color="#ef4444" /> <span>Metal with Smiths</span></div>
            <div className="stat-value">{dealers.reduce((sum, d) => sum + d.current_balance, 0).toFixed(3)}g</div>
            <div className="stat-footer">Total outstanding Gold</div>
         </div>
      </div>

      <div className="data-table-container">
         <table className="custom-table">
            <thead>
               <tr>
                  <th>Manufacturer / Dealer</th>
                  <th>Contact Details</th>
                  <th>City / Address</th>
                  <th>Current Metal Balance (g)</th>
                  <th>Actions</th>
               </tr>
            </thead>
            <tbody>
               {dealers.map(d => (
                 <tr key={d.id}>
                    <td>
                       <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Hammer size={14} color="var(--primary)" /> {d.name}
                       </div>
                    </td>
                    <td><Phone size={12} /> {d.mobile}</td>
                    <td><MapPin size={12} /> {d.address || 'Local'}</td>
                    <td style={{ fontWeight: 800, color: d.current_balance > 0 ? '#ef4444' : '#22c55e' }}>
                       {d.current_balance.toFixed(3)} g
                    </td>
                    <td>
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-icon" title="Issue Metal" onClick={() => { setSelectedDealer(d); setTxType('ISSUE'); setShowTxModal(true); }}>
                             <ArrowUpRight size={16} color="#ef4444" />
                          </button>
                          <button className="btn btn-icon" title="Receive Metal" onClick={() => { setSelectedDealer(d); setTxType('RECEIVE'); setShowTxModal(true); }}>
                             <ArrowDownLeft size={16} color="#22c55e" />
                          </button>
                          <button className="btn btn-icon" title="View Ledger" onClick={() => openLedger(d)}>
                             <History size={16} />
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Add Dealer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                   <h3>Register Brand Partner / Smith</h3>
                   <button className="close-btn" onClick={() => setShowAddModal(false)}><X /></button>
                </div>
                <form onSubmit={handleAddDealer} style={{ marginTop: '1.5rem' }}>
                   <div className="form-group"><label>Dealer/Smith Name</label><input type="text" value={newDealer.name} onChange={e => setNewDealer({...newDealer, name: e.target.value})} required /></div>
                   <div className="form-group"><label>Mobile Number</label><input type="text" value={newDealer.mobile} onChange={e => setNewDealer({...newDealer, mobile: e.target.value})} required /></div>
                   <div className="form-group"><label>Address / City</label><input type="text" value={newDealer.address} onChange={e => setNewDealer({...newDealer, address: e.target.value})} /></div>
                   <div className="form-group"><label>Opening Metal Balance (g)</label><input type="number" step="0.001" value={newDealer.opening_metal_balance} onChange={e => setNewDealer({...newDealer, opening_metal_balance: parseFloat(e.target.value)})} /></div>
                   <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Register Partner</button>
                </form>
            </motion.div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTxModal && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                   <h3 style={{ color: txType === 'ISSUE' ? '#ef4444' : '#22c55e' }}>
                      {txType === 'ISSUE' ? 'Issue Metal to Smith' : 'Receive Jewelry from Smith'}
                   </h3>
                   <button className="close-btn" onClick={() => setShowTxModal(false)}><X /></button>
                </div>
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                   <p style={{ fontSize: '0.9rem', color: '#888' }}>Dealer: <strong>{selectedDealer?.name}</strong></p>
                </div>
                <form onSubmit={handleTransaction} style={{ marginTop: '1.5rem' }}>
                   <div className="form-group">
                      <label>Metal Type</label>
                      <select value={transaction.metal_type} onChange={e => setTransaction({...transaction, metal_type: e.target.value})}>
                         <option value="GOLD">Gold (Raw/Pure)</option>
                         <option value="SILVER">Silver</option>
                         <option value="DIAMOND">Diamond (cts)</option>
                      </select>
                   </div>
                   <div className="form-group"><label>Weight (grams)</label><input type="number" step="0.001" value={transaction.weight} onChange={e => setTransaction({...transaction, weight: e.target.value})} required /></div>
                   <div className="form-group"><label>Description / Job Worker Note</label><input type="text" value={transaction.description} onChange={e => setTransaction({...transaction, description: e.target.value})} placeholder="e.g. For Chain Job #102" /></div>
                   <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: txType === 'ISSUE' ? '#ef4444' : '#22c55e', borderColor: txType === 'ISSUE' ? '#ef4444' : '#22c55e' }}>
                      Record {txType === 'ISSUE' ? 'Issuance' : 'Receipt'}
                   </button>
                </form>
            </motion.div>
          </div>
        )}

        {/* Ledger Modal */}
        {showLedger && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="modal-content print-modal" style={{ maxWidth: '800px', width: '90%' }}>
                <div className="modal-header no-print">
                   <h3><History size={18} /> Metal Ledger: {selectedDealer?.name}</h3>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn" onClick={() => window.print()}>Print Ledger</button>
                      <button className="close-btn" onClick={() => setShowLedger(false)}><X /></button>
                   </div>
                </div>
                <div className="modal-body" style={{ marginTop: '1.5rem' }}>
                   <table className="custom-table">
                      <thead>
                         <tr>
                            <th>Date</th>
                            <th>Transaction</th>
                            <th>Description</th>
                            <th>Issued (-)</th>
                            <th>Received (+)</th>
                         </tr>
                      </thead>
                      <tbody>
                         {ledger.map(tx => (
                           <tr key={tx.id}>
                              <td>{new Date(tx.tx_date).toLocaleDateString()}</td>
                              <td style={{ color: tx.type === 'ISSUE' ? '#ef4444' : '#22c55e', fontWeight: 700 }}>{tx.type}</td>
                              <td>{tx.description}</td>
                              <td>{tx.type === 'ISSUE' ? `${tx.weight} g` : '-'}</td>
                              <td>{tx.type === 'RECEIVE' ? `${tx.weight} g` : '-'}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dealers;
