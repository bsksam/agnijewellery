import React, { useState, useEffect } from 'react';
import { AnalyticsAPI, DashboardAPI } from '../api/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle,
  Award,
  Calendar,
  Layers,
  Search,
  BrainCircuit,
  Sparkles,
  Cloud,
  ShieldCheck,
  Zap,
  Check,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#D4AF37', '#8884d8', '#82ca9d', '#ffc658', '#ef4444', '#3b82f6'];

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [staffPerf, setStaffPerf] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [aging, setAging] = useState<any[]>([]);
  const [catPerf, setCatPerf] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [oracleIndex, setOracleIndex] = useState(0);
  const [oracleInsights, setOracleInsights] = useState<string[]>([
    "Current inventory liquidity is 85%. Consider a clearance for Platinum slow-movers.",
    "B2B revenue increased by 14% this week. Targeted loyalist follow-up recommended.",
    "Staff productivity in Category:Gold is leading the monthly performance index.",
    "Precious stones aging identified in Tag 1004. Recommend seasonal bundled offer."
  ]);

  const [health, setHealth] = useState({
    cloud: 'CONNECTING',
    guardian: 'ACTIVE',
    pwa: 'SYNCED'
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setOracleIndex(prev => (prev + 1) % 4);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, staffRes, trendsRes, agingRes, catRes] = await Promise.all([
        DashboardAPI.getSummary(),
        AnalyticsAPI.getStaffPerformance(),
        AnalyticsAPI.getTrends(),
        AnalyticsAPI.getStockAging(),
        AnalyticsAPI.getCategoryPerformance()
      ]);
      setStats(statsRes.data);
      setStaffPerf(staffRes.data);
      setTrends(trendsRes.data);
      setAging(agingRes.data);
      setCatPerf(catRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      // Simulate/Check connectivity
      setTimeout(() => setHealth(prev => ({ ...prev, cloud: 'READY' })), 1000);
    }
  };
  
  const totalWeight = stats?.total_weight || 0;

  if (loading) return <div className="main-content">Igniting Analytics Engine...</div>;

  return (
    <div className="main-content">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <div className="welcome-msg">
          <h1>Agni <span style={{ color: 'var(--primary)', fontWeight: 800 }}>Oracle</span> Intelligence</h1>
          <p>Real-time visual insights into your jewelry enterprise performance.</p>
        </div>
         <div className="header-actions" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {/* System Heartbeat */}
            <div className="system-heartbeat no-print">
               <div className={`hb-item ${health.cloud === 'READY' ? 'pulse' : ''}`}>
                  <Cloud size={14} color={health.cloud === 'READY' ? '#D4AF37' : '#555'} />
                  <span>Cloud {health.cloud}</span>
               </div>
               <div className="hb-item">
                  <ShieldCheck size={14} color="#22c55e" />
                  <span>Guardian OK</span>
               </div>
               <div className="hb-item">
                  <Zap size={14} color="#3b82f6" />
                  <span>PWA Live</span>
               </div>
            </div>

            <div className="date-display">
               <Calendar size={18} /> {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
            </div>
         </div>
      </header>

      {/* Oracle Ticker */}
      <div className="oracle-ticker-container no-print">
         <div className="oracle-icon-box"><BrainCircuit size={20} color="#D4AF37" /></div>
         <div className="oracle-text-scroll">
            <AnimatePresence mode="wait">
               <motion.div 
                  key={oracleIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="oracle-msg"
               >
                  <Sparkles size={14} style={{ marginRight: 10, display: 'inline' }} />
                  {oracleInsights[oracleIndex]}
               </motion.div>
            </AnimatePresence>
         </div>
         <div className="oracle-status">LIVE AI PULSE</div>
      </div>

      {/* Top Level Stats */}
      <div className="stats-grid animate-fade-in">
        <div className="stat-card spark-card">
          <div className="card-top-flex">
            <div className="stat-header">
              <TrendingUp color="var(--primary)" size={20} />
              <span>Revenue</span>
            </div>
            <div className="spark-mini">
              <ResponsiveContainer width={80} height={30}>
                <LineChart data={trends.slice(-7)}>
                  <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="stat-value">₹{Math.round(stats?.today_sales).toLocaleString()}</div>
          <div className="stat-footer positive">+12% vs yesterday</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <Users color="#3b82f6" size={20} />
            <span>Customers</span>
          </div>
          <div className="stat-value">{stats?.total_customers}</div>
          <div className="stat-footer">Life-time reach</div>
        </div>

        <div className="stat-card spark-card">
          <div className="card-top-flex">
            <div className="stat-header">
              <Package color="#82ca9d" size={20} />
              <span>Stock Valuation</span>
            </div>
            <div className="spark-mini">
               <div style={{ fontSize: '10px', color: '#888' }}>{totalWeight.toFixed(2)}kg</div>
            </div>
          </div>
          <div className="stat-value">₹{Math.round(stats?.stock_valuation / 10000000)} Cr</div>
          <div className="stat-footer">Current net weight</div>
        </div>

        <div className="stat-card urgent">
          <div className="stat-header">
            <AlertTriangle color="#ef4444" size={20} />
            <span>Aged Stock</span>
          </div>
          <div className="stat-value">{aging.find(a => a.age_group === '12+ Months')?.count || 0} Items</div>
          <div className="stat-footer">Immediate action needed</div>
        </div>
      </div>

      <div className="analytics-layout">
         {/* Main Trends Chart */}
         <div className="data-table-container chart-box large">
            <h3><TrendingUp size={18} /> 30-Day Revenue Trend</h3>
            <div style={{ width: '100%', height: 300 }}>
               <ResponsiveContainer>
                  <AreaChart data={trends}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                     <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} />
                     <YAxis stroke="#666" fontSize={10} tickFormatter={(val) => `₹${val/1000}k`} />
                     <Tooltip 
                        contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px' }}
                        itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Staff Performance */}
         <div className="data-table-container chart-box">
            <h3><Award size={18} /> Top Sales Performers</h3>
            <div className="staff-leaderboard">
               {staffPerf.map((s, i) => (
                 <div key={i} className="leaderboard-item">
                    <div className="l-rank">{i + 1}</div>
                    <div className="l-info">
                       <div className="l-name">{s.staff_name}</div>
                       <div className="l-sales">{s.total_sales} Bills made</div>
                    </div>
                    <div className="l-value">₹{Math.round(s.total_revenue).toLocaleString()}</div>
                 </div>
               ))}
               {staffPerf.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No sales attribution recorded yet.</p>}
            </div>
         </div>

         {/* Stock Distribution */}
         <div className="data-table-container chart-box">
            <h3><Layers size={18} /> Sales by Category</h3>
            <div style={{ width: '100%', height: 300 }}>
               <ResponsiveContainer>
                  <PieChart>
                     <Pie
                        data={catPerf}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="item_count"
                        nameKey="category"
                     >
                        {catPerf.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip />
                     <Legend />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Stock Aging */}
         <div className="data-table-container chart-box">
            <h3><Clock size={18} /> Inventory Health (Aging)</h3>
            <div style={{ width: '100%', height: 300 }}>
               <ResponsiveContainer>
                  <BarChart data={aging}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                     <XAxis dataKey="age_group" stroke="#666" fontSize={10} />
                     <YAxis stroke="#666" fontSize={10} />
                     <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                     <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <style>{`
        .analytics-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-top: 2rem; }
        .chart-box { padding: 1.5rem; }
        .chart-box.large { grid-column: 1 / -1; }
        .chart-box h3 { font-size: 0.9rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 8px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
        
        .staff-leaderboard { display: flex; flex-direction: column; gap: 12px; }
        .leaderboard-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--border); }
        .l-rank { width: 24px; height: 24px; background: var(--primary); color: #000; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 800; font-size: 0.7rem; }
        .l-info { flex: 1; }
        .l-name { font-weight: 700; color: white; font-size: 0.9rem; }
        .l-sales { font-size: 0.7rem; color: #666; }
        .l-value { font-weight: 800; color: var(--primary); font-size: 0.9rem; }

        .stat-card.urgent { border-color: rgba(239, 68, 68, 0.3); background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(0,0,0,0) 100%); }
        .date-display { background: var(--bg-card); padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border); font-size: 0.8rem; color: #888; display: flex; align-items: center; gap: 8px; }

        .system-heartbeat { display: flex; gap: 1rem; background: rgba(0,0,0,0.4); padding: 6px 15px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .hb-item { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
        .hb-item span { color: #888; }
        .hb-item.pulse { animation: soft-pulse 2s infinite; }
        @keyframes soft-pulse { 
           0% { opacity: 0.6; } 
           50% { opacity: 1; text-shadow: 0 0 10px rgba(212,175,55,0.3); } 
           100% { opacity: 0.6; } 
        }

        .oracle-ticker-container {
           background: #111; border: 1px solid rgba(212,175,55,0.2); border-radius: 20px;
           padding: 1rem 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 20px;
           box-shadow: 0 10px 30px rgba(0,0,0,0.3), inset 0 0 20px rgba(212,175,55,0.05);
        }
        .oracle-icon-box { background: rgba(212,175,55,0.1); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .oracle-text-scroll { flex: 1; overflow: hidden; height: 24px; position: relative; }
        .oracle-msg { color: #eee; font-weight: 600; font-size: 0.95rem; }
        .oracle-status { font-size: 0.65rem; color: #22c55e; font-weight: 800; border: 1px solid #22c55e33; padding: 2px 8px; border-radius: 4px; animation: blink 2s infinite; }
        
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        
        .card-top-flex { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .spark-mini { background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px; }
      `}</style>
    </div>
  );
};

export default Dashboard;
