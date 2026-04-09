import React, { useState, useEffect } from 'react';
import { SchemeAPI, CustomerAPI } from '../api/api';
import { 
  PiggyBank, 
  Plus, 
  Search, 
  Calendar, 
  CreditCard, 
  Wallet, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  History,
  FileText,
  Printer,
  X,
  CreditCard as PaymentIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PrintSchemeReceipt from '../components/PrintSchemeReceipt';

const Schemes = () => {
  const [activeTab, setActiveTab] = useState<'ENROLL' | 'COLLECT' | 'VIEW'>('COLLECT');
  const [masters, setMasters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSchemes, setActiveSchemes] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showPassbook, setShowPassbook] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  
  const [newEnroll, setNewEnroll] = useState({
    customer_name: '',
    customer_mobile: '',
    scheme_id: '',
    start_date: new Date().toISOString().split('T')[0]
  });

  const [payment, setPayment] = useState({
    scheme_id: '',
    amount: '',
    mode: 'CASH'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const res = await SchemeAPI.getMasters();
      setMasters(res.data);
    } catch (err) {
      console.error('Failed to load scheme plans', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await SchemeAPI.search(searchQuery);
      setActiveSchemes(res.data);
    } catch (err) {
      alert('Search failed');
    }
  };

  const fetchPassbook = async (scheme: any) => {
    setSelectedScheme(scheme);
    try {
      const res = await SchemeAPI.getPayments(scheme.id);
      setPaymentHistory(res.data);
      setShowPassbook(true);
    } catch (err) {
      alert('Failed to load passbook');
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await SchemeAPI.enroll(newEnroll);
      alert('Customer enrolled in scheme successfully!');
      setActiveTab('COLLECT');
    } catch (err) {
      alert('Enrollment failed');
    }
  };

  const handlePayment = async (scheme: any) => {
    const amount = prompt(`Enter installment amount for ${scheme.scheme_name}:`, scheme.installment_amount);
    if (!amount) return;

    try {
      const res = await SchemeAPI.pay({
        customer_scheme_id: scheme.id,
        amount: parseFloat(amount),
        installment_no: (scheme.installments_paid || 0) + 1,
        payment_mode: 'CASH'
      });
      
      alert('Installment payment recorded!');
      
      // Setup receipt data for printing
      setReceiptData({
          ...res.data,
          amount: parseFloat(amount),
          installment_no: (scheme.installments_paid || 0) + 1,
          customer_name: scheme.customer_name,
          account_no: scheme.account_no,
          scheme_name: scheme.scheme_name,
          payment_mode: 'CASH'
      });
      setShowReceipt(true);
      
      handleSearch({ preventDefault: () => {} } as any); // Refresh
    } catch (err) {
      alert('Payment failed');
    }
  };

  const calculateMaturity = (startDate: string, duration: number) => {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + duration);
      return date.toLocaleDateString();
  };

  if (loading) return <div className="main-content">Loading Loyalty Engine...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Gold Savings & Chit Fund</h1>
          <p>Long-term customer loyalty and recurring deposit management.</p>
        </div>
        <div className="sub-nav no-print">
           <button className={`sub-nav-btn ${activeTab === 'COLLECT' ? 'active' : ''}`} onClick={() => setActiveTab('COLLECT')}><CreditCard size={16} /> Collect Installment</button>
           <button className={`sub-nav-btn ${activeTab === 'ENROLL' ? 'active' : ''}`} onClick={() => setActiveTab('ENROLL')}><Plus size={16} /> New Enrollment</button>
        </div>
      </header>

      {activeTab === 'ENROLL' && (
        <div className="scheme-section">
           <div className="data-table-container modal-like">
              <h3><User size={18} color="var(--primary)" /> Enroll Customer in Scheme</h3>
              <form onSubmit={handleEnroll} style={{ marginTop: '1.5rem' }}>
                 <div className="form-grid">
                    <div className="form-group"><label>Customer Name</label><input type="text" value={newEnroll.customer_name} onChange={e => setNewEnroll({...newEnroll, customer_name: e.target.value})} required /></div>
                    <div className="form-group"><label>Mobile Number</label><input type="text" value={newEnroll.customer_mobile} onChange={e => setNewEnroll({...newEnroll, customer_mobile: e.target.value})} required /></div>
                 </div>
                 <div className="form-group">
                    <label>Select Savings Plan</label>
                    <select value={newEnroll.scheme_id} onChange={e => setNewEnroll({...newEnroll, scheme_id: e.target.value})} required>
                       <option value="">Select a Plan</option>
                       {masters.map(m => <option key={m.id} value={m.id}>{m.name} (₹{m.installment_amount}/mo for {m.duration_months} mo)</option>)}
                    </select>
                 </div>
                 <div className="form-group"><label>Start Date</label><input type="date" value={newEnroll.start_date} onChange={e => setNewEnroll({...newEnroll, start_date: e.target.value})} /></div>
                 <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Initiate Scheme Enrollment</button>
              </form>
           </div>
        </div>
      )}

      {activeTab === 'COLLECT' && (
        <div className="scheme-section">
            <div className="data-table-container no-print" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
               <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0, flex: 1 }}>
                     <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                        <input 
                          type="text" value={searchQuery} 
                          onChange={e => setSearchQuery(e.target.value)} 
                          placeholder="Search Customer by Name, Mobile or A/c No..." 
                          style={{ paddingLeft: '2.5rem' }} 
                        />
                     </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Search Lifecycle</button>
               </form>
            </div>

           <div className="active-schemes-grid">
              {activeSchemes.map(s => (
                <div key={s.id} className="scheme-card">
                   <div className="scheme-header">
                      <div className="s-icon"><PiggyBank size={24} color="var(--primary)" /></div>
                      <div className="s-info">
                         <h4>{s.scheme_name}</h4>
                         <span>A/c: {s.account_no}</span>
                      </div>
                      <div className="s-status active">ACTIVE</div>
                   </div>
                                      <div className="scheme-body">
                       <div className="s-progress">
                          <div className="p-text">Progress: {s.installments_paid} / 11 Months</div>
                          <div className="p-bar"><div className="p-fill" style={{ width: `${(s.installments_paid/11)*100}%` }}></div></div>
                       </div>
                       <div className="s-stats">
                          <div className="stat"><span>Saved:</span> <strong>₹{s.total_saved?.toLocaleString() || '0'}</strong></div>
                          <div className="stat"><span>Next installment:</span> <strong>₹{s.installment_amount?.toLocaleString()}</strong></div>
                          <div className="stat" style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                             <span>Target Maturity:</span> <strong>{calculateMaturity(s.start_date, 12)}</strong>
                          </div>
                       </div>
                    </div>

                    <div className="scheme-footer">
                       <div className="btn-group">
                          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handlePayment(s)}>
                             <CreditCard size={14} /> Pay Now
                          </button>
                          <button className="btn" onClick={() => fetchPassbook(s)} title="View Passbook">
                             <History size={16} />
                          </button>
                       </div>
                    </div>
                 </div>
              ))}
              {searchQuery && activeSchemes.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1/-1', padding: '3rem', color: '#666' }}>No active schemes found for your search.</p>}
           </div>
        </div>
      )}

      <AnimatePresence>
        {showPassbook && selectedScheme && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-content" style={{ maxWidth: '800px' }}>
               <div className="modal-header">
                  <h3>Customer Passbook - {selectedScheme.account_no}</h3>
                  <button className="close-btn" onClick={() => setShowPassbook(false)}><X /></button>
               </div>
               <div className="passbook-info">
                  <div className="info-bit"><span>Member</span> <strong>{selectedScheme.customer_name}</strong></div>
                  <div className="info-bit"><span>Plan</span> <strong>{selectedScheme.scheme_name}</strong></div>
                  <div className="info-bit"><span>Total Saved</span> <strong style={{ color: 'var(--primary)' }}>₹{paymentHistory.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</strong></div>
               </div>
               <div className="passbook-table-container">
                  <table className="passbook-table">
                     <thead>
                        <tr>
                           <th>Date</th>
                           <th>Inst. No.</th>
                           <th>Receipt No.</th>
                           <th>Mode</th>
                           <th style={{ textAlign: 'right' }}>Amount</th>
                           <th className="no-print">Action</th>
                        </tr>
                     </thead>
                     <tbody>
                        {paymentHistory.map(p => (
                           <tr key={p.id}>
                              <td>{new Date(p.created_at).toLocaleDateString()}</td>
                              <td>Month {p.installment_no}</td>
                              <td>{p.receipt_no}</td>
                              <td>{p.payment_mode}</td>
                              <td style={{ textAlign: 'right' }}>₹{p.amount.toLocaleString()}</td>
                              <td className="no-print">
                                 <button className="btn-icon" onClick={() => {
                                    setReceiptData({...p, customer_name: selectedScheme.customer_name, account_no: selectedScheme.account_no, scheme_name: selectedScheme.scheme_name});
                                    setShowReceipt(true);
                                 }}><Printer size={14} /></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          </div>
        )}

        {showReceipt && receiptData && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '850px', background: 'white', color: 'black' }}>
               <div className="modal-header no-print">
                  <h3 style={{ color: 'black' }}>Digital Receipt Preview</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                     <button className="btn btn-primary" onClick={() => window.print()}><Printer size={18} /> Print Now</button>
                     <button className="close-btn" onClick={() => setShowReceipt(false)}><X color="black" /></button>
                  </div>
               </div>
               <div className="modal-body" style={{ background: 'white', padding: 0 }}>
                  <PrintSchemeReceipt receipt={receiptData} />
               </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .sub-nav { display: flex; gap: 0.5rem; background: var(--bg-card); padding: 6px; border-radius: 12px; border: 1px solid var(--border); }
        .sub-nav-btn { display: flex; align-items: center; gap: 8px; border: none; background: none; color: #888; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.3s; font-size: 0.9rem; font-weight: 500; }
        .sub-nav-btn.active { background: var(--primary); color: #000; font-weight: 700; }

        .scheme-section { max-width: 900px; margin: 0 auto; }
        .modal-like { padding: 2.5rem; max-width: 600px; margin: 0 auto; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

        .active-schemes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
        .scheme-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; padding: 1.5rem; }
        .scheme-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .s-icon { background: rgba(212,175,55,0.1); padding: 12px; border-radius: 12px; }
        .s-info h4 { margin: 0; font-size: 1.1rem; color: white; }
        .s-info span { font-size: 0.8rem; color: #666; font-family: monospace; }
        .s-status { margin-left: auto; font-size: 0.7rem; font-weight: 900; background: rgba(34,197,94,0.1); color: #22c55e; padding: 4px 8px; border-radius: 6px; }

        .s-progress { margin-bottom: 1.5rem; }
        .p-text { font-size: 0.8rem; color: #888; margin-bottom: 8px; }
        .p-bar { height: 8px; background: #222; border-radius: 4px; overflow: hidden; }
        .p-fill { height: 100%; background: var(--primary); transition: 0.5s; }

        .s-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 12px; margin-bottom: 1.5rem; }
        .btn-group { display: flex; gap: 8px; width: 100%; }
        
        .passbook-info { display: flex; gap: 2rem; padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 12px; margin-bottom: 1.5rem; }
        .info-bit { display: flex; flex-direction: column; gap: 4px; }
        .info-bit span { font-size: 0.7rem; color: #666; text-transform: uppercase; }
        .info-bit strong { font-size: 1rem; color: white; }

        .passbook-table-container { overflow-x: auto; }
        .passbook-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .passbook-table th { text-align: left; padding: 12px; border-bottom: 1px solid var(--border); color: #888; text-transform: uppercase; font-size: 0.7rem; }
        .passbook-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.02); color: #ccc; }

        @media print {
            .no-print { display: none !important; }
            .modal-overlay { background: white !important; display: block; overflow: visible; }
            .modal-content { border: none !important; box-shadow: none !important; width: 100% !important; max-width: none !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Schemes;
