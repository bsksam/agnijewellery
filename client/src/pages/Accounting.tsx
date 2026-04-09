import React, { useState, useEffect } from 'react';
import { AccountingAPI } from '../api/api';
import { 
  Library, 
  BookOpen, 
  Scale, 
  Calculator, 
  Receipt, 
  Plus, 
  Download, 
  Calendar,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  FileSpreadsheet,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Accounting = () => {
  const [activeSubTab, setActiveSubTab] = useState<'DAYBOOK' | 'TB' | 'EXPENSE' | 'GSTR'>('DAYBOOK');
  const [daybook, setDaybook] = useState<any[]>([]);
  const [tb, setTb] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [gstrData, setGstrData] = useState<any[]>([]);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: '', description: '', ledger_id: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeSubTab, date, month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'DAYBOOK') {
        const res = await AccountingAPI.getDaybook(date);
        setDaybook(res.data);
      } else if (activeSubTab === 'TB') {
        const res = await AccountingAPI.getTrialBalance();
        setTb(res.data);
      } else if (activeSubTab === 'EXPENSE') {
        const [expRes, ledgeRes] = await Promise.all([
          AccountingAPI.getExpenses(),
          AccountingAPI.getLedgers()
        ]);
        setExpenses(expRes.data);
        setLedgers(ledgeRes.data);
      } else if (activeSubTab === 'GSTR') {
        const res = await AccountingAPI.getGSTR1(month, year);
        setGstrData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch accounting data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AccountingAPI.addExpense(newExpense);
      setShowExpenseModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to save expense');
    }
  };

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Financial Accounting Suite</h1>
          <p>Daybook, Trial Balance, P&L, and GSTR Tax Compliance.</p>
        </div>
        <div className="sub-nav no-print">
           <button className={`sub-nav-btn ${activeSubTab === 'DAYBOOK' ? 'active' : ''}`} onClick={() => setActiveSubTab('DAYBOOK')}><BookOpen size={16} /> Daybook</button>
           <button className={`sub-nav-btn ${activeSubTab === 'TB' ? 'active' : ''}`} onClick={() => setActiveSubTab('TB')}><Library size={16} /> Trial Balance</button>
           <button className={`sub-nav-btn ${activeSubTab === 'EXPENSE' ? 'active' : ''}`} onClick={() => setActiveSubTab('EXPENSE')}><Wallet size={16} /> Expenses</button>
           <button className={`sub-nav-btn ${activeSubTab === 'GSTR' ? 'active' : ''}`} onClick={() => setActiveSubTab('GSTR')}><Receipt size={16} /> GSTR-1</button>
        </div>
      </header>

      {/* DAYBOOK TAB */}
      {activeSubTab === 'DAYBOOK' && (
        <div className="accounting-section">
           <div className="table-header-simple">
              <h3>Unified Daybook</h3>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
           </div>
           <div className="data-table-container">
              <table className="custom-table">
                 <thead>
                    <tr>
                       <th>Type</th>
                       <th>Ref / Bill No</th>
                       <th>Description</th>
                       <th style={{ textAlign: 'right' }}>Debit (Out)</th>
                       <th style={{ textAlign: 'right' }}>Credit (In)</th>
                    </tr>
                 </thead>
                 <tbody>
                    {daybook.map((tx, idx) => (
                      <tr key={idx}>
                         <td><span className={`type-tag ${tx.type === 'SALE' ? 'in' : 'out'}`}>{tx.type}</span></td>
                         <td><strong>{tx.ref}</strong></td>
                         <td>{tx.name}</td>
                         <td style={{ textAlign: 'right', color: '#ef4444' }}>{tx.type === 'EXPENSE' ? `₹${tx.amount.toLocaleString()}` : '-'}</td>
                         <td style={{ textAlign: 'right', color: '#22c55e' }}>{tx.type === 'SALE' ? `₹${tx.amount.toLocaleString()}` : '-'}</td>
                      </tr>
                    ))}
                    {daybook.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>No transactions recorded for this date.</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* TRIAL BALANCE TAB */}
      {activeSubTab === 'TB' && tb && (
        <div className="accounting-section">
           <div className="reports-grid">
              <div className="data-table-container tb-table">
                 <h3>Debits (Expenses & Assets)</h3>
                 <table className="custom-table smaller">
                    <tbody>
                       {tb.expenses.map((e: any, i: number) => (
                         <tr key={i}>
                            <td>{e.name}</td>
                            <td style={{ textAlign: 'right' }}>₹{Math.round(e.amount).toLocaleString()}</td>
                         </tr>
                       ))}
                       <tr className="total-row">
                          <td>Total Debits</td>
                          <td style={{ textAlign: 'right' }}>₹{Math.round(tb.expenses.reduce((a:any,b:any)=>a+b.amount,0)).toLocaleString()}</td>
                       </tr>
                    </tbody>
                 </table>
              </div>
              <div className="data-table-container tb-table">
                 <h3>Credits (Income & Liabilities)</h3>
                 <table className="custom-table smaller">
                    <tbody>
                       {tb.income.map((e: any, i: number) => (
                         <tr key={i}>
                            <td>{e.name}</td>
                            <td style={{ textAlign: 'right' }}>₹{Math.round(e.amount).toLocaleString()}</td>
                         </tr>
                       ))}
                       {tb.liabilities.map((e: any, i: number) => (
                         <tr key={i}>
                            <td>{e.name}</td>
                            <td style={{ textAlign: 'right' }}>₹{Math.round(e.amount).toLocaleString()}</td>
                         </tr>
                       ))}
                       <tr className="total-row">
                          <td>Total Credits</td>
                          <td style={{ textAlign: 'right' }}>₹{Math.round(tb.income.reduce((a:any,b:any)=>a+b.amount,0) + tb.liabilities.reduce((a:any,b:any)=>a+b.amount,0)).toLocaleString()}</td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* EXPENSE TAB */}
      {activeSubTab === 'EXPENSE' && (
        <div className="accounting-section">
           <div className="table-header-simple">
              <h3>Voucher Records</h3>
              <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}><Plus size={16} /> New Expense Voucher</button>
           </div>
           <div className="data-table-container">
              <table className="custom-table">
                 <thead>
                    <tr>
                       <th>Date</th>
                       <th>Ledger Account</th>
                       <th>Description</th>
                       <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                 </thead>
                 <tbody>
                    {expenses.map((e, idx) => (
                      <tr key={idx}>
                         <td>{new Date(e.exp_date).toLocaleDateString()}</td>
                         <td><strong>{e.ledger_name}</strong></td>
                         <td>{e.description}</td>
                         <td style={{ textAlign: 'right', fontWeight: 800 }}>₹{Math.round(e.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* GSTR-1 TAB */}
      {activeSubTab === 'GSTR' && (
         <div className="accounting-section">
            <div className="table-header-simple">
               <h3>GSTR-1 Monthly Sales Detail</h3>
               <div style={{ display: 'flex', gap: '1rem' }}>
                  <select value={month} onChange={e => setMonth(e.target.value)} style={{ width: '120px' }}>
                     <option value="01">January</option><option value="02">February</option><option value="03">March</option><option value="04">April</option>
                     <option value="05">May</option><option value="06">June</option><option value="07">July</option><option value="08">August</option>
                     <option value="09">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option>
                  </select>
                  <input type="number" value={year} onChange={e => setYear(e.target.value)} style={{ width: '100px' }} />
                  <button className="btn"><Download size={16} /> Export CSV</button>
               </div>
            </div>
            <div className="data-table-container">
               <table className="custom-table smaller">
                  <thead>
                     <tr>
                        <th>Bill Date</th>
                        <th>Invoice No</th>
                        <th>Consumer Name</th>
                        <th style={{ textAlign: 'right' }}>Taxable Value</th>
                        <th style={{ textAlign: 'right' }}>GST (3%)</th>
                        <th style={{ textAlign: 'right' }}>Invoice Value</th>
                     </tr>
                  </thead>
                  <tbody>
                     {gstrData.map((row, i) => (
                        <tr key={i}>
                           <td>{new Date(row.bill_date).toLocaleDateString()}</td>
                           <td>{row.bill_no}</td>
                           <td>{row.customer_name || 'B2C Consumer'}</td>
                           <td style={{ textAlign: 'right' }}>₹{Math.round(row.gross_amount).toLocaleString()}</td>
                           <td style={{ textAlign: 'right' }}>₹{Math.round(row.tax_amount).toLocaleString()}</td>
                           <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{Math.round(row.net_amount).toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* EXPENSE MODAL */}
      <AnimatePresence>
        {showExpenseModal && (
          <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="modal-content" onClick={e => e.stopPropagation()}>
               <div className="modal-header">
                  <h3>New Expense Voucher</h3>
                  <button className="close-btn" onClick={() => setShowExpenseModal(false)}>×</button>
               </div>
               <form onSubmit={handleAddExpense} className="modal-body">
                  <div className="form-group">
                     <label>Expense Date</label>
                     <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} required />
                  </div>
                  <div className="form-group">
                     <label>Account / Ledger</label>
                     <select value={newExpense.ledger_id} onChange={e => setNewExpense({...newExpense, ledger_id: e.target.value})} required>
                        <option value="">Select Ledger</option>
                        {ledgers.filter(l => l.group_name === 'EXPENSES').map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                     </select>
                  </div>
                  <div className="form-group">
                     <label>Amount (₹)</label>
                     <input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} required placeholder="0.00" />
                  </div>
                  <div className="form-group">
                     <label>Narrations / Description</label>
                     <textarea rows={3} value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} placeholder="e.g. Paid Monthly Shop Rent" required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Record Transaction</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .sub-nav { display: flex; gap: 0.5rem; background: var(--bg-card); padding: 6px; border-radius: 12px; border: 1px solid var(--border); }
        .sub-nav-btn { display: flex; align-items: center; gap: 8px; border: none; background: none; color: #888; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.3s; font-size: 0.9rem; font-weight: 500; }
        .sub-nav-btn.active { background: var(--primary); color: #000; font-weight: 700; }
        
        .type-tag { padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; }
        .type-tag.in { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .type-tag.out { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .reports-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .tb-table h3 { font-size: 0.9rem; color: #888; margin-bottom: 1rem; padding-left: 1rem; }
        .total-row { background: rgba(255,255,255,0.03); font-weight: 800; color: white; border-top: 2px solid var(--border); }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; width: 400px; padding: 2rem; }
        
        .table-header-simple { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .table-header-simple h3 { font-size: 1.25rem; font-weight: 800; }
        .table-header-simple input, .table-header-simple select { background: var(--bg-dark); border: 1px solid var(--border); color: white; padding: 8px 12px; border-radius: 8px; }

        @media print {
            .sub-nav, .btn, .header p, .welcome-msg h1 { display: none !important; }
            .header { margin-bottom: 2rem !important; border-bottom: 2px solid #000; padding-bottom: 1rem; }
            .main-content { padding: 0 !important; color: black !important; }
            .data-table-container { border: none !important; background: none !important; box-shadow: none !important; }
            .custom-table th, .custom-table td { color: black !important; border: 1px solid #ddd !important; }
        }
      `}</style>
    </div>
  );
};

export default Accounting;
