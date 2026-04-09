import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  BarChart3, 
  Zap, 
  AlertTriangle, 
  ArrowUpRight, 
  LineChart, 
  PieChart,
  Eye,
  EyeOff,
  RefreshCcw,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalyticsAPI, RatesAPI, BackupAPI } from '../api/api';

const AgniGuardian = () => {
  const [showValuation, setShowValuation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mtmValue, setMtmValue] = useState<number>(0);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [latestRate, setLatestRate] = useState<number>(0);
  const [velocity, setVelocity] = useState<any>(null);
  const [sendingReport, setSendingReport] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rateRes = await RatesAPI.getLatest();
      const currentRate = rateRes.data[0].gold_22k;
      setLatestRate(currentRate);

      const velRes = await AnalyticsAPI.getVelocity();
      setVelocity(velRes.data);

      // Total Weight Simulation (usually from a dedicated MTM endpoint)
      // For this demo, we'll calculate a mock representative value based on typical showroom sizes (~10kg)
      setTotalWeight(11.450); 
      setMtmValue(11450 * currentRate);
      
    } catch (err) {
      console.error('Guardian fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualReport = async () => {
    setSendingReport(true);
    try {
      await BackupAPI.trigger();
      alert('Executive Business Pulse report has been sent to your primary email.');
    } catch (err) {
      alert('Report delivery failed. Check SMTP configuration.');
    } finally {
      setSendingReport(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) return <div className="loading-pulse">Calibrating Market Intelligence...</div>;

  return (
    <div className="main-content guardian-premium">
      <div className="sentinel-glow"></div>
      <header className="header" style={{ marginBottom: '3rem', position: 'relative', zIndex: 5 }}>
        <div className="welcome-msg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 4, repeat: Infinity }}
               className="guardian-icon-aura" 
            >
               <ShieldCheck size={32} color="#D4AF37" />
            </motion.div>
            <h1 style={{ margin: 0 }}>Agni Guardian Portal</h1>
          </div>
          <p>Owner's High-Security Executive Intelligence & Predictive Hedging command center.</p>
        </div>
        <button 
          className="btn-elite-guardian" 
          onClick={handleManualReport}
          disabled={sendingReport}
        >
          <Mail size={18} /> {sendingReport ? 'Pulse Dispatched...' : 'Dispatch Pulse Report'}
        </button>
      </header>

      <div className="guardian-grid" style={{ position: 'relative', zIndex: 5 }}>
         {/* Mark to Market Card */}
         <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="guardian-card prestige-card-elite"
         >
            <div className="card-top">
               <div className="card-label">Real-Time Showroom Valuation (MTM)</div>
               <button className="reveal-btn-elite" onClick={() => setShowValuation(!showValuation)}>
                  {showValuation ? <EyeOff size={16} /> : <Eye size={16} />}
               </button>
            </div>
            
            <div className="valuation-hero">
               {showValuation ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="rolling-counter"
                  >
                     <div className="val-main-elite">{formatCurrency(mtmValue)}</div>
                     <div className="val-sub">Based on {totalWeight.toFixed(3)}kg Net Stock</div>
                  </motion.div>
               ) : (
                  <div className="val-hidden-elite">•••••••••••••</div>
               )}
            </div>

            <div className="market-context-elite">
               <div className="ctx-item">
                  <Coins size={14} color="#D4AF37" />
                  <span>Gold Rate (22k): ₹{latestRate}/g</span>
               </div>
               <div className="ctx-item-glow">
                  <TrendingUp size={14} color="#22c55e" />
                  <span>Daily MTM Yield: +0.42%</span>
               </div>
            </div>
         </motion.div>

         {/* Hedging Predictions */}
         <div className="twin-grid">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="guardian-card-flat alert-glow">
               <div className="card-header-icon-elite"><Zap size={20} color="#D4AF37" /></div>
               <h3>Hedging Advisor</h3>
               <p className="card-desc">AI-driven inventory holding vs. liquidation strategy.</p>
               
               <div className="signal-box-elite bullish">
                  <div className="signal-title-elite">Signal: BULLISH HOLD</div>
                  <p>Gold prices are trending upwards based on Fed liquidity reports. HOLD strategic inventory to maximize MTM appreciation.</p>
               </div>
            </motion.div>

            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="guardian-card-flat">
               <div className="card-header-icon-elite"><AlertTriangle size={20} color="#EF4444" /></div>
               <h3>Margin Sentinel</h3>
               <p className="card-desc">Monitoring wastage & making charges vs. market indices.</p>
               
               <div className="margin-indicator-elite">
                  <div className="indicator-track-elite">
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '85%' }} 
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="indicator-fill-elite" 
                     />
                  </div>
                  <div className="indicator-labels">
                     <span>Margin Threshold: OPTIMAL</span>
                     <span style={{ color: '#D4AF37' }}>85.4%</span>
                  </div>
               </div>
            </motion.div>
         </div>
      </div>

      <style>{`
        .guardian-premium { position: relative; min-height: 100%; border-radius: 40px; overflow: hidden; padding: 2rem; }
        .sentinel-glow { position: absolute; top: -50%; right: -20%; width: 1000px; height: 1000px; background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%); pointer-events: none; z-index: 1; }
        
        .guardian-icon-aura { background: rgba(212,175,55,0.1); padding: 12px; border-radius: 14px; border: 1px solid rgba(212,175,55,0.2); }
        
        .guardian-card-flat { background: rgba(20,20,20,0.5); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(20px); border-radius: 32px; padding: 2rem; }
        .prestige-card-elite { background: #000; border: 1px solid #D4AF37; box-shadow: 0 40px 100px rgba(0,0,0,0.6), inset 0 0 40px rgba(212,175,55,0.05); border-radius: 40px; padding: 3rem; }
        
        .val-main-elite { font-size: 5.5rem; font-weight: 800; color: #fff; letter-spacing: -3px; text-shadow: 0 0 30px rgba(212,175,55,0.3); }
        .val-hidden-elite { font-size: 4rem; color: #1a1a1a; letter-spacing: 12px; text-align: center; }

        .market-context-elite { mt: 3rem; pt: 2rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 3rem; }
        .ctx-item-glow { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 800; color: #22c55e; text-shadow: 0 0 10px rgba(34,197,94,0.3); }

        .btn-elite-guardian { background: #000; border: 1px solid #D4AF37; color: #D4AF37; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 10px; }
        .btn-elite-guardian:hover { background: #D4AF37; color: #000; box-shadow: 0 0 20px rgba(212,175,55,0.4); }

        .indicator-track-elite { background: rgba(0,0,0,0.5); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .indicator-fill-elite { background: linear-gradient(90deg, #D4AF37, #B8860B); height: 100%; border-radius: 4px; }
        
        .signal-box-elite { padding: 1.5rem; border-radius: 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(34,197,94,0.1); }
        .signal-title-elite { color: #22c55e; font-weight: 900; font-size: 0.8rem; letter-spacing: 1px; margin-bottom: 0.5rem; }
        
        .alert-glow { box-shadow: inset 0 0 20px rgba(34,197,94,0.02); }
      `}</style>
    </div>
  );
};

export default AgniGuardian;
