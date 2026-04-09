import React, { useState, useEffect } from 'react';
import { CRMAPI } from '../api/api';
import { 
  Cake, 
  Heart, 
  Smartphone, 
  MessageCircle, 
  Trophy, 
  TrendingUp, 
  User, 
  Star,
  Award,
  Crown,
  Calendar,
  Clock,
  Search,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Marketing = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loyalty, setLoyalty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'EVENTS' | 'LOYALTY'>('EVENTS');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, loyaltyRes] = await Promise.all([
        CRMAPI.getUpcomingEvents(),
        CRMAPI.getLoyaltyReport()
      ]);
      setEvents(eventsRes.data);
      setLoyalty(loyaltyRes.data);
    } catch (err) {
      console.error('Failed to fetch CRM data', err);
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppLink = (mobile: string, type: 'BIRTHDAY' | 'ANNIVERSARY', name: string) => {
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    const message = type === 'BIRTHDAY' 
      ? `Dear ${name}, Happy Birthday from Agni Jewellery! 🎂 We have a special gift waiting for you at our showroom. Visit us today for an exclusive surprise! ✨`
      : `Dear ${name}, Happy Wedding Anniversary from Agni Jewellery! 🥂 Celebrate your milestone with our premium collection. Show this message to get a special discount on your purchase today! 💎`;
    
    return `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(message)}`;
  };

  if (loading) return <div className="main-content">Accessing Customer IQ...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Marketing & Loyalty Hub</h1>
          <p>Drive repeat sales through personalized outreach and VIP recognition.</p>
        </div>
        <div className="view-switcher">
           <button className={`btn ${activeView === 'EVENTS' ? 'btn-primary' : ''}`} onClick={() => setActiveView('EVENTS')}>
              <Calendar size={18} /> Upcoming Events
           </button>
           <button className={`btn ${activeView === 'LOYALTY' ? 'btn-primary' : ''}`} onClick={() => setActiveView('LOYALTY')}>
              <Trophy size={18} /> Loyalty Leaderboard
           </button>
        </div>
      </header>

      {activeView === 'EVENTS' ? (
        <section className="events-hub">
           <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="stat-card">
                 <div className="stat-header"><Cake size={18} color="#D4AF37" /> <span>Birthdays This Month</span></div>
                 <div className="stat-value">{events.filter(e => e.days_to_birthday <= 30).length}</div>
              </div>
              <div className="stat-card">
                 <div className="stat-header"><Heart size={18} color="#ef4444" /> <span>Anniversaries This Month</span></div>
                 <div className="stat-value">{events.filter(e => e.days_to_anniversary <= 30).length}</div>
              </div>
           </div>

           <div className="data-table-container">
              <h3>Upcoming Special Occasions (Next 30 Days)</h3>
              <div className="event-list" style={{ marginTop: '1.5rem' }}>
                 {events.length === 0 ? (
                   <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No upcoming events in the next 30 days.</div>
                 ) : (
                   events.map(e => (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={e.id} className="event-row">
                        <div className="event-type-icon">
                           {e.days_to_birthday <= e.days_to_anniversary ? <Cake size={20} color="#D4AF37" /> : <Heart size={20} color="#ef4444" />}
                        </div>
                        <div className="event-customer">
                           <strong>{e.name}</strong>
                           <span>{e.mobile}</span>
                        </div>
                        <div className="event-info">
                           <div className="event-label">{e.days_to_birthday <= e.days_to_anniversary ? 'BIRTHDAY' : 'ANNIVERSARY'}</div>
                           <div className="event-date">
                             {e.days_to_birthday <= e.days_to_anniversary ? new Date(e.dob).toLocaleDateString() : new Date(e.anniversary_date).toLocaleDateString()}
                           </div>
                        </div>
                        <div className="event-countdown">
                           In <strong>{Math.min(e.days_to_birthday, e.days_to_anniversary)} Days</strong>
                        </div>
                        <a 
                          href={getWhatsAppLink(e.mobile, e.days_to_birthday <= e.days_to_anniversary ? 'BIRTHDAY' : 'ANNIVERSARY', e.name)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-whatsapp"
                        >
                           <MessageCircle size={14} /> Send Greeting
                        </a>
                     </motion.div>
                   ))
                 )}
              </div>
           </div>
        </section>
      ) : (
        <section className="loyalty-hub">
           <div className="loyalty-grid">
              {loyalty.map((c, index) => (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={c.id} className={`loyalty-card ${c.loyalty_tier}`}>
                   <div className="rank">#{index + 1}</div>
                   <div className="tier-badge">
                      {c.loyalty_tier === 'PLATINUM' && <Crown size={24} color="#D4AF37" />}
                      {c.loyalty_tier === 'GOLD' && <Award size={24} color="#D4AF37" />}
                      {c.loyalty_tier === 'SILVER' && <Star size={24} color="#888" />}
                   </div>
                   <div className="l-customer">
                      <h3>{c.name}</h3>
                      <p>{c.mobile}</p>
                   </div>
                   <div className="l-stats">
                      <div className="l-stat">
                         <span>Lifetime Spend</span>
                         <strong>₹{Math.round(c.lifetime_spend).toLocaleString()}</strong>
                      </div>
                      <div className="l-stat">
                         <span>Purchases</span>
                         <strong>{c.total_bills}</strong>
                      </div>
                   </div>
                   <div className={`tier-tag ${c.loyalty_tier}`}>{c.loyalty_tier}</div>
                </motion.div>
              ))}
           </div>
        </section>
      )}

      <style>{`
        .view-switcher { display: flex; gap: 1rem; }
        .event-list { display: flex; flex-direction: column; gap: 12px; }
        .event-row { display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .event-type-icon { background: rgba(0,0,0,0.2); padding: 10px; border-radius: 10px; }
        .event-customer { flex: 1; display: flex; flex-direction: column; }
        .event-customer strong { font-size: 1rem; color: white; }
        .event-customer span { font-size: 0.8rem; color: #666; }
        .event-info { text-align: right; }
        .event-label { font-size: 0.6rem; font-weight: 800; color: #888; }
        .event-date { font-size: 0.85rem; color: #ccc; font-weight: 600; }
        .event-countdown { background: rgba(255,255,255,0.03); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; color: #888; }
        .event-countdown strong { color: var(--primary); }
        .btn-whatsapp { background: #25D366 !important; color: white !important; border: none !important; }

        .loyalty-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .loyalty-card { padding: 2rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .loyalty-card.PLATINUM { border: 2px solid #D4AF37; background: linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(0,0,0,0) 100%); }
        .loyalty-card.GOLD { border: 1px solid #D4AF3766; }
        
        .rank { position: absolute; left: 1.5rem; top: 1.5rem; font-size: 0.8rem; font-weight: 800; color: #444; }
        .tier-badge { margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .l-customer h3 { margin: 0; font-size: 1.2rem; color: white; }
        .l-customer p { font-size: 0.8rem; color: #666; margin-top: 4px; }
        .l-stats { display: flex; gap: 2rem; margin-top: 2rem; width: 100%; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; }
        .l-stat { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .l-stat span { font-size: 0.65rem; color: #555; text-transform: uppercase; }
        .l-stat strong { font-size: 1rem; color: #CCC; }
        
        .tier-tag { position: absolute; right: -25px; top: 15px; transform: rotate(45deg); width: 100px; padding: 4px; font-size: 0.6rem; font-weight: 900; background: #222; color: #666; }
        .PLATINUM .tier-tag { background: #D4AF37; color: black; }
        .GOLD .tier-tag { background: #D4AF3733; color: #D4AF37; }
        .PLATINUM .l-stat strong { color: #D4AF37; }
      `}</style>
    </div>
  );
};

export default Marketing;
