import React, { useState, useEffect } from 'react';
import { TaxAPI } from '../api/api';
import { 
  FileSpreadsheet, 
  Download, 
  Table as TableIcon, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Calculator,
  ShieldCheck,
  Scale,
  Gem,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';

const TaxHub = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchTaxData();
  }, [month, year]);

  const fetchTaxData = async () => {
    try {
      setLoading(true);
      const res = await TaxAPI.getGSTR1(month.toString(), year.toString());
      setData(res.data);
    } catch (err) {
      console.error('Failed to load tax data', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!data) return;

    // 1. Prepare B2CS (Retail) Data
    const b2csData = data.sales
      .filter((s: any) => !s.customer_gstin)
      .map((s: any) => ({
        "Voucher No": s.bill_no,
        "Voucher Date": new Date(s.bill_date).toLocaleDateString(),
        "Customer Name": s.customer_name || 'Cash Customer',
        "Taxable Value": Math.round(s.net_amount - s.tax_amount),
        "CGST (1.5%)": Math.round(s.tax_amount / 2),
        "SGST (1.5%)": Math.round(s.tax_amount / 2),
        "Total Invoice Value": Math.round(s.net_amount)
      }));

    // 2. Prepare HSN Summary Data
    const hsnData = data.hsnSummary.map((h: any) => ({
      "HSN Code": h.hsn_code,
      "Description": h.category_name,
      "UQC": "GMS",
      "Total Quantity": h.total_weight.toFixed(3),
      "Total Taxable Value": Math.round(h.total_value - h.total_tax),
      "Central Tax": Math.round(h.total_tax / 2),
      "State/UT Tax": Math.round(h.total_tax / 2)
    }));

    // Create Workbook
    const wb = XLSX.utils.book_new();
    
    const wsB2CS = XLSX.utils.json_to_sheet(b2csData);
    XLSX.utils.book_append_sheet(wb, wsB2CS, "B2CS (Retail)");

    const wsHSN = XLSX.utils.json_to_sheet(hsnData);
    XLSX.utils.book_append_sheet(wb, wsHSN, "HSN Summary");

    // Export
    XLSX.writeFile(wb, `GSTR1_${months[month - 1]}_${year}.xlsx`);
  };

  if (loading && !data) return <div className="main-content">Calculating GST Audit...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>GSTR-1 Automated Tax Hub</h1>
          <p>Government-ready compliance and HSN summarized fiscal reporting.</p>
        </div>
        <div className="tax-controls no-print">
           <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
              {months.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
           </select>
           <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
           </select>
           <button className="btn btn-primary" onClick={exportToExcel}>
              <Download size={18} /> Export GSTR-1 Excel
           </button>
        </div>
      </header>

      {data && (
        <div className="tax-dashboard">
           <div className="stats-grid">
              <div className="stat-card">
                 <div className="stat-header"><Calculator size={18} color="#D4AF37" /> <span>Total Turnover (GST Inc.)</span></div>
                 <div className="stat-value">₹{Math.round(data.sales.reduce((acc: any, s: any) => acc + s.net_amount, 0)).toLocaleString()}</div>
              </div>
              <div className="stat-card">
                 <div className="stat-header"><ShieldCheck size={18} color="#22c55e" /> <span>Liability (CGST + SGST)</span></div>
                 <div className="stat-value">₹{Math.round(data.sales.reduce((acc: any, s: any) => acc + s.tax_amount, 0)).toLocaleString()}</div>
              </div>
              <div className="stat-card">
                 <div className="stat-header"><Scale size={18} color="#D4AF37" /> <span>Total Pure Gold Weight Sold</span></div>
                 <div className="stat-value">{data.hsnSummary.reduce((acc: any, h: any) => acc + h.total_weight, 0).toFixed(3)}g</div>
              </div>
           </div>

           <div className="tax-sections">
              <div className="tax-panel full-width">
                 <h3><TableIcon size={18} /> HSN Wise Summary (Mandatory for GSTR-1)</h3>
                 <table className="custom-table" style={{ marginTop: '1rem' }}>
                    <thead>
                       <tr>
                          <th>HSN Code</th>
                          <th>Category Description</th>
                          <th>Weight (g)</th>
                          <th>Total Taxable Val (₹)</th>
                          <th>Central Tax (₹)</th>
                          <th>State Tax (₹)</th>
                          <th>Total GST (₹)</th>
                       </tr>
                    </thead>
                    <tbody>
                       {data.hsnSummary.map((h: any) => (
                         <tr key={h.hsn_code}>
                            <td style={{ fontWeight: 800 }}>{h.hsn_code}</td>
                            <td style={{ color: '#aaa', fontSize: '0.8rem' }}>{h.category_name}</td>
                            <td>{h.total_weight?.toFixed(3) || '0.000'}g</td>
                            <td>₹{Math.round(h.total_value - h.total_tax).toLocaleString()}</td>
                            <td>₹{Math.round(h.total_tax / 2).toLocaleString()}</td>
                            <td>₹{Math.round(h.total_tax / 2).toLocaleString()}</td>
                            <td style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{Math.round(h.total_tax).toLocaleString()}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              <div className="tax-panel">
                 <h3><Gem size={18} /> B2B Registry (GST Registered)</h3>
                 <div className="scroll-table-container">
                    <table className="custom-table">
                       <thead>
                          <tr>
                             <th>Voucher</th>
                             <th>Customer</th>
                             <th>GSTIN</th>
                             <th>Value</th>
                          </tr>
                       </thead>
                       <tbody>
                          {data.sales.filter((s: any) => s.customer_gstin).map((s: any) => (
                            <tr key={s.bill_no}>
                               <td>{s.bill_no}</td>
                               <td>{s.customer_name}</td>
                               <td className="gst-font">{s.customer_gstin}</td>
                               <td>₹{Math.round(s.net_amount).toLocaleString()}</td>
                            </tr>
                          ))}
                          {data.sales.filter((s: any) => s.customer_gstin).length === 0 && <tr><td colSpan={4} className="text-center">No B2B sales this month</td></tr>}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="tax-panel">
                 <h3><ShieldCheck size={18} /> GSTIN Validator Tool</h3>
                 <div className="gst-validator">
                    <input 
                       type="text" 
                       placeholder="Enter GSTIN (e.g. 33AAAAA0000A1Z5)" 
                       onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                          const target = document.getElementById('gst-result');
                          if (!target) return;
                          if (val.length === 0) target.innerText = '';
                          else if (regex.test(val)) {
                             target.innerText = '✅ VALID STRUCTURE';
                             target.style.color = '#22c55e';
                          } else {
                             target.innerText = '❌ INVALID FORMAT';
                             target.style.color = '#ef4444';
                          }
                       }}
                    />
                    <div id="gst-result" style={{ fontSize: '0.7rem', fontWeight: 800, marginTop: '8px' }}></div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .tax-controls { display: flex; gap: 1rem; }
        .tax-controls select { background: #111; border: 1px solid var(--border); color: white; padding: 0.5rem 1rem; border-radius: 12px; font-family: 'Outfit', sans-serif; cursor: pointer; }
        
        .tax-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem; }
        .tax-panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 1.5rem; }
        .tax-panel.full-width { grid-column: span 2; }
        .tax-panel h3 { display: flex; align-items: center; gap: 10px; font-size: 1.1rem; color: white; margin-bottom: 1.5rem; }
        
        .gst-validator input { width: 100%; background: #000; border: 1px solid var(--border); padding: 1rem; border-radius: 12px; color: var(--primary); font-family: monospace; font-size: 1rem; }
        .gst-font { font-family: monospace; letter-spacing: 1px; color: #D4AF37; font-size: 0.8rem; }
        .text-center { text-align: center; color: #444; font-style: italic; }
        .scroll-table-container { max-height: 250px; overflow-y: auto; }
      `}</style>
    </div>
  );
};

export default TaxHub;
