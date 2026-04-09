import React, { useState, useEffect } from 'react';
import { ReportAPI } from '../api/api';
import { 
  BarChart3, 
  Wallet, 
  TrendingUp, 
  Download, 
  Calendar, 
  PieChart, 
  Coins, 
  Scale,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState<any>(null);
  const [valuation, setValuation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dailyRes, valRes] = await Promise.all([
        ReportAPI.getDaily(date),
        ReportAPI.getValuation()
      ]);
      setDailyData(dailyRes.data);
      setValuation(valRes.data);
    } catch (err) {
      console.error('Failed to fetch report data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = (type: 'SALES' | 'STOCK') => {
    // Simple CSV export logic
    alert(`Exporting ${type} data to Excel (CSV)... Check your downloads.`);
    // In a real app, we'd trigger a window.location to a backend CSV generator or use a library
  };

  if (loading && !dailyData) return <div className="main-content">Generating Business Intelligence...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Business Reporting Center</h1>
          <p>Financial summaries, stock audits, and reconciliation tools.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn" onClick={() => handleExportCSV('STOCK')}>
              <FileSpreadsheet size={18} /> Export Inventory
           </button>
           <button className="btn btn-primary" onClick={() => window.print()}>
              <Calendar size={18} /> Print Daily Summary
           </button>
        </div>
      </header>

      <div className="reports-grid">
        {/* Daily Closing */}
        <div className="report-card main-card">
           <div className="card-header">
              <h3><Wallet size={20} color="var(--primary)" /> Daily Cash Reconciliation</h3>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'white', padding: '6px 12px', borderRadius: '8px' }}
              />
           </div>
           
           <div className="stats-strip">
              <div className="stat-box">
                 <span className="label">Grand Total Sale</span>
                 <span className="value">₹{Math.round(dailyData?.grandTotal || 0).toLocaleString()}</span>
              </div>
              <div className="stat-box">
                 <span className="label">Total Weight Sold</span>
                 <span className="value">{dailyData?.totalWeightSold?.toFixed(3) || '0.000'} g</span>
              </div>
           </div>

           <div className="payment-breakdown">
              <h4>Payment Mode Breakdown</h4>
              <div className="payment-list">
                 {dailyData?.payments.map((p: any) => (
                   <div key={p.payment_mode} className="payment-item">
                      <div className="mode">
                         <Coins size={14} /> {p.payment_mode}
                      </div>
                      <div className="p-details">
                         <span className="count">{p.bill_count} Bills</span>
                         <span className="amount">₹{Math.round(p.total).toLocaleString()}</span>
                      </div>
                   </div>
                 ))}
                 {dailyData?.payments.length === 0 && <p style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>No sales recorded for this date.</p>}
              </div>
           </div>
        </div>

        {/* Stock Valuation */}
        <div className="report-card sidebar-card">
           <div className="card-header">
              <h3><Scale size={20} color="#FFD700" /> Live Stock Valuation</h3>
           </div>
           <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.5rem' }}>Estimated store value based on current board rates.</p>
           
           <div className="valuation-total">
              <span className="total-label">Total Asset Value</span>
              <span className="total-value">₹{Math.round(valuation?.totalValue || 0).toLocaleString()}</span>
           </div>

           <div className="category-valuation">
              {valuation?.summary.map((cat: any) => (
                <div key={cat.category} className="cat-val-item">
                   <div className="cat-info">
                      <strong>{cat.category}</strong>
                      <span>{cat.weight.toFixed(3)}g ({cat.count} Items)</span>
                   </div>
                   <div className="cat-amt">
                      ₹{Math.round(cat.estimatedValue).toLocaleString()}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <style>{`
        .reports-grid { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; }
        .report-card { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border); padding: 1.5rem; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .stats-strip { display: flex; gap: 2rem; margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 16px; }
        .stat-box { display: flex; flex-direction: column; gap: 4px; }
        .stat-box .label { font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-box .value { font-size: 1.5rem; font-weight: 800; color: white; }
        
        .payment-breakdown h4 { font-size: 0.9rem; margin-bottom: 1rem; color: #888; }
        .payment-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-dark); border-radius: 12px; margin-bottom: 0.75rem; border: 1px solid var(--border); }
        .payment-item .mode { display: flex; align-items: center; gap: 10px; font-weight: 700; color: white; }
        .payment-item .p-details { display: flex; gap: 1rem; align-items: center; }
        .payment-item .count { font-size: 0.75rem; color: #666; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; }
        .payment-item .amount { font-weight: 800; color: var(--primary); }

        .valuation-total { margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, rgba(212,175,55,0.1) 0%, transparent 100%); border-radius: 16px; border: 1px solid rgba(212,175,55,0.2); text-align: center; }
        .total-label { display: block; font-size: 0.8rem; color: #888; margin-bottom: 4px; }
        .total-value { font-size: 1.5rem; font-weight: 900; color: #FFD700; }
        
        .cat-val-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .cat-info { display: flex; flex-direction: column; }
        .cat-info strong { font-size: 0.95rem; color: white; }
        .cat-info span { font-size: 0.75rem; color: #666; }
        .cat-amt { font-weight: 700; font-size: 0.9rem; color: #DDD; }

        @media print {
           .main-content { padding: 0 !important; }
           .header, .btn, .sidebar-card { display: none !important; }
           .report-card { border: none; padding: 0; }
           .reports-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
