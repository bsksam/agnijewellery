import React, { useState, useEffect } from 'react';
import { BuybackAPI, DashboardAPI } from '../api/api';
import { 
  Scale, 
  Coins, 
  User, 
  Phone, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Printer, 
  X,
  CreditCard,
  Banknote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BuybackForm = () => {
  const [customer, setCustomer] = useState({ name: '', mobile: '' });
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ karat: '22K', weight: '', rate_applied: '' });
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CREDIT'>('CREDIT');
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successVoucher, setSuccessVoucher] = useState<string | null>(null);
  const [printFormat, setPrintFormat] = useState<'A4' | 'A5'>('A5');

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await DashboardAPI.getSummary(); // Rates often stored here or separate
      // Mocking rates if not in stats for demo robustness
      setRates([
        { karat: '24K', rate: 6800 },
        { karat: '22K', rate: 6250 },
        { karat: '18K', rate: 5100 }
      ]);
    } catch (e) { console.error(e); }
  };

  const addItem = () => {
    if (!newItem.weight || !newItem.rate_applied) return;
    const value = parseFloat(newItem.weight) * parseFloat(newItem.rate_applied);
    setItems([...items, { ...newItem, value }]);
    setNewItem({ karat: '22K', weight: '', rate_applied: '' });
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const totalWeight = items.reduce((a, b) => a + parseFloat(b.weight), 0);
  const totalValue = items.reduce((a, b) => a + b.value, 0);

  const handleSubmit = async () => {
    if (!customer.name || items.length === 0) return;
    setLoading(true);
    try {
      const res = await BuybackAPI.record({
        customer_name: customer.name,
        customer_mobile: customer.mobile,
        total_weight: totalWeight,
        total_value: totalValue,
        payment_mode: paymentMode,
        items
      });
      setSuccessVoucher(res.data.voucherId);
      setItems([]);
      setCustomer({ name: '', mobile: '' });
    } catch (e) {
      alert('Failed to record buyback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <div className="welcome-msg">
          <h1>Old Gold <span className="gold-text">Buyback & Exchange</span></h1>
          <p>Professional metal acquisition and customer credit management.</p>
        </div>
      </header>

      <div className="buyback-grid animate-fade-in">
        <div className="buyback-main">
           <div className="prestige-card-buyback">
              <div className="card-section">
                 <h3 className="section-title"><User size={16} /> Customer Identity</h3>
                 <div className="form-row">
                    <div className="form-group flex-1">
                       <label>Full Name</label>
                       <input 
                         type="text" 
                         value={customer.name} 
                         onChange={e => setCustomer({...customer, name: e.target.value})}
                         placeholder="Customer Name"
                       />
                    </div>
                    <div className="form-group flex-1">
                       <label>Mobile Number</label>
                       <input 
                         type="text" 
                         value={customer.mobile} 
                         onChange={e => setCustomer({...customer, mobile: e.target.value})}
                         placeholder="10-digit mobile"
                       />
                    </div>
                 </div>
              </div>

              <div className="card-separator"></div>

              <div className="card-section">
                 <h3 className="section-title"><Scale size={16} /> Weigh-in & Valuation</h3>
                 <div className="item-input-bar">
                    <select value={newItem.karat} onChange={e => setNewItem({...newItem, karat: e.target.value})}>
                       <option value="24K">24K (99.9)</option>
                       <option value="22K">22K (91.6)</option>
                       <option value="18K">18K (75.0)</option>
                    </select>
                    <input 
                       type="number" 
                       placeholder="Weight (g)"
                       value={newItem.weight}
                       onChange={e => setNewItem({...newItem, weight: e.target.value})}
                    />
                    <input 
                       type="number" 
                       placeholder="Rate / gram"
                       value={newItem.rate_applied}
                       onChange={e => setNewItem({...newItem, rate_applied: e.target.value})}
                    />
                    <button className="add-item-btn" onClick={addItem}><Plus size={18} /></button>
                 </div>

                 <div className="buyback-items-list">
                    {items.map((it, idx) => (
                       <div key={idx} className="buyback-item-row">
                          <div className="it-karat">{it.karat}</div>
                          <div className="it-weight">{it.weight}g</div>
                          <div className="it-rate">@ ₹{it.rate_applied}</div>
                          <div className="it-value">₹{Math.round(it.value).toLocaleString()}</div>
                          <button className="remove-btn" onClick={() => removeItem(idx)}><Trash2 size={14} /></button>
                       </div>
                    ))}
                    {items.length === 0 && <div className="empty-items">No items added to buyback.</div>}
                 </div>
              </div>
           </div>
        </div>

        <div className="buyback-sidebar">
           <div className="summary-card-elite">
              <h3 className="summary-title">Acquisition Summary</h3>
              
              <div className="summary-row">
                 <span>Total Net Weight</span>
                 <strong>{totalWeight.toFixed(3)} g</strong>
              </div>

              <div className="summary-row total">
                 <span>Gross Acquisition Value</span>
                 <strong className="gold-text">₹{Math.round(totalValue).toLocaleString()}</strong>
              </div>

              <div className="payment-mode-selector">
                 <label>Settlement Method</label>
                 <div className="mode-toggle">
                    <div 
                      className={`mode-option ${paymentMode === 'CREDIT' ? 'active' : ''}`}
                      onClick={() => setPaymentMode('CREDIT')}
                    >
                       <CreditCard size={16} />
                       <span>Exchange Credit</span>
                    </div>
                    <div 
                      className={`mode-option ${paymentMode === 'CASH' ? 'active' : ''}`}
                      onClick={() => setPaymentMode('CASH')}
                    >
                       <Banknote size={16} />
                       <span>Cash Settlement</span>
                    </div>
                 </div>
              </div>

              <button 
                className="btn-submit-buyback" 
                disabled={loading || items.length === 0}
                onClick={handleSubmit}
              >
                {loading ? 'Processing Acquisition...' : 'Generate Buyback Voucher'}
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
         {successVoucher && (
            <div className="modal-overlay">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`success-modal-buyback ${printFormat.toLowerCase()}`}>
                   <div className="success-icon no-print"><CheckCircle size={64} color="#22c55e" /></div>
                   <h2>Acquisition Successful</h2>
                   <p className="no-print">Buyback recorded and voucher generated.</p>
                   
                   <div className="format-selector-row no-print">
                      <button className={printFormat === 'A4' ? 'active' : ''} onClick={() => setPrintFormat('A4')}>A4</button>
                      <button className={printFormat === 'A5' ? 'active' : ''} onClick={() => setPrintFormat('A5')}>A5</button>
                   </div>

                   <div className="voucher-display">
                      <span className="v-label">Voucher Number</span>
                      <span className="v-id">{successVoucher}</span>
                   </div>
                   <div className="modal-actions-flex no-print">
                      <button className="btn-modal-print" onClick={() => window.print()}><Printer size={18} /> Print Voucher</button>
                      <button className="btn-modal-close" onClick={() => setSuccessVoucher(null)}>Done</button>
                   </div>
                </motion.div>
            </div>
         )}
      </AnimatePresence>

      <style>{`
        .buyback-grid { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; }
        .prestige-card-buyback { background: rgba(20,20,20,0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 32px; backdrop-filter: blur(20px); overflow: hidden; }
        .card-section { padding: 2.5rem; }
        .section-title { font-size: 0.8rem; font-weight: 800; color: #555; text-transform: uppercase; letter-spacing: 1.5px; display: flex; align-items: center; gap: 10px; margin-bottom: 2rem; }
        .card-separator { height: 1px; background: rgba(255,255,255,0.03); }

        .form-row { display: flex; gap: 1.5rem; }
        .form-group label { display: block; font-size: 0.75rem; color: #888; font-weight: 700; margin-bottom: 0.5rem; }
        .form-group input, .form-group select { width: 100%; background: #000; border: 1px solid #222; padding: 0.8rem 1rem; border-radius: 12px; color: white; transition: 0.3s; }
        .form-group input:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 15px rgba(212,175,55,0.1); }

        .item-input-bar { display: flex; gap: 10px; background: #000; padding: 10px; border-radius: 16px; border: 1px solid #222; margin-bottom: 2rem; }
        .item-input-bar select, .item-input-bar input { background: none; border: none; padding: 0.5rem; color: white; }
        .item-input-bar input { border-left: 1px solid #222; padding-left: 1rem; }
        .add-item-btn { background: var(--primary); color: black; border: none; width: 44px; height: 44px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .add-item-btn:hover { transform: scale(1.05); }

        .buyback-items-list { display: flex; flex-direction: column; gap: 10px; }
        .buyback-item-row { display: flex; align-items: center; background: rgba(255,255,255,0.02); padding: 1rem 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.03); }
        .it-karat { width: 60px; font-weight: 900; color: var(--primary); }
        .it-weight { flex: 1; font-weight: 700; }
        .it-rate { flex: 1; color: #666; font-size: 0.85rem; }
        .it-value { font-weight: 800; color: #eee; }
        .remove-btn { color: #555; margin-left: 1rem; cursor: pointer; transition: 0.2s; }
        .remove-btn:hover { color: #ef4444; }
        .empty-items { text-align: center; padding: 2rem; color: #333; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 2px; }

        .summary-card-elite { background: #000; border: 1px solid #D4AF3733; border-radius: 32px; padding: 2.5rem; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
        .summary-title { font-size: 1.1rem; margin-bottom: 2rem; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: #888; font-size: 0.9rem; }
        .summary-row.total { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(212,175,55,0.2); color: white; font-size: 1.25rem; }

        .payment-mode-selector { margin-top: 2.5rem; }
        .payment-mode-selector label { font-size: 0.7rem; color: #555; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; margin-bottom: 1rem; display: block; }
        .mode-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: rgba(255,255,255,0.03); padding: 5px; border-radius: 14px; }
        .mode-option { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px; cursor: pointer; border-radius: 10px; color: #444; transition: 0.3s; }
        .mode-option span { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; }
        .mode-option.active { background: #111; color: var(--primary); border: 1px solid rgba(212,175,55,0.3); }

        .btn-submit-buyback { width: 100%; margin-top: 2rem; background: var(--primary); color: black; border: none; padding: 1.25rem; border-radius: 16px; font-weight: 800; font-size: 1rem; cursor: pointer; transition: 0.3s; }
        .btn-submit-buyback:disabled { opacity: 0.3; cursor: not-allowed; }

        .success-modal-buyback { background: #111; border: 1px solid #22c55e33; border-radius: 40px; padding: 3rem; text-align: center; width: 100%; max-width: 480px; }
        .voucher-display { background: #000; border: 2px dashed #333; padding: 1.5rem; border-radius: 20px; margin: 2rem 0; display: flex; flex-direction: column; gap: 5px; }
        .v-label { font-size: 0.7rem; color: #555; font-weight: 800; text-transform: uppercase; }
        .v-id { font-size: 1.5rem; font-weight: 900; color: var(--primary); font-family: 'Courier New', monospace; }
        .modal-actions-flex { display: flex; gap: 1rem; }
        .btn-modal-print { flex: 2; background: #fff; color: #000; border: none; padding: 1rem; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .btn-modal-close { flex: 1; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 1rem; border-radius: 14px; font-weight: 800; cursor: pointer; }

        .format-selector-row { display: flex; justify-content: center; gap: 10px; margin-bottom: 1.5rem; background: #000; padding: 4px; border-radius: 10px; border: 1px solid #333; }
        .format-selector-row button { background: none; border: none; color: #666; padding: 6px 15px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 800; }
        .format-selector-row button.active { background: var(--primary); color: #000; }

        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .modal-overlay { background: none !important; position: static !important; }
          .success-modal-buyback { 
            position: absolute !important; 
            top: 0 !important; 
            left: 0 !important; 
            width: 100% !important; 
            max-width: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .success-modal-buyback h2 { font-size: 1.2rem !important; color: black !important; margin-bottom: 20px; }
          .voucher-display { border: 1px solid #000 !important; color: black !important; padding: 40px !important; }
          .v-label { color: black !important; }
          .v-id { color: black !important; font-size: 2rem !important; }

          .success-modal-buyback.a4 { width: 210mm; height: 297mm; }
          .success-modal-buyback.a5 { width: 148mm; height: 210mm; }

          @page { size: auto; margin: 10mm; }
        }
      `}</style>
    </div>
  );
};

export default BuybackForm;
