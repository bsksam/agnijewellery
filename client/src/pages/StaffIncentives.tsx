import React, { useState, useEffect } from 'react';
import { IncentiveAPI, MasterAPI } from '../api/api';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  Users, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  Wallet,
  Scale,
  Zap,
  Star,
  User,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StaffIncentives = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = useState<'LEADERBOARD' | 'EARNINGS' | 'RULES'>('LEADERBOARD');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Rule form
  const [newRule, setNewRule] = useState({ category_id: '', rule_type: 'PERCENT_OF_NET', reward_value: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'LEADERBOARD') {
        const res = await IncentiveAPI.getLeaderboard();
        setLeaderboard(res.data);
      } else if (activeTab === 'RULES') {
        const [ruleRes, catRes] = await Promise.all([
          IncentiveAPI.getRules(),
          MasterAPI.getCategories()
        ]);
        setRules(ruleRes.data);
        setCategories(catRes.data);
      } else {
        const res = await IncentiveAPI.getEarnings(user.name);
        setEarnings(res.data);
      }
    } catch (err) {
      console.error('Failed to load performance data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
       await IncentiveAPI.saveRule(newRule);
       fetchData();
       setNewRule({ category_id: '', rule_type: 'PERCENT_OF_NET', reward_value: '' });
    } catch (err) {
       alert('Failed to save reward rule');
    }
  };

  if (loading && leaderboard.length === 0) return <div className="main-content">Calculating Performance Metrics...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Team Performance & Incentives</h1>
          <p>Motivate your sales force with real-time achievements and automated rewards.</p>
        </div>
        <div className="view-switcher">
           <button className={`btn ${activeTab === 'LEADERBOARD' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('LEADERBOARD')}>
              <Trophy size={18} /> Hall of Fame
           </button>
           <button className={`btn ${activeTab === 'EARNINGS' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('EARNINGS')}>
              <Wallet size={18} /> My Rewards
           </button>
           <button className={`btn ${activeTab === 'RULES' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('RULES')}>
              <SettingsIcon size={18} /> Reward Rules
           </button>
        </div>
      </header>

      {activeTab === 'LEADERBOARD' && (
        <div className="leaderboard-view">
           <div className="top-performers">
              {leaderboard.slice(0, 3).map((staff, idx) => (
                <div key={staff.staff_id} className={`performer-card rank-${idx + 1}`}>
                   <div className="rank-badge">{idx + 1 === 1 ? <Crown /> : idx + 1}</div>
                   <h3>{staff.staff_id}</h3>
                   <div className="p-stats">
                      <div className="p-stat"><strong>₹{Math.round(staff.total_value).toLocaleString()}</strong> <span>Sales Value</span></div>
                      <div className="p-stat"><strong>{staff.total_weight.toFixed(2)}g</strong> <span>Total Weight</span></div>
                   </div>
                </div>
              ))}
           </div>

           <div className="data-table-container">
               <table className="custom-table">
                  <thead>
                     <tr>
                        <th>Staff Member</th>
                        <th>Sales Count</th>
                        <th>Total Weight Sold</th>
                        <th>Total Sales Value</th>
                        <th>Achievement Level</th>
                     </tr>
                  </thead>
                  <tbody>
                     {leaderboard.map((staff, idx) => {
                       const isMe = staff.staff_id === user.name;
                       const tier = staff.total_value > 1000000 ? { label: 'DIAMOND', color: '#B9F2FF', icon: <Zap size={14} /> } 
                                  : staff.total_value > 500000 ? { label: 'GOLD', color: '#D4AF37', icon: <Star size={14} /> }
                                  : { label: 'SILVER', color: '#C0C0C0', icon: <Award size={14} /> };

                       return (
                         <tr key={staff.staff_id} style={isMe ? { background: 'rgba(212,175,55,0.05)' } : {}}>
                            <td style={{ fontWeight: 700 }}>
                               {staff.staff_id} {isMe && <span className="me-pill">YOU</span>}
                            </td>
                            <td>{staff.total_sales}</td>
                            <td>{staff.total_weight?.toFixed(2) || '0.00'}g</td>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{Math.round(staff.total_value).toLocaleString()}</td>
                            <td>
                               <div className="achievement-badge" style={{ color: tier.color, borderColor: tier.color }}>
                                  {tier.icon}
                                  <span>{tier.label} ELITE</span>
                               </div>
                            </td>
                         </tr>
                       );
                     })}
                  </tbody>
               </table>
           </div>
        </div>
      )}

      {activeTab === 'EARNINGS' && (
        <div className="earnings-view">
           <div className="earnings-summary stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="stat-card">
                 <span className="stat-label">Earnings (Current Month)</span>
                 <div className="stat-value">₹{Math.round(earnings.reduce((acc, e) => acc + e.estimated_incentive, 0)).toLocaleString()}</div>
              </div>
              <div className="stat-card">
                 <span className="stat-label">Total Bills Finalized</span>
                 <div className="stat-value">{earnings.length}</div>
              </div>
           </div>

           <div className="data-table-container">
              <table className="custom-table">
                 <thead>
                    <tr>
                       <th>Bill No</th>
                       <th>Date</th>
                       <th>Amount</th>
                       <th>Calculated Reward</th>
                       <th>Status</th>
                    </tr>
                 </thead>
                 <tbody>
                    {earnings.map(e => (
                      <tr key={e.bill_no}>
                         <td style={{ fontWeight: 800 }}>{e.bill_no}</td>
                         <td>{new Date(e.bill_date).toLocaleDateString()}</td>
                         <td>₹{Math.round(e.net_amount).toLocaleString()}</td>
                         <td style={{ color: '#22c55e', fontWeight: 800 }}>₹{Math.round(e.estimated_incentive).toLocaleString()}</td>
                         <td><span className="badge active">Accrued</span></td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'RULES' && (
        <div className="rules-view">
           <div className="rules-grid">
              <div className="panel rule-form-panel">
                 <h3>Define Reward Structure</h3>
                 <form onSubmit={handleSaveRule} className="rule-form">
                    <div className="form-group">
                       <label>Item Category</label>
                       <select value={newRule.category_id} onChange={e => setNewRule({...newRule, category_id: e.target.value})} required>
                          <option value="">Apply to Category...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                    </div>
                    <div className="form-group">
                       <label>Rule Type</label>
                       <select value={newRule.rule_type} onChange={e => setNewRule({...newRule, rule_type: e.target.value})}>
                          <option value="PERCENT_OF_NET">Percentage of Net Amount</option>
                          <option value="PER_GRAM">Fixed Payout Per Gram</option>
                       </select>
                    </div>
                    <div className="form-group">
                       <label>Value (e.g. 0.5% or ₹100)</label>
                       <input type="number" step="0.01" value={newRule.reward_value} onChange={e => setNewRule({...newRule, reward_value: e.target.value})} required />
                    </div>
                    <button className="btn btn-primary w-full" type="submit">Activate Reward Rule</button>
                 </form>
              </div>

              <div className="panel existing-rules">
                 <h3>Active Incentives</h3>
                 <div className="rules-list">
                    {rules.map(r => (
                      <div key={r.id} className="rule-item">
                         <div className="r-info">
                            <strong>{r.category_name || 'Global'}</strong>
                            <span>{r.rule_type === 'PERCENT_OF_NET' ? `${r.reward_value}% of Sales` : `₹${r.reward_value} per gram`}</span>
                         </div>
                         <div className="r-status"><CheckCircle2 size={16} color="#22c55e" /> Active</div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .top-performers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-bottom: 2rem; }
        .performer-card { background: var(--bg-card); border: 1px solid var(--border); padding: 2rem; border-radius: 32px; text-align: center; position: relative; }
        .performer-card.rank-1 { border: 2px solid #D4AF37; transform: scale(1.05); background: linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(0,0,0,0) 100%); }
        .rank-badge { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: #111; border: 2px solid var(--border); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--primary); }
        .rank-1 .rank-badge { border-color: #D4AF37; color: #D4AF37; }
        .p-stats { display: flex; justify-content: center; gap: 2rem; margin-top: 1.5rem; }
        .p-stat { display: flex; flex-direction: column; }
        .p-stat strong { font-size: 1.1rem; color: white; }
        .p-stat span { font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .achievement-badge { display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 20px; font-size: 0.65rem; font-weight: 800; border: 1px solid rgba(212,175,55,0.2); }
        .me-pill { margin-left: 8px; font-size: 0.6rem; background: var(--primary); color: black; padding: 2px 6px; border-radius: 4px; font-weight: 900; }
        .w-full { width: 100%; justify-content: center; }
      `}</style>
    </div>
  );
};

export default StaffIncentives;
