import React, { useState, useEffect } from 'react';
import { OrderAPI } from '../api/api';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  Package, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Wallet,
  Printer,
  ChevronRight,
  User,
  Phone,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState<any>(null);
  
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_mobile: '',
    description: '',
    expected_weight: '',
    purity: '22K',
    gold_rate_fixed: '',
    delivery_date: ''
  });

  const [advance, setAdvance] = useState({ amount: '', payment_mode: 'CASH' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await OrderAPI.getAll();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await OrderAPI.create(newOrder);
      setShowOrderModal(false);
      fetchOrders();
      setNewOrder({
        customer_name: '', customer_mobile: '', description: '',
        expected_weight: '', purity: '22K', gold_rate_fixed: '', delivery_date: ''
      });
    } catch (err) {
      alert('Failed to create order');
    }
  };

  const handleAddAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await OrderAPI.submitAdvance(showAdvanceModal.id, advance);
      setShowAdvanceModal(null);
      fetchOrders();
      setAdvance({ amount: '', payment_mode: 'CASH' });
    } catch (err) {
      alert('Failed to record advance');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await OrderAPI.updateStatus(id, status);
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#FFA500';
      case 'MANUFACTURING': return '#3B82F6';
      case 'READY': return '#22C55E';
      case 'DELIVERED': return '#888';
      default: return '#FFF';
    }
  };

  if (loading) return <div className="main-content">Loading specialized orders...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Custom Order Management</h1>
          <p>Track bookings, advances, and manufacturing progress.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowOrderModal(true)}>
          <Plus size={18} /> New Specialized Order
        </button>
      </header>

      <div className="orders-pipeline">
        <div className="pipeline-column">
           <h3><Clock size={18} color="#FFA500" /> Pending / New</h3>
           <div className="order-list">
              {orders.filter(o => o.status === 'PENDING').map(o => (
                <OrderCard key={o.id} order={o} onStatus={() => handleStatusChange(o.id, 'MANUFACTURING')} onAdvance={() => setShowAdvanceModal(o)} />
              ))}
           </div>
        </div>
        <div className="pipeline-column">
           <h3><Package size={18} color="#3B82F6" /> In Manufacturing</h3>
           <div className="order-list">
              {orders.filter(o => o.status === 'MANUFACTURING').map(o => (
                <OrderCard key={o.id} order={o} onStatus={() => handleStatusChange(o.id, 'READY')} onAdvance={() => setShowAdvanceModal(o)} />
              ))}
           </div>
        </div>
        <div className="pipeline-column">
           <h3><CheckCircle2 size={18} color="#22C55E" /> Ready for Delivery</h3>
           <div className="order-list">
              {orders.filter(o => o.status === 'READY').map(o => (
                <OrderCard key={o.id} order={o} onStatus={() => handleStatusChange(o.id, 'DELIVERED')} onAdvance={() => setShowAdvanceModal(o)} />
              ))}
           </div>
        </div>
      </div>

      {/* NEW ORDER MODAL */}
      <AnimatePresence>
        {showOrderModal && (
          <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="modal-content" onClick={e => e.stopPropagation()}>
               <div className="modal-header">
                  <h3>Record Specialized Order</h3>
                  <button className="close-btn" onClick={() => setShowOrderModal(false)}>×</button>
               </div>
               <form onSubmit={handleCreateOrder} className="modal-body">
                  <div className="form-grid">
                    <div className="form-group"><label>Customer Name</label><input type="text" value={newOrder.customer_name} onChange={e => setNewOrder({...newOrder, customer_name: e.target.value})} required /></div>
                    <div className="form-group"><label>Mobile</label><input type="text" value={newOrder.customer_mobile} onChange={e => setNewOrder({...newOrder, customer_mobile: e.target.value})} required /></div>
                  </div>
                  <div className="form-group"><label>Design Description</label><textarea rows={3} value={newOrder.description} onChange={e => setNewOrder({...newOrder, description: e.target.value})} required placeholder="e.g. 5 Layer Gold Mala, Peacock Design" /></div>
                  <div className="form-grid">
                    <div className="form-group"><label>Approx Weight (g)</label><input type="number" value={newOrder.expected_weight} onChange={e => setNewOrder({...newOrder, expected_weight: e.target.value})} /></div>
                    <div className="form-group"><label>Purity</label><input type="text" value={newOrder.purity} onChange={e => setNewOrder({...newOrder, purity: e.target.value})} /></div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group"><label>Gold Rate Fixed (₹/g)</label><input type="number" value={newOrder.gold_rate_fixed} onChange={e => setNewOrder({...newOrder, gold_rate_fixed: e.target.value})} placeholder="Optional" /></div>
                    <div className="form-group"><label>Delivery Promised Date</label><input type="date" value={newOrder.delivery_date} onChange={e => setNewOrder({...newOrder, delivery_date: e.target.value})} required /></div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Order Entry</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADVANCE MODAL */}
      <AnimatePresence>
        {showAdvanceModal && (
          <div className="modal-overlay" onClick={() => setShowAdvanceModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="modal-content small" onClick={e => e.stopPropagation()}>
               <div className="modal-header">
                  <h3>Collect Advance Payment</h3>
                  <p style={{ fontSize: '0.8rem', color: '#888' }}>Order: {showAdvanceModal.order_no}</p>
               </div>
               <form onSubmit={handleAddAdvance} className="modal-body">
                  <div className="form-group">
                     <label>Advance Amount (₹)</label>
                     <input type="number" value={advance.amount} onChange={e => setAdvance({...advance, amount: e.target.value})} required autoFocus />
                  </div>
                  <div className="form-group">
                     <label>Payment Mode</label>
                     <select value={advance.payment_mode} onChange={e => setAdvance({...advance, payment_mode: e.target.value})}>
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI / Digital</option>
                        <option value="BANK">Bank Transfer</option>
                     </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Accept & Issue Receipt</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .orders-pipeline { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; }
        .pipeline-column { background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 20px; border: 1px solid var(--border); min-height: 70vh; }
        .pipeline-column h3 { font-size: 0.9rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px; }

        .order-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; margin-bottom: 1rem; position: relative; }
        .order-no { font-size: 0.7rem; color: #888; font-weight: 700; }
        .o-customer { font-size: 1rem; font-weight: 800; color: white; margin: 4px 0; }
        .o-desc { font-size: 0.8rem; color: #666; margin-bottom: 1rem; }
        .o-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #888; margin-bottom: 1rem; padding-top: 0.5rem; border-top: 1px dashed #333; }
        .o-advance { background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 8px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .o-actions { display: flex; gap: 0.5rem; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; width: 600px; padding: 2rem; }
        .modal-content.small { width: 400px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
      `}</style>
    </div>
  );
};

const OrderCard = ({ order, onStatus, onAdvance }: any) => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="order-card">
    <div className="order-no">{order.order_no}</div>
    <div className="o-customer">{order.customer_name}</div>
    <div className="o-desc">{order.description}</div>
    <div className="o-meta">
       <span><Package size={12} /> {order.expected_weight}g</span>
       <span><Calendar size={12} /> {new Date(order.delivery_date).toLocaleDateString()}</span>
    </div>
    <div className="o-advance">
       <span>Advance Received:</span>
       <span>₹{(order.total_advance || 0).toLocaleString()}</span>
    </div>
    <div className="o-actions">
       <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }} onClick={onAdvance}>+ Advance</button>
       {order.status !== 'DELIVERED' && (
         <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }} onClick={onStatus}>
           Next Stage <ChevronRight size={14} />
         </button>
       )}
    </div>
  </motion.div>
);

export default Orders;
