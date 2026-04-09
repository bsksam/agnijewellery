import React, { useState, useEffect } from 'react';
import { RatesAPI } from '../api/api';
import { TrendingUp, Plus, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RateManagement = () => {
  const [rates, setRates] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRate, setNewRate] = useState({ metal: 'GOLD', purity: '91.60', rate: '' });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await RatesAPI.getLatestRates();
      setRates(res.data);
    } catch (err) {
      console.error('Failed to fetch rates', err);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!newRate.rate) return;
      await RatesAPI.updateRate({
        ...newRate,
        rate: parseFloat(newRate.rate)
      });
      setIsModalOpen(false);
      fetchRates();
      setNewRate({ ...newRate, rate: '' });
    } catch (err) {
      console.error('Failed to update rate', err);
    }
  };

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Rate Management</h1>
          <p>Update and monitor daily jewelry rates.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Update Today's Rate
        </button>
      </header>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {rates.length > 0 ? rates.map((r: any) => (
          <div key={r.id} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="stat-label">{r.metal} ({r.purity}%)</span>
              <TrendingUp size={20} color="#D4AF37" />
            </div>
            <div className="stat-value">₹ {r.selling_rate.toLocaleString()}</div>
            <span className="rate-badge">Last Update: {new Date(r.date).toLocaleDateString()}</span>
          </div>
        )) : (
          <div className="stat-card">
            <span className="stat-label">No rates updated for today yet.</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="modal-content"
            >
              <div className="modal-header">
                <h3>Update Daily Rate</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}><X /></button>
              </div>
              
              <div className="form-group">
                <label>Metal</label>
                <select 
                  value={newRate.metal} 
                  onChange={(e) => setNewRate({...newRate, metal: e.target.value})}
                >
                  <option value="GOLD">GOLD</option>
                  <option value="SILVER">SILVER</option>
                  <option value="PLATINUM">PLATINUM</option>
                </select>
              </div>

              <div className="form-group">
                <label>Purity (%)</label>
                <input 
                  type="text" 
                  value={newRate.purity}
                  onChange={(e) => setNewRate({...newRate, purity: e.target.value})}
                  placeholder="e.g. 91.60"
                />
              </div>

              <div className="form-group">
                <label>Rate (₹ per gram)</label>
                <input 
                  type="number" 
                  value={newRate.rate}
                  onChange={(e) => setNewRate({...newRate, rate: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="modal-actions">
                <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpdate}>
                  <Save size={18} />
                  Save Rate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--bg-card);
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          width: 100%;
          max-width: 450px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .form-group input, .form-group select {
          width: 100%;
          background: var(--bg-dark);
          border: 1px solid var(--border);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          color: white;
          font-family: inherit;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default RateManagement;
