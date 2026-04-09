import React, { useState, useEffect } from 'react';
import { CustomerAPI } from '../api/api';
import { 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Eye, 
  X, 
  TrendingUp,
  Cake,
  Heart,
  Award,
  Crown,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await CustomerAPI.getAll();
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = async (id: number) => {
    try {
      const res = await CustomerAPI.getById(id);
      setSelectedCustomer(res.data);
    } catch (err) {
      alert('Failed to load customer details');
    }
  };

  const getTierBadge = (spend: number) => {
      if (spend >= 1000000) return <span title="PLATINUM"><Crown size={16} color="#D4AF37" /></span>;
      if (spend >= 100000) return <span title="GOLD"><Award size={16} color="#D4AF37" /></span>;
      return <span title="SILVER"><Star size={16} color="#666" /></span>;
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile.includes(searchTerm)
  );

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Customer CRM & Intelligence</h1>
          <p>Analyze client behavior, milestone dates, and loyalty value.</p>
        </div>
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by Name or Mobile..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
           <span className="stat-label">Total Unique Customers</span>
           <div className="stat-value">{customers.length}</div>
        </div>
        <div className="stat-card">
           <span className="stat-label">Platinum Clients (₹10L+)</span>
           <div className="stat-value">{customers.filter(c => (c.total_spent || 0) >= 1000000).length}</div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Tier</th>
              <th>Mobile</th>
              <th>Total Bills</th>
              <th>Lifetime Spend (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{getTierBadge(c.total_spent || 0)}</td>
                <td>{c.mobile}</td>
                <td>{c.total_bills}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  ₹{Math.round(c.total_spent || 0).toLocaleString()}
                </td>
                <td>
                  <button className="btn-icon" onClick={() => handleViewCustomer(c.id)}>
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedCustomer && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="modal-content large"
            >
              <div className="modal-header">
                <h3>Customer Discovery Profile</h3>
                <button className="close-btn" onClick={() => setSelectedCustomer(null)}><X /></button>
              </div>

              <div className="customer-profile-grid">
                <div className="profile-sidebar">
                  <div className="profile-avatar">
                     {getTierBadge(selectedCustomer.total_spent || 0)}
                  </div>
                  <h2>{selectedCustomer.name}</h2>
                  <p className="mobile"><Phone size={14} /> {selectedCustomer.mobile}</p>
                  
                  <div className="profile-details-list">
                    <div className="detail-item"><MapPin size={14} /> {selectedCustomer.address || 'Local Customer'}</div>
                    <div className="detail-item"><Cake size={14} /> Birthday: {selectedCustomer.dob ? new Date(selectedCustomer.dob).toLocaleDateString() : 'Not recorded'}</div>
                    <div className="detail-item"><Heart size={14} /> Anniversary: {selectedCustomer.anniversary_date ? new Date(selectedCustomer.anniversary_date).toLocaleDateString() : 'Not recorded'}</div>
                    <div className="detail-item"><Calendar size={14} /> Joined: {new Date(selectedCustomer.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="profile-main">
                  <h3><ShoppingBag size={18} /> Deep Purchase History</h3>
                  <div className="history-list">
                    {selectedCustomer.history?.map((sale: any) => (
                      <div key={sale.bill_no} className="history-card">
                        <div className="history-header">
                           <span className="bill-no">{sale.bill_no}</span>
                           <span className="bill-date">{new Date(sale.bill_date).toLocaleDateString()}</span>
                        </div>
                        <div className="history-body">
                           <span className="bill-amount">₹{Math.round(sale.net_amount).toLocaleString()}</span>
                           <span className="bill-mode">{sale.payment_mode}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .customer-profile-grid { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; margin-top: 1rem; }
        .profile-sidebar { border-right: 1px solid var(--border); padding-right: 2rem; }
        .profile-avatar { width: 80px; height: 80px; background: rgba(255,255,255,0.03); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; border: 1px solid var(--border); }
        .profile-sidebar h2 { margin-bottom: 0.5rem; }
        .profile-sidebar .mobile { color: var(--primary); font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 1.5rem; }
        .profile-details-list { display: flex; flex-direction: column; gap: 1rem; color: var(--text-secondary); font-size: 0.9rem; }
        .detail-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px; }
        .history-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; max-height: 450px; overflow-y: auto; padding-right: 10px; }
        .history-card { background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 1.25rem; border-radius: 16px; }
        .history-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .bill-no { font-weight: 800; color: var(--primary); letter-spacing: 0.5px; }
        .bill-date { font-size: 0.8rem; color: #666; }
        .history-body { display: flex; justify-content: space-between; align-items: center; }
        .bill-amount { font-weight: 800; font-size: 1.1rem; color: white; }
        .bill-mode { font-size: 0.65rem; background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 6px; font-weight: 900; text-transform: uppercase; color: #888; }
      `}</style>
    </div>
  );
};

export default Customers;
