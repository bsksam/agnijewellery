import React, { useState, useEffect } from 'react';
import { MasterAPI } from '../api/api';
import { Plus, Save, X, Package, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MasterData = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [view, setView] = useState<'categories' | 'products'>('categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [catForm, setCatForm] = useState({ name: '', description: '', hsn_code: '', tax_percent: 3.0 });
  const [proForm, setProForm] = useState({ category_id: '', name: '', purity: '', mc_per_gram: 0, wastage_percent: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, proRes] = await Promise.all([
        MasterAPI.getCategories(),
        MasterAPI.getProducts()
      ]);
      setCategories(catRes.data);
      setProducts(proRes.data);
      if (catRes.data.length > 0) {
        setProForm(prev => ({ ...prev, category_id: catRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch master data', err);
    }
  };

  const handleAddCategory = async () => {
    try {
      await MasterAPI.createCategory(catForm);
      setIsModalOpen(false);
      fetchData();
      setCatForm({ name: '', description: '', hsn_code: '', tax_percent: 3.0 });
    } catch (err) {
      console.error('Failed to add category', err);
    }
  };

  const handleAddProduct = async () => {
    try {
      await MasterAPI.createProduct(proForm);
      setIsModalOpen(false);
      fetchData();
      setProForm({ ...proForm, name: '', purity: '' });
    } catch (err) {
      console.error('Failed to add product', err);
    }
  };

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Master Data Management</h1>
          <p>Configure Categories and Product definitions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Add New {view === 'categories' ? 'Category' : 'Product'}
        </button>
      </header>

      <div className="tabs">
        <button 
          className={`tab ${view === 'categories' ? 'active' : ''}`}
          onClick={() => setView('categories')}
        >
          <Layers size={18} />
          Categories
        </button>
        <button 
          className={`tab ${view === 'products' ? 'active' : ''}`}
          onClick={() => setView('products')}
        >
          <Package size={18} />
          Products
        </button>
      </div>

      <div className="data-table-container">
        {view === 'categories' ? (
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>HSN Code</th>
                <th>Tax %</th>
                <th>Description</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ fontFamily: 'monospace', color: '#D4AF37' }}>{c.hsn_code || '---'}</td>
                  <td>{c.tax_percent}%</td>
                  <td>{c.description || '-'}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Purity</th>
                <th>Wastage %</th>
                <th>MC / Gram</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.category_name}</td>
                  <td>{p.purity}</td>
                  <td>{p.wastage_percent}%</td>
                  <td>₹ {p.mc_per_gram}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="modal-content"
            >
              <div className="modal-header">
                <h3>Add {view === 'categories' ? 'Category' : 'Product'}</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}><X /></button>
              </div>
              
              {view === 'categories' ? (
                <>
                  <div className="form-group">
                    <label>Category Name</label>
                    <input 
                      type="text" value={catForm.name}
                      onChange={(e) => setCatForm({...catForm, name: e.target.value})}
                      placeholder="e.g. GOLD"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <input 
                      type="text" value={catForm.description}
                      onChange={(e) => setCatForm({...catForm, description: e.target.value})}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>HSN Code</label>
                        <input 
                          type="text" value={catForm.hsn_code}
                          onChange={(e) => setCatForm({...catForm, hsn_code: e.target.value})}
                          placeholder="e.g. 7113"
                        />
                      </div>
                      <div className="form-group">
                        <label>Tax % (GST)</label>
                        <input 
                          type="number" value={catForm.tax_percent}
                          onChange={(e) => setCatForm({...catForm, tax_percent: parseFloat(e.target.value)})}
                        />
                      </div>
                  </div>
                  <div className="modal-actions">
                    <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleAddCategory}>Save Category</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      value={proForm.category_id}
                      onChange={(e) => setProForm({...proForm, category_id: e.target.value})}
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input 
                      type="text" value={proForm.name}
                      onChange={(e) => setProForm({...proForm, name: e.target.value})}
                      placeholder="e.g. Men's Ring"
                    />
                  </div>
                  <div className="form-group">
                    <label>Default Purity</label>
                    <input 
                      type="text" value={proForm.purity}
                      onChange={(e) => setProForm({...proForm, purity: e.target.value})}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Wastage %</label>
                      <input 
                        type="number" value={proForm.wastage_percent}
                        onChange={(e) => setProForm({...proForm, wastage_percent: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>MC / Gram</label>
                      <input 
                        type="number" value={proForm.mc_per_gram}
                        onChange={(e) => setProForm({...proForm, mc_per_gram: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleAddProduct}>Save Product</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }
        .tab {
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          border-radius: 8px;
        }
        .tab:hover {
          color: var(--primary);
          background: rgba(212, 175, 55, 0.05);
        }
        .tab.active {
          color: var(--primary);
          background: rgba(212, 175, 55, 0.1);
        }
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content {
          background: var(--bg-card); padding: 2rem; border-radius: 24px;
          border: 1px solid var(--border); width: 100%; max-width: 500px;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
        }
        .close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; }
        .form-group input, .form-group select {
          width: 100%; background: var(--bg-dark); border: 1px solid var(--border);
          padding: 0.75rem 1rem; border-radius: 12px; color: white; font-family: inherit;
        }
        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
      `}</style>
    </div>
  );
};

export default MasterData;
