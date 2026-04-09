import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PublicAPI } from '../api/api';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  Smartphone, 
  CircleDollarSign,
  Scale,
  Award,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

const PublicVerify = ({ tagNo: propTagNo }: { tagNo?: string }) => {
  const { tagNo: paramTagNo } = useParams();
  const tagNo = propTagNo || paramTagNo;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tagNo) {
      verifyItem();
    }
  }, [tagNo]);

  const verifyItem = async () => {
    try {
      const res = await PublicAPI.verify(tagNo!);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Certification verification failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="verify-container">
       <div className="verify-loading">
          <CircleDollarSign className="spin" size={48} color="#D4AF37" />
          <p>Verifying Guarantee...</p>
       </div>
    </div>
  );

  return (
    <div className="verify-container">
       <header className="verify-header">
          <div className="logo-badge">
             <CircleDollarSign size={24} color="#000" />
          </div>
          <h1>AGNI JEWELLERY</h1>
          <div className="verify-label">Official Authenticity Portal</div>
       </header>

       <main className="verify-main">
          {error ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="verify-error">
               <AlertTriangle size={48} />
               <h2>Verification Failed</h2>
               <p>{error}</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="verify-success">
               <div className="status-hero">
                  <ShieldCheck size={64} color="#D4AF37" />
                  <h2>Genuine Product Certified</h2>
                  <p>This item is a hallmarked original from the Agni Jewellery collection.</p>
               </div>

               <div className="item-specs">
                  <div className="spec-row">
                     <span className="spec-label">Item / Design</span>
                     <span className="spec-value">{data.product_name}</span>
                  </div>
                  <div className="spec-row">
                     <span className="spec-label">Tag Serial</span>
                     <span className="spec-value">{data.tag_no}</span>
                  </div>
                  <div className="spec-row">
                     <span className="spec-label">Certification</span>
                     <span className="spec-value">{data.category_name}</span>
                  </div>
                  <div className="spec-row highlight">
                     <span className="spec-label">Purity Certified</span>
                     <span className="spec-value">{data.huid1}</span>
                  </div>
                  <div className="spec-row">
                     <span className="spec-label">Verified Weight</span>
                     <span className="spec-value">{data.net_weight} g</span>
                  </div>
               </div>

               <footer className="item-footer">
                  <div className="assurance">
                     <CheckCircle2 size={16} /> High-Speed Cloud Verified
                  </div>
                  <div className="assurance">
                     <Scale size={16} /> BIS Hallmarked Equivalent
                  </div>
               </footer>
            </motion.div>
          )}
       </main>

       <div className="contact-info">
          <p><MapPin size={12} /> Main Bazaar, Bangalore</p>
          <p><Smartphone size={12} /> +91 99000-00000</p>
       </div>

       <style>{`
          .verify-container { min-height: 100vh; background: #0A0A0A; color: white; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; padding: 2rem; align-items: center; }
          .verify-loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-top: 10rem; }
          .spin { animation: spin 2s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

          .verify-header { text-align: center; margin-bottom: 2rem; }
          .logo-badge { background: #D4AF37; display: inline-flex; padding: 10px; border-radius: 50%; margin-bottom: 1rem; }
          .verify-header h1 { font-size: 1.5rem; letter-spacing: 4px; font-weight: 300; margin: 0; }
          .verify-label { font-size: 0.7rem; color: #D4AF37; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 800; }

          .verify-main { width: 100%; max-width: 400px; background: #111; border: 1px solid #222; border-radius: 24px; padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .status-hero { text-align: center; margin-bottom: 2.5rem; }
          .status-hero h2 { font-size: 1.2rem; margin: 1rem 0 0.5rem 0; color: #D4AF37; }
          .status-hero p { font-size: 0.85rem; color: #888; line-height: 1.5; }

          .item-specs { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2.5rem; }
          .spec-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid #222; }
          .spec-row.highlight { border-bottom: 1px solid #D4AF3733; }
          .spec-label { font-size: 0.7rem; color: #666; text-transform: uppercase; letter-spacing: 1px; }
          .spec-value { font-size: 1rem; font-weight: 600; color: #EEE; }
          .highlight .spec-value { color: #D4AF37; }

          .item-footer { display: flex; flex-direction: column; gap: 8px; }
          .assurance { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: #555; }

          .verify-error { text-align: center; color: #ef4444; }
          .verify-error h2 { color: #ef4444; margin-top: 1rem; }
          .verify-error p { color: #888; font-size: 0.9rem; margin-top: 0.5rem; }

          .contact-info { margin-top: auto; padding-top: 3rem; text-align: center; }
          .contact-info p { font-size: 0.75rem; color: #444; margin: 4px 0; display: flex; align-items: center; justify-content: center; gap: 6px; }
       `}</style>
    </div>
  );
};

export default PublicVerify;
