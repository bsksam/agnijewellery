import React, { useState, useEffect } from 'react';
import { SettingsAPI } from '../api/api';
import { QRCodeSVG } from 'qrcode.react';

interface PrintInvoiceProps {
  sale: any;
  paperFormat?: 'A4' | 'A5';
}

const PrintInvoice: React.FC<PrintInvoiceProps> = ({ sale, paperFormat = 'A4' }) => {
  const [details, setDetails] = useState({
    shop_name: "AGNI JEWELLERY",
    shop_address: "123 Jewel Lane, Gold Bazaar, Chennai, TN - 600001",
    shop_phone: "+91 98765 43210",
    shop_gstin: "33AAAAA0000A1Z5",
    upi_id: "",
    invoice_terms: "1. Goods once sold will not be taken back. 2. Subject to local jurisdiction."
  });

  const [exchangeList, setExchangeList] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
    if (sale.exchange_details) {
      try {
        setExchangeList(JSON.parse(sale.exchange_details));
      } catch (e) {
        console.error("Failed to parse exchange details", e);
      }
    }
  }, [sale]);

  const fetchSettings = async () => {
    try {
      const res = await SettingsAPI.get();
      setDetails(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to load shop settings for print', err);
    }
  };

  const amountInWords = (num: number) => {
    return "Rupees " + Math.round(num).toLocaleString() + " Only";
  };

  // Generate UPI Payment URI
  const upiUri = details.upi_id && sale.net_amount > 0 ? 
    `upi://pay?pa=${details.upi_id}&pn=${encodeURIComponent(details.shop_name)}&am=${Math.round(sale.net_amount)}&tn=${sale.bill_no}&cu=INR` 
    : null;

  return (
    <div className={`print-invoice-container ${paperFormat.toLowerCase()}`}>
      <div className="invoice-header">
        <div className="shop-info">
          <h2>{details.shop_name}</h2>
          <p>{details.shop_address}</p>
          <p>Ph: {details.shop_phone} | GSTIN: {details.shop_gstin}</p>
        </div>
        <div className="bill-info">
          <h3>RETAIL INVOICE</h3>
          <p><strong>Bill No:</strong> {sale.bill_no}</p>
          <p><strong>Date:</strong> {new Date(sale.bill_date || Date.now()).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="customer-info-section">
        <p><strong>Customer:</strong> {sale.customer_name || 'Cash Customer'}</p>
        <p><strong>Mobile:</strong> {sale.customer_mobile || '-'}</p>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Product / Tag</th>
            <th>HUID</th>
            <th>Weight (g)</th>
            <th>Rate</th>
            <th>Wastage %</th>
            <th>MC</th>
            <th>Stone</th>
            <th>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item: any, idx: number) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{item.product_name} ({item.tag_no})</td>
              <td>{item.huid1 || '-'}</td>
              <td>{item.weight.toFixed(3)}</td>
              <td>{item.rate.toLocaleString()}</td>
              <td>{item.wastage}%</td>
              <td>{item.mc.toLocaleString()}</td>
              <td>{item.stone_value.toLocaleString()}</td>
              <td style={{ textAlign: 'right' }}>{Math.round(item.total_amount).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {exchangeList.length > 0 && (
        <div className="exchange-print-section">
           <p><strong>Old Gold Received (Exchange Items):</strong></p>
           <table className="exchange-table">
              <thead>
                 <tr>
                    <th>Item Description</th>
                    <th>Weight (g)</th>
                    <th>Touch %</th>
                    <th>Rate/g</th>
                    <th>Value (₹)</th>
                 </tr>
              </thead>
              <tbody>
                 {exchangeList.map((ex, i) => (
                   <tr key={i}>
                      <td>{ex.description}</td>
                      <td>{ex.weight}g</td>
                      <td>{ex.touch}%</td>
                      <td>{ex.rate}</td>
                      <td style={{ textAlign: 'right' }}>{Math.round((parseFloat(ex.weight)||0) * (parseFloat(ex.touch)/100) * (parseFloat(ex.rate)||0)).toLocaleString()}</td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      <div className="financial-summary">
        <div className="summary-left">
          <p><strong>Amount in Words:</strong></p>
          <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{amountInWords(sale.net_amount)}</p>
          
          <div className="payment-qr-section">
            {upiUri && (
              <div className="upi-qr-box">
                <QRCodeSVG value={upiUri} size={80} />
                <div className="upi-text">
                   <span>Scan to Pay</span>
                   <strong>₹{Math.round(sale.net_amount).toLocaleString()}</strong>
                </div>
              </div>
            )}
            <div className="terms">
              <p><strong>Terms & Conditions:</strong></p>
              <div style={{ whiteSpace: 'pre-line' }}>{details.invoice_terms}</div>
            </div>
          </div>
        </div>
        <div className="summary-right">
          <div className="amount-row"><span>Gross Total:</span> <span>₹{Math.round(sale.gross_amount).toLocaleString()}</span></div>
          <div className="amount-row"><span>GST (3%):</span> <span>₹{Math.round(sale.tax_amount).toLocaleString()}</span></div>
          <div className="amount-row"><span>Discount:</span> <span>₹{Math.round(sale.discount_amount || 0).toLocaleString()}</span></div>
          {sale.exchange_amount > 0 && (
            <div className="amount-row" style={{ color: '#d00', fontWeight: 600 }}>
                <span>Old Gold SWAP (-):</span> 
                <span>₹{Math.round(sale.exchange_amount).toLocaleString()}</span>
            </div>
          )}
          <div className="amount-row grand-total"><span>{sale.net_amount < 0 ? 'Refund Amount:' : 'Net Payable:'}</span> <span>₹{Math.abs(Math.round(sale.net_amount)).toLocaleString()}</span></div>
        </div>
      </div>

      <div className="signatures">
        <div className="sig-box">Customer Signature</div>
        <div className="sig-box">For {details.shop_name}</div>
      </div>

      <style>{`
        .print-invoice-container {
          padding: 30px;
          color: black;
          background: white;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          line-height: 1.5;
          margin: 0 auto;
        }

        /* Format Scaling */
        .print-invoice-container.a4 { width: 210mm; min-height: 297mm; }
        .print-invoice-container.a5 { 
          width: 148mm; 
          min-height: 210mm; 
          font-size: 9px; 
          padding: 15px;
        }
        .print-invoice-container.a5 h2 { font-size: 1.1rem; }
        .print-invoice-container.a5 .shop-info p { font-size: 8px; }
        .print-invoice-container.a5 .bill-info h3 { font-size: 0.9rem; }
        .print-invoice-container.a5 .print-table th, .print-invoice-container.a5 td { padding: 4px; font-size: 8px; }
        .print-invoice-container.a5 .upi-qr-box { padding: 4px; }
        .print-invoice-container.a5 .upi-qr-box svg { width: 50px !important; height: 50px !important; }

        .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
        .shop-info h2 { margin: 0 0 5px 0; font-size: 1.5rem; color: #000; }
        .bill-info { text-align: right; }
        .bill-info h3 { margin: 0 0 5px 0; font-size: 1.2rem; color: #000; border-bottom: 1px solid #ddd; display: inline-block; }
        .customer-info-section { margin-bottom: 25px; border: 1px solid #eee; padding: 12px; background: #fafafa; }
        .print-table, .exchange-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .print-table th, .print-table td, .exchange-table th, .exchange-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .print-table th, .exchange-table th { background: #f9f9f9; font-weight: bold; }
        
        .exchange-print-section { margin-bottom: 15px; padding: 8px; border: 1px dashed #666; border-radius: 6px; }
        .exchange-print-section p { margin-top: 0; font-size: 0.8rem; }
        
        .financial-summary { display: flex; justify-content: space-between; margin-top: 20px; }
        .summary-left { width: 55%; }
        .summary-right { width: 40%; }
        .amount-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f1f1; }
        .grand-total { border-top: 2px solid #000; font-weight: bold; font-size: 14px; padding-top: 10px; border-bottom: none; }
        
        .payment-qr-section { display: flex; gap: 15px; margin-top: 15px; align-items: flex-start; }
        .upi-qr-box { border: 1px solid #eee; padding: 6px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .upi-text { text-align: center; font-size: 7px; }
        .upi-text strong { display: block; font-size: 9px; color: #000; }

        .terms { font-size: 8px; color: #444; border-top: 1px dashed #ccc; padding-top: 5px; flex: 1; line-height: 1.2; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
        .sig-box { border-top: 1px solid #000; width: 120px; text-align: center; padding-top: 5px; font-weight: bold; font-size: 9px; }
        
        @media print {
          body * { visibility: hidden; }
          .print-invoice-container, .print-invoice-container * { visibility: visible; }
          .print-invoice-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; box-shadow: none !important; }
          @page { size: auto; margin: 5mm; }
        }
      `}</style>
    </div>
  );
};

export default PrintInvoice;
