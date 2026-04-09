import React, { useState, useEffect } from 'react';
import { StockAPI, MasterAPI, RatesAPI, BranchAPI } from '../api/api';
import { 
  Plus, Search, Tag, Box, Info, ShieldCheck, MoreHorizontal, FileText, X, Printer, 
  Tag as TagIcon, MapPin, ArrowLeftRight, Building2, Eye, EyeOff 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TagLabel from '../components/TagLabel';

const Inventory = () => {
  const [stock, setStock] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [currentRates, setCurrentRates] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [printingTag, setPrintingTag] = useState<any>(null);
  const [selectedTagForTransfer, setSelectedTagForTransfer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({
    tag_no: '', product_id: '', gross_weight: '', net_weight: '',
    stone_weight: '0', stone_value: '0', wastage_percent: '0',
    making_charge_per_gram: '0', touch: '91.60', hallmark_charges: '0',
    huid1: '', huid2: '', narration: '', branch_id: '1'
  });

  const [transferForm, setTransferForm] = useState({ to_branch_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stockRes, catRes, proRes, ratesRes, branchRes] = await Promise.all([
        StockAPI.getAllStock(),
        MasterAPI.getCategories(),
        MasterAPI.getProducts(),
        RatesAPI.getLatestRates(),
        BranchAPI.getAll()
      ]);
      setStock(stockRes.data);
      setCategories(catRes.data);
      setProducts(proRes.data);
      setCurrentRates(ratesRes.data);
      setBranches(branchRes.data);
      if (proRes.data.length > 0) {
        setForm(prev => ({ ...prev, product_id: proRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch inventory data', err);
    }
  };

  const handleToggleGallery = async (tagNo: string, currentStatus: boolean) => {
    try {
      await StockAPI.toggleGalleryStatus(tagNo, !currentStatus);
      setStock(stock.map(s => s.tag_no === tagNo ? { ...s, show_in_gallery: !currentStatus ? 1 : 0 } : s));
    } catch (err) {
      alert('Failed to update gallery visibility');
    }
  };

  const handleAddStock = async () => {
    try {
      const weight = parseFloat(form.net_weight) || 0;
      const wastagePct = parseFloat(form.wastage_percent) || 0;
      const mcPerGm = parseFloat(form.making_charge_per_gram) || 0;
      const touch = parseFloat(form.touch) || 100;
      const goldRate = currentRates.find(r => r.metal === 'GOLD')?.selling_rate || 0;
      const minVal = (goldRate * weight * (touch / 100));

      const payload = {
        ...form,
        gross_weight: parseFloat(form.gross_weight),
        net_weight: parseFloat(form.net_weight),
        stone_weight: parseFloat(form.stone_weight),
        stone_value: parseFloat(form.stone_value),
        wastage_percent: wastagePct,
        making_charge_per_gram: mcPerGm,
        hallmark_charges: parseFloat(form.hallmark_charges),
        branch_id: parseInt(form.branch_id),
        touch: touch,
        min_sales_value: minVal,
        wastage_val: (weight * (wastagePct / 100)),
        mc_total: (weight * mcPerGm)
      };

      await StockAPI.createStock(payload);
      setIsModalOpen(false);
      fetchData();
      resetForm();
    } catch (err: any) {
      alert('Failed to add stock: ' + (err.response?.data?.error || err.message));
    }
  };

  const resetForm = () => {
    setForm({
      tag_no: '', product_id: products[0]?.id || '', gross_weight: '', net_weight: '',
      stone_weight: '0', stone_value: '0', wastage_percent: '0',
      making_charge_per_gram: '0', touch: '91.60', hallmark_charges: '0',
      huid1: '', huid2: '', narration: '', branch_id: '1'
    });
  };

  const handleTransfer = async () => {
    if (!selectedTagForTransfer || !transferForm.to_branch_id) return;
    try {
      await BranchAPI.transfer({
        tag_no: selectedTagForTransfer,
        to_branch_id: parseInt(transferForm.to_branch_id),
        transferred_by: 'Admin'
      });
      setIsTransferModalOpen(false);
      setSelectedTagForTransfer(null);
      setTransferForm({ to_branch_id: '' });
      fetchData();
      alert('Transfer initiated');
    } catch (err) {
      alert('Transfer failed');
    }
  };

  const filteredStock = stock.filter(s => 
    s.tag_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Stock Inventory & Distribution</h1>
          <p>Management of jewelry tags across showroom and warehouse network.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search Tag, Product, or Location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Add New Tag
          </button>
        </div>
      </header>

      <div className="data-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Tag No</th>
              <th>Product / Location</th>
              <th>Weight (G/N)</th>
              <th>HUID</th>
              <th>Purity</th>
              <th>Min Value</th>
              <th>Showroom</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.map(s => (
              <tr key={s.tag_no}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{s.tag_no}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{s.product_name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={10} /> {s.branch_name || 'Warehouse'}
                  </div>
                </td>
                <td>{s.gross_weight}g / {s.net_weight}g</td>
                <td style={{ fontSize: '0.75rem' }}>{s.huid1 || '-'}</td>
                <td>{s.touch}%</td>
                <td style={{ fontWeight: 600, color: '#FFD700' }}>₹{Math.round(s.min_sales_value).toLocaleString()}</td>
                <td>
                   <button 
                     className={`btn-icon ${s.show_in_gallery ? 'active' : ''}`}
                     title={s.show_in_gallery ? 'Shown in Public Gallery' : 'Hidden from Gallery'}
                     onClick={() => handleToggleGallery(s.tag_no, !!s.show_in_gallery)}
                   >
                     {s.show_in_gallery ? <Eye size={18} color="#D4AF37" /> : <EyeOff size={18} color="#444" />}
                   </button>
                </td>
                <td>
                  <span className={`status-pill ${s.status.toLowerCase().replace('_', '-')}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-icon" title="Print Tag" onClick={() => setPrintingTag(s)}>
                      <TagIcon size={16} />
                    </button>
                    {s.status === 'AVAILABLE' && (
                      <button className="btn-icon" title="Transfer Stock" onClick={() => { setSelectedTagForTransfer(s.tag_no); setIsTransferModalOpen(true); }}>
                        <ArrowLeftRight size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* [Modals remain same style as before for brevity] */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="modal-content large">
              <div className="modal-header">
                <h3><Tag size={20} style={{ marginRight: '8px' }} /> Add Inventory Tag</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}><X /></button>
              </div>
              <div className="modal-body-scrollable">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Tag Number</label>
                    <input type="text" value={form.tag_no} onChange={(e) => setForm({...form, tag_no: e.target.value.toUpperCase()})} />
                  </div>
                  <div className="form-group">
                    <label>Initial Location (Branch)</label>
                    <select value={form.branch_id} onChange={(e) => setForm({...form, branch_id: e.target.value})}>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Product</label>
                  <select value={form.product_id} onChange={(e) => setForm({...form, product_id: e.target.value})}>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Gross Weight (g)</label>
                    <input type="number" value={form.gross_weight} onChange={(e) => setForm({...form, gross_weight: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Net Weight (g)</label>
                    <input type="number" value={form.net_weight} onChange={(e) => setForm({...form, net_weight: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Touch %</label>
                    <input type="number" value={form.touch} onChange={(e) => setForm({...form, touch: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddStock}>Add to Inventory</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="modal-overlay">
             <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="modal-content" style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                   <h3><ArrowLeftRight size={20} /> Enterprise Stock Transfer</h3>
                   <button className="close-btn" onClick={() => setIsTransferModalOpen(false)}><X /></button>
                </div>
                <div className="modal-body">
                   <p style={{ color: '#888', marginBottom: '1.5rem' }}>Moving Tag: <strong>{selectedTagForTransfer}</strong></p>
                   <div className="form-group">
                      <label>Select Target Showroom / Branch</label>
                      <select value={transferForm.to_branch_id} onChange={(e) => setTransferForm({ to_branch_id: e.target.value })}>
                         <option value="">Select Target...</option>
                         {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                   </div>
                </div>
                <div className="modal-actions" style={{ marginTop: '2rem' }}>
                   <button className="btn" onClick={() => setIsTransferModalOpen(false)}>Cancel</button>
                   <button className="btn btn-primary" onClick={handleTransfer}>Execute Transfer</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .modal-content.large { max-width: 700px; padding: 2.5rem; }
        .modal-body-scrollable { max-height: 50vh; overflow-y: auto; padding-right: 10px; margin-bottom: 2rem; }
        .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
        .status-pill.available { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .status-pill.sold { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .status-pill.in-transit { background: rgba(212, 175, 55, 0.1); color: #D4AF37; }
        .btn-icon.active { background: rgba(212, 175, 55, 0.1); }
      `}</style>
    </div>
  );
};

export default Inventory;
