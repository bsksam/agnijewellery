import React, { useState, useEffect } from 'react';
import { 
  History, 
  Wallet, 
  TrendingUp, 
  Star, 
  Coins, 
  PiggyBank, 
  ChevronRight, 
  Gem, 
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PublicAPI, RatesAPI } from '../api/api';

const CustomerPassbook = () => {
  const [phone, setPhone] = useState('');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await RatesAPI.getLatest();
      setRates(res.data[0]);
    } catch (err) {
      console.error('Rates fetch failed', err);
    }
  };

  const handleFetch = async () => {
    if (!phone) return;
    setLoading(true);
    setError('');
    try {
      const res = await PublicAPI.getCustomerPortfolio(phone);
      if (!res.data.customer) {
        setError('No active wealth record found for this number.');
      } else {
        setPortfolio(res.data);
      }
    } catch (err) {
      setError('System unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (!portfolio) {
    return (
      <div className="passbook-landing-page">
        <header className="passbook-header">
           <div className="luxury-logo">
              <Gem size={32} color="#D4AF37" />
              <span>AGNI LEDGER</span>
           </div>
        </header>
        
        <main className="landing-main">
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="login-card">
              <h1>Digital Gold Passbook</h1>
              <p>Securely access your gold portfolio, savings schemes, and lifetime loyalty rewards.</p>
              
              <div className="input-group">
                 <input 
                   type="tel" 
                   placeholder="Enter Registered Mobile Number" 
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                 />
                 <button className="fetch-btn" onClick={handleFetch} disabled={loading}>
                    {loading ? 'Verifying...' : 'Access My Wealth'}
                 </button>
              </div>
              {error && <div className="error-msg">{error}</div>}

              <div className="login-footer">
                 <ShieldCheck size={16} color="#D4AF37" />
                 <span>128-bit Encrypted Secure Ledger Access</span>
              </div>
           </motion.div>
        </main>
        
        <style>{`
           .passbook-landing-page { background: #080808; height: 100vh; color: #fff; font-family: 'Outfit', sans-serif; }
           .passbook-header { padding: 3rem; display: flex; justify-content: center; }
           .luxury-logo { display: flex; align-items: center; gap: 15px; font-weight: 800; letter-spacing: 5px; font-size: 1.5rem; }
           
           .landing-main { display: flex; justify-content: center; align-items: center; height: calc(100vh - 250px); padding: 2rem; }
           .login-card { background: #111; border: 1px solid #222; padding: 4rem 3rem; border-radius: 40px; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
           .login-card h1 { font-size: 2.2rem; margin-bottom: 1.5rem; color: #D4AF37; }
           .login-card p { color: #888; margin-bottom: 3rem; line-height: 1.6; }
           
           .input-group { display: flex; flex-direction: column; gap: 1rem; }
           .input-group input { background: #080808; border: 1px solid #333; padding: 1.2rem; border-radius: 16px; color: #fff; text-align: center; font-size: 1.2rem; font-weight: 700; }
           .input-group input:focus { border-color: #D4AF37; outline: none; }
           
           .fetch-btn { background: #D4AF37; color: #000; border: none; padding: 1.2rem; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.3s; }
           .fetch-btn:hover { transform: scale(1.02); box-shadow: 0 5px 20px rgba(212,175,55,0.3); }
           
           .error-msg { margin-top: 1.5rem; color: #EF4444; font-weight: 700; font-size: 0.9rem; }
           .login-footer { margin-top: 3rem; display: flex; align-items: center; justify-content: center; gap: 10px; color: #444; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        `}</style>
      </div>
    );
  }

  const currentPortfolioValue = rates ? portfolio.total_weight * rates.gold_22k : 0;

  return (
    <div className="passbook-dashboard">
       <nav className="passbook-nav">
          <div className="nav-wrap">
             <div className="logo-small"><Gem size={20} color="#D4AF37" /> AGNI</div>
             <div className="profile-pill">
                <div className="tier">{portfolio.customer.loyalty_tier}</div>
                <User size={18} />
             </div>
          </div>
       </nav>

       <main className="dashboard-main">
          <header className="wealth-hero">
             <div className="h-left">
                <h1>{portfolio.customer.name}</h1>
                <p>Welcome to your Sovereign Gold Ledger</p>
             </div>
             <div className="points-badge">
                <Star size={16} />
                <span>{portfolio.customer.loyalty_points} Loyalty Points</span>
             </div>
          </header>

          <div className="wealth-grid">
             <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="wealth-card main-balance">
                <div className="card-header">
                   <div className="icon-box"><Coins size={24} color="#D4AF37" /></div>
                   <span>Total Gold Assets</span>
                </div>
                <div className="weight-val">{portfolio.total_weight.toFixed(3)}g</div>
                <div className="market-val">
                   <TrendingUp size={16} />
                   <span>Current Value: {formatCurrency(currentPortfolioValue)}</span>
                </div>
                <div className="rate-hint">Based on today's rate: ₹{rates?.gold_22k}/g</div>
             </motion.div>

             <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: { delay: 0.1 } }} className="wealth-card">
                <div className="card-header">
                   <div className="icon-box"><PiggyBank size={24} color="#22c55e" /></div>
                   <span>Scheme Portfolio</span>
                </div>
                <div className="stat-list">
                   {portfolio.schemes.map((s: any, idx: number) => (
                      <div key={idx} className="stat-item">
                         <div className="s-info">
                            <strong>{s.scheme_name}</strong>
                            <span>{s.paid_count} / {s.total_installments} Paid</span>
                         </div>
                         <div className="s-val">{formatCurrency(s.total_paid)}</div>
                      </div>
                   ))}
                   {portfolio.schemes.length === 0 && <p className="empty">No active schemes found.</p>}
                </div>
             </motion.div>

             <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: { delay: 0.2 } }} className="wealth-card">
                <div className="card-header">
                   <div className="icon-box"><CreditCard size={24} color="#3B82F6" /></div>
                   <span>Recent Movements</span>
                </div>
                <div className="activity-list">
                   {portfolio.purchases.slice(0, 3).map((p: any, idx: number) => (
                      <div key={idx} className="act-item">
                         <div className="act-icon"><ArrowUpRight size={14} /></div>
                         <div className="act-info">
                            <strong>Jewelry Purchase</strong>
                            <span>{new Date(p.sale_date).toLocaleDateString()}</span>
                         </div>
                         <div className="act-val">+{p.net_weight}g</div>
                      </div>
                   ))}
                </div>
                <button className="view-more">Full History <ChevronRight size={14} /></button>
             </motion.div>
          </div>
       </main>

       <style>{`
          .passbook-dashboard { background: #080808; min-height: 100vh; color: #fff; font-family: 'Outfit', sans-serif; }
          .passbook-nav { background: rgba(0,0,0,0.5); border-bottom: 1px solid #1a1a1a; padding: 1.5rem 3rem; }
          .nav-wrap { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
          .logo-small { color: #D4AF37; font-weight: 800; letter-spacing: 5px; font-size: 0.8rem; display: flex; align-items: center; gap: 10px; }
          
          .profile-pill { background: #111; padding: 6px 16px; border-radius: 30px; border: 1px solid #222; display: flex; align-items: center; gap: 10px; color: #D4AF37; }
          .tier { font-size: 0.65rem; font-weight: 800; letter-spacing: 1px; }

          .dashboard-main { max-width: 1200px; margin: 0 auto; padding: 4rem 3rem; }
          .wealth-hero { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4rem; }
          .h-left h1 { font-size: 3rem; font-weight: 800; color: #D4AF37; margin-bottom: 0.5rem; }
          .h-left p { color: #555; font-size: 1rem; }
          
          .points-badge { background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.2); color: #D4AF37; padding: 8px 20px; border-radius: 12px; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.85rem; }

          .wealth-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 2rem; }
          .wealth-card { background: #111; border: 1px solid #222; border-radius: 32px; padding: 2.5rem; display: flex; flex-direction: column; }
          .card-header { display: flex; align-items: center; gap: 15px; margin-bottom: 2rem; color: #555; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
          .icon-box { background: rgba(255,255,255,0.03); width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
          
          .main-balance { background: linear-gradient(135deg, #111 0%, #050505 100%); border-color: #D4AF37; }
          .weight-val { font-size: 4rem; font-weight: 800; color: #fff; margin-bottom: 1rem; }
          .market-val { display: flex; align-items: center; gap: 10px; color: #22c55e; font-weight: 800; font-size: 1.2rem; margin-bottom: 0.5rem; }
          .rate-hint { font-size: 0.75rem; color: #444; font-weight: 700; }

          .stat-list { display: flex; flex-direction: column; gap: 1.5rem; }
          .stat-item { border-bottom: 1px solid #1a1a1a; padding-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
          .s-info strong { display: block; font-size: 0.9rem; margin-bottom: 4px; }
          .s-info span { font-size: 0.75rem; color: #444; font-weight: 700; }
          .s-val { font-weight: 800; color: #D4AF37; }

          .activity-list { display: flex; flex-direction: column; gap: 1.25rem; }
          .act-item { display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 16px; }
          .act-icon { background: #1a1a1a; width: 32px; height: 32px; border-radius: 50%; color: #22c55e; display: flex; align-items: center; justify-content: center; }
          .act-info strong { display: block; font-size: 0.8rem; }
          .act-info span { font-size: 0.65rem; color: #444; }
          .act-val { margin-left: auto; font-weight: 800; font-size: 0.85rem; }
          
          .view-more { margin-top: auto; background: none; border: none; color: #444; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.75rem; padding-top: 2rem; }
       `}</style>
    </div>
  );
};

export default CustomerPassbook;
