import React, { useState, useEffect } from 'react';
import { SettingsAPI } from '../api/api';

interface PrintSchemeReceiptProps {
  receipt: any;
}

const PrintSchemeReceipt: React.FC<PrintSchemeReceiptProps> = ({ receipt }) => {
  const [details, setDetails] = useState({
    shop_name: "AGNI JEWELLERY",
    shop_address: "123 Jewel Lane, Gold Bazaar, Chennai, TN - 600001",
    shop_phone: "+91 98765 43210",
    shop_gstin: "33AAAAA0000A1Z5",
    invoice_terms: "1. Advance once paid is non-refundable. 2. Gold rate at maturity will be as per market standard. 3. Please bring this receipt for every installment."
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await SettingsAPI.get();
      setDetails(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to load shop settings for scheme receipt', err);
    }
  };

  return (
    <div className="print-receipt-card">
      <div className="print-header">
        <div className="shop-info">
          <h2>{details.shop_name}</h2>
          <p>{details.shop_address}</p>
          <p>Ph: {details.shop_phone} | GSTIN: {details.shop_gstin}</p>
        </div>
        <div className="card-type">
          <h3>LOYALTY SCHEME RECEIPT</h3>
          <p className="receipt-id">No: {receipt.receipt_no}</p>
          <p className="date">Date: {new Date(receipt.created_at || Date.now()).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="customer-info">
         <div className="info-row"><span>Account No:</span> <strong>{receipt.account_no}</strong></div>
         <div className="info-row"><span>Customer Name:</span> <strong>{receipt.customer_name}</strong></div>
         <div className="info-row"><span>Scheme Plan:</span> <strong>{receipt.scheme_name}</strong></div>
      </div>

      <div className="payment-details">
         <table className="payment-table">
            <thead>
               <tr>
                  <th>Description</th>
                  <th>Installment No.</th>
                  <th>Payment Mode</th>
                  <th style={{ textAlign: 'right' }}>Amount Paid</th>
               </tr>
            </thead>
            <tbody>
               <tr>
                  <td>Monthly Savings Contribution</td>
                  <td>Month {receipt.installment_no}</td>
                  <td>{receipt.payment_mode}</td>
                  <td style={{ textAlign: 'right' }}>₹{receipt.amount.toLocaleString()}</td>
               </tr>
            </tbody>
         </table>
      </div>

      <div className="receipt-footer">
          <div className="amount-words">
             Amount in words: <span style={{ textTransform: 'capitalize' }}>INR {receipt.amount} only.</span>
          </div>
          <div className="terms">
             <p><strong>Terms:</strong> {details.invoice_terms}</p>
          </div>
      </div>

      <div className="signature-section">
        <div className="sig-block">
          <div className="line"></div>
          <p>Customer Signature</p>
        </div>
        <div className="sig-block">
           <div className="seal-area">OFFICIAL SEAL</div>
          <div className="line"></div>
          <p>Authorized Signature</p>
        </div>
      </div>

      <style>{`
        .print-receipt-card {
          padding: 40px;
          color: black;
          background: white;
          font-family: 'Outfit', 'Inter', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #eee;
        }
        .print-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 25px; }
        .shop-info h2 { margin: 0 0 5px 0; font-size: 1.6rem; letter-spacing: 1px; }
        .shop-info p { margin: 2px 0; font-size: 10px; color: #444; }
        
        .card-type { text-align: right; }
        .card-type h3 { margin: 0; font-size: 1rem; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .receipt-id { font-family: monospace; font-weight: bold; font-size: 1rem; margin: 8px 0 2px 0; color: #d00; }
        .date { font-size: 10px; color: #666; }

        .customer-info { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px; }
        .info-row { display: flex; flex-direction: column; gap: 4px; }
        .info-row span { font-size: 9px; color: #666; text-transform: uppercase; }
        .info-row strong { font-size: 12px; }

        .payment-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .payment-table th { text-align: left; font-size: 10px; text-transform: uppercase; color: #666; border-bottom: 1px solid #000; padding: 10px 5px; }
        .payment-table td { padding: 15px 5px; font-size: 11px; border-bottom: 1px solid #eee; }

        .receipt-footer { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; margin-bottom: 50px; }
        .amount-words { font-size: 10px; font-style: italic; color: #444; }
        .terms p { font-size: 8px; color: #777; line-height: 1.4; }

        .signature-section { display: flex; justify-content: space-between; margin-top: 60px; }
        .sig-block { width: 180px; text-align: center; }
        .sig-block .line { border-top: 1px solid #000; margin-bottom: 10px; }
        .sig-block p { font-size: 10px; font-weight: bold; }
        .seal-area { height: 40px; font-size: 8px; color: #eee; display: flex; align-items: center; justify-content: center; border: 1px dashed #eee; margin-bottom: 5px; border-radius: 50%; width: 60px; margin-left: auto; margin-right: auto; }

        @media print {
            body { background: white; }
            .no-print { display: none !important; }
            .print-receipt-card { padding: 20px; width: 100%; border: none; }
        }
      `}</style>
    </div>
  );
};

export default PrintSchemeReceipt;
