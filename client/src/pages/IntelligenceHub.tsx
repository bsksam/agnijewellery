import React, { useState, useEffect } from 'react';
import { AnalyticsAPI } from '../api/api';
import { 
  TrendingUp, 
  Hourglass, 
  Users, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  LayoutDashboard,
  Calendar,
  Gem,
  AlertTriangle,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const IntelligenceHub = () => {
  const [aging, setAging] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [vips, setVips] = useState<any[]>([]);
  const [velocity, setVelocity] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const fetchIntelligence = async () => {
    try {
      setLoading(true);
      const [ageRes, foreRes, vipRes, velRes, insRes] = await Promise.all([
        AnalyticsAPI.getAging(),
        AnalyticsAPI.getForecasting(),
        AnalyticsAPI.getVIPSegments(),
        AnalyticsAPI.getVelocity(),
        AnalyticsAPI.getInsights()
      ]);
      setAging(ageRes.data);
      setForecast(foreRes.data);
      setVips(vipRes.data);
      setVelocity(velRes.data);
      setInsights(insRes.data);
    } catch (err) {
      console.error('Intelligence Load Failed');
    } finally {
      setLoading(false);
    }
  };

  const deadStockCount = aging.filter(i => i.age_days > 180).length;
  const criticalVips = vips.filter(v => v.recency_days > 60).length;

  if (loading) return <div className="main-content">Priming Global AI Sales Oracle...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Strategic Intelligence Oracle</h1>
          <p>Analyzing historical patterns to predict demand and optimize inventory liquidity.</p>
        </div>
        <div className="header-actions">
           <button className="btn" onClick={fetchIntelligence}><RefreshCcw size={18} /> Refresh Analysis</button>
        </div>
      </header>

      {insights.length > 0 && (
         <div className="insights-ticker">
            <div className="ticker-label"><Sparkles size={14} /> AI ORACLE</div>
            <div className="ticker-content">
               {insights.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.5 }}
                    className="insight-msg"
                  >
                     {msg}
                  </motion.div>
               ))}
            </div>
         </div>
      )}

      <div className="intelligence-grid">
         {/* Top Stats */}
         <div className="stat-card gold-border">
            <div className="stat-icon"><Sparkles size={24} color="#D4AF37" /></div>
            <div className="stat-val">{forecast.length > 0 ? forecast[forecast.length-1].total_weight.toFixed(2) + 'g' : '0g'}</div>
            <div className="stat-label">Projected Next Month Weight Sales</div>
         </div>
         <div className="stat-card red-border">
            <div className="stat-icon"><Hourglass size={24} color="#ef4444" /></div>
            <div className="stat-val">{deadStockCount}</div>
            <div className="stat-label">Items in Dead Stock ({'>'}180 Days)</div>
         </div>
         <div className="stat-card blue-border">
            <div className="stat-icon"><Users size={24} color="#3b82f6" /></div>
            <div className="stat-val">{vips.length}</div>
            <div className="stat-label">High-Value Active VIPs</div>
         </div>
         <div className="stat-card green-border">
            <div className="stat-icon"><Zap size={24} color="#22c55e" /></div>
            <div className="stat-val">{velocity.length}</div>
            <div className="stat-label">Active Market Categories</div>
         </div>

         {/* Charts Section */}
         <div className="intel-section full-width">
            <div className="section-head">
               <TrendingUp size={20} color="#D4AF37" />
               <h3>Category Demand Forecasting</h3>
            </div>
            <div style={{ height: '350px', marginTop: '2rem' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast}>
                     <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                     <XAxis dataKey="month" stroke="#555" fontSize={12} />
                     <YAxis stroke="#555" fontSize={12} />
                     <Tooltip 
                       contentStyle={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px' }}
                       itemStyle={{ color: '#D4AF37' }}
                     />
                     <Area type="monotone" dataKey="total_weight" name="Sales Volume (g)" stroke="#D4AF37" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Stock Aging & VIPs */}
         <div className="intel-section">
            <div className="section-head">
               <AlertTriangle size={20} color="#ef4444" />
               <h3>Critical Stock Aging (180+ Days)</h3>
            </div>
            <div className="intel-list scrollable">
               {aging.filter(i => i.age_days > 180).map(item => (
                 <div key={item.tag_no} className="list-item">
                    <div className="item-meta">
                       <strong>{item.tag_no}</strong>
                       <span>{item.product_name}</span>
                    </div>
                    <div className="item-age urgent">{item.age_days} Days</div>
                 </div>
               ))}
               {aging.filter(i => i.age_days > 180).length === 0 && <p className="empty">Your inventory liquidity is perfect!</p>}
            </div>
         </div>

         <div className="intel-section">
            <div className="section-head">
               <Users size={20} color="#3b82f6" />
               <h3>High-Value VIP Radar</h3>
            </div>
            <div className="intel-list scrollable">
               {vips.map(vip => (
                 <div key={vip.customer_mobile} className="list-item">
                    <div className="item-meta">
                       <strong>{vip.customer_name}</strong>
                       <span>Total Hub Value: ₹{Math.round(vip.monetary_value).toLocaleString()}</span>
                    </div>
                    <div className={`item-age ${vip.recency_days > 90 ? 'danger' : 'safe'}`}>
                       {vip.recency_days}d ago
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Category Velocity */}
         <div className="intel-section full-width">
            <div className="section-head">
               <Zap size={20} color="#22c55e" />
               <h3>Inventory Velocity & Liquidity Map</h3>
            </div>
            <div className="velocity-grid">
               {velocity.map(cat => {
                  const velocityRatio = (cat.total_sold / (cat.total_sold + cat.current_stock)) * 100 || 0;
                  return (
                    <div key={cat.category_name} className="vel-card">
                       <div className="vel-info">
                          <label>{cat.category_name}</label>
                          <span>{velocityRatio.toFixed(1)}% Ratio</span>
                       </div>
                       <div className="vel-bar-bg">
                          <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: `${velocityRatio}%` }} 
                             className="vel-bar-fill"
                             style={{ background: velocityRatio > 70 ? '#22c55e' : velocityRatio > 30 ? '#3b82f6' : '#ef4444' }}
                          />
                       </div>
                       <div className="vel-stats">
                          <span>{cat.total_sold} Sold</span>
                          <span>{cat.current_stock} In-Stock</span>
                       </div>
                    </div>
                  );
               })}
            </div>
         </div>
      </div>

      <style>{`
        .intelligence-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-top: 2rem; }
        .stat-card { background: var(--bg-card); border: 1px solid var(--border); padding: 1.5rem; border-radius: 20px; display: flex; flex-direction: column; gap: 8px; }
        .stat-card.gold-border { border-left: 4px solid #D4AF37; }
        .stat-card.red-border { border-left: 4px solid #ef4444; }
        .stat-card.blue-border { border-left: 4px solid #3b82f6; }
        .stat-card.green-border { border-left: 4px solid #22c55e; }
        .stat-icon { margin-bottom: 0.5rem; opacity: 0.8; }
        .stat-val { font-size: 1.8rem; font-weight: 800; color: white; }
        .stat-label { font-size: 0.75rem; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

        .intel-section { background: var(--bg-card); border: 1px solid var(--border); padding: 2.5rem; border-radius: 24px; min-height: 400px; display: flex; flex-direction: column; }
        .intel-section.full-width { grid-column: span 2; }
        @media (min-width: 1400px) {
           .intel-section.full-width { grid-column: span 2; }
           .intelligence-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 1200px) {
           .intelligence-grid { grid-template-columns: 1fr 1fr; }
           .intel-section.full-width { grid-column: span 2; }
        }

        .section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; }
        .section-head h3 { font-size: 1.1rem; color: white; letter-spacing: 0.5px; }

        .intel-list.scrollable { flex: 1; overflow-y: auto; padding-right: 10px; }
        .list-item { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem; background: rgba(0,0,0,0.2); border-radius: 16px; margin-bottom: 0.75rem; border: 1px solid rgba(255,255,255,0.03); }
        .item-meta { display: flex; flex-direction: column; gap: 4px; }
        .item-meta strong { color: #eee; font-size: 0.95rem; }
        .item-meta span { color: #555; font-size: 0.75rem; font-weight: 600; }
        .item-age { font-size: 0.8rem; font-weight: 800; padding: 4px 12px; border-radius: 30px; }
        .item-age.urgent { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .item-age.danger { color: #ef4444; }
        .item-age.safe { color: #22c55e; }
        .empty { text-align: center; color: #444; margin-top: 4rem; font-style: italic; }

        .insights-ticker { display: flex; align-items: center; gap: 1.5rem; background: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.1); padding: 12px 2rem; border-radius: 16px; margin-top: 1.5rem; overflow: hidden; }
        .ticker-label { font-size: 0.7rem; font-weight: 900; color: #D4AF37; display: flex; align-items: center; gap: 6px; letter-spacing: 1px; white-space: nowrap; }
        .ticker-content { display: flex; gap: 2.5rem; overflow-x: auto; scrollbar-width: none; }
        .insight-msg { font-size: 0.85rem; color: #ccc; white-space: nowrap; border-right: 1px solid rgba(255,255,255,0.05); padding-right: 2.5rem; }
        .insight-msg:last-child { border: none; }

        .rfm-tag { font-size: 0.6rem; font-weight: 900; padding: 2px 6px; border-radius: 4px; border: 1px solid transparent; letter-spacing: 0.5px; }

        .velocity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
        .vel-card { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.03); }
        .vel-info { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1rem; }
        .vel-info label { font-weight: 800; color: #eee; font-size: 0.9rem; }
        .vel-info span { font-size: 0.75rem; color: #D4AF37; font-weight: 700; }
        .vel-bar-bg { height: 6px; background: #111; border-radius: 10px; overflow: hidden; margin-bottom: 1rem; }
        .vel-bar-fill { height: 100%; border-radius: 10px; }
        .vel-stats { display: flex; justify-content: space-between; font-size: 0.7rem; color: #444; font-weight: 700; text-transform: uppercase; }
      `}</style>
    </div>
  );
};

export default IntelligenceHub;
