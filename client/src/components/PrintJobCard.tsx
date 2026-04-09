import React, { useState, useEffect } from 'react';
import { SettingsAPI } from '../api/api';

interface PrintJobCardProps {
  repair: any;
}

const PrintJobCard: React.FC<PrintJobCardProps> = ({ repair }) => {
  const [details, setDetails] = useState({
    shop_name: "AGNI JEWELLERY",
    shop_address: "123 Jewel Lane, Gold Bazaar, Chennai, TN - 600001",
    shop_phone: "+91 98765 43210",
    shop_gstin: "33AAAAA0000A1Z5",
    invoice_terms: "1. Items not collected within 30 days are at owner's risk. 2. Subject to local jurisdiction."
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await SettingsAPI.get();
      setDetails(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to load shop settings for repair card', err);
    }
  };

  return (
    <div className="print-repair-card">
      <div className="print-header">
        <div className="shop-info">
          <h2>{details.shop_name}</h2>
          <p>{details.shop_address}</p>
          <p>Ph: {details.shop_phone} | GSTIN: {details.shop_gstin}</p>
        </div>
        <div className="card-type">
          <h3>SERVICE JOB CARD</h3>
          <p className="job-id">{repair.job_card_no}</p>
          <p className="date">Date: {new Date(repair.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-section customer">
          <h4>Customer Details</h4>
          <p><strong>Name:</strong> {repair.customer_name}</p>
          <p><strong>Mobile:</strong> {repair.customer_mobile}</p>
        </div>
        <div className="info-section delivery">
          <h4>Delivery Info</h4>
          <p><strong>Promised Date:</strong> {new Date(repair.promised_date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {repair.status}</p>
        </div>
      </div>

      <div className="service-details">
        <h4>Service & Item Description</h4>
        <div className="detail-box">
          <p><strong>Item:</strong> {repair.item_description}</p>
          <p><strong>Work Req:</strong> {repair.repair_details}</p>
        </div>
      </div>

      <div className="financial-grid">
         <div className="estimated-charges">
            <div className="charge-row"><span>Total Estimated Charge:</span> <strong>₹{repair.total_charge.toLocaleString()}</strong></div>
            <div className="charge-row"><span>Advance Paid:</span> <strong>₹{repair.advance_paid.toLocaleString()}</strong></div>
            <div className="charge-row balance"><span>Balance Amount:</span> <strong>₹{(repair.total_charge - repair.advance_paid).toLocaleString()}</strong></div>
         </div>
         <div className="terms-condition">
            <p><strong>Terms & Conditions:</strong></p>
            <p className="terms-text">{details.invoice_terms}</p>
         </div>
      </div>

      <div className="signature-section">
        <div className="sig-block">
          <div className="line"></div>
          <p>Customer Signature</p>
        </div>
        <div className="sig-block">
          <div className="line"></div>
          <p>Manager Signature</p>
        </div>
      </div>

      <style>{`
        .print-repair-card {
          padding: 40px;
          color: black;
          background: white;
          font-family: 'Outfit', 'Inter', sans-serif;
          max-width: 800px;
          margin: 0 auto;
        }
        .print-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
        .shop-info h2 { margin: 0 0 5px 0; font-size: 1.8rem; letter-spacing: 1px; }
        .shop-info p { margin: 2px 0; font-size: 10px; color: #444; }
        
        .card-type { text-align: right; }
        .card-type h3 { margin: 0; font-size: 1.2rem; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .job-id { font-family: monospace; font-weight: bold; font-size: 1.1rem; margin: 8px 0 2px 0; color: #d00; }
        .date { font-size: 10px; color: #666; }

        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
        .info-section h4 { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; font-size: 0.9rem; text-transform: uppercase; color: #666; }
        .info-section p { margin: 5px 0; font-size: 11px; }

        .service-details { margin-bottom: 30px; }
        .service-details h4 { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; font-size: 0.9rem; text-transform: uppercase; color: #666; }
        .detail-box { border: 1px solid #eee; padding: 15px; border-radius: 8px; background: #fafafa; }
        .detail-box p { margin: 5px 0; font-size: 11px; line-height: 1.6; }

        .financial-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; margin-bottom: 50px; }
        .charge-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 11px; }
        .charge-row.balance { border-top: 1px solid #000; font-size: 13px; margin-top: 5px; }
        .charge-row.balance strong { color: #d00; }
        
        .terms-condition p { font-size: 9px; color: #555; margin: 2px 0; }
        .terms-text { white-space: pre-line; line-height: 1.4; border-left: 2px solid #eee; padding-left: 10px; }

        .signature-section { display: flex; justify-content: space-between; margin-top: 80px; }
        .sig-block { width: 180px; text-align: center; }
        .sig-block .line { border-top: 1px solid #000; margin-bottom: 10px; }
        .sig-block p { font-size: 10px; font-weight: bold; }

        @media print {
            body { background: white; }
            .no-print { display: none !important; }
            .print-repair-card { padding: 20px; width: 100%; border: none; }
        }
      `}</style>
    </div>
  );
};

export default PrintJobCard;
