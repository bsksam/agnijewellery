import React, { useState, useEffect } from 'react';
import { BillingAPI } from '../api/api';
import { Search, FileText, Printer, Trash2, Calendar, User, Eye, X, Award } from 'lucide-react';
import PrintInvoice from '../components/PrintInvoice';
import CertificateTemplate from '../components/CertificateTemplate';
import { motion, AnimatePresence } from 'framer-motion';

const SalesHistory = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  
  const [certItem, setCertItem] = useState<any>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await BillingAPI.getAllSales();
      setSales(res.data);
    } catch (err) {
      console.error('Failed to fetch sales history', err);
    }
  };

  const handleViewById = async (bill_no: string) => {
    try {
      const res = await BillingAPI.getSale(bill_no);
      setSelectedSale(res.data);
      setIsPrintModalOpen(true);
    } catch (err) {
      alert('Failed to load invoice details');
    }
  };

  const openCertifyModal = async (bill_no: string) => {
    try {
        const res = await BillingAPI.getSale(bill_no);
        setSelectedSale(res.data);
        setIsCertModalOpen(true);
    } catch (err) {
        alert('Failed to load items for certification');
    }
  };

  const filteredSales = sales.filter(s => 
    s.bill_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.customer_name && s.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.customer_mobile && s.customer_mobile.includes(searchTerm))
  );

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Sales History & Guarantee Hub</h1>
          <p>Manage past invoices and generate jewelry certificates of authenticity.</p>
        </div>
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search Bill No, Name, or Mobile..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="data-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Bill No</th>
              <th>Customer</th>
              <th>Amount (₹)</th>
              <th>Mode</th>
              <th>Certification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale.bill_no}>
                <td>{new Date(sale.bill_date).toLocaleDateString()}</td>
                <td style={{ fontWeight: 600 }}>{sale.bill_no}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{sale.customer_name || 'Cash Customer'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>{sale.customer_mobile || '-'}</div>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{Math.round(sale.net_amount).toLocaleString()}</td>
                <td><span className="mode-badge">{sale.payment_mode}</span></td>
                <td>
                   <button className="btn btn-sm" style={{ gap: '6px', fontSize: '0.7rem' }} onClick={() => openCertifyModal(sale.bill_no)}>
                      <Award size={14} color="#D4AF37" /> Generate Certificate
                   </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-icon" title="View & Print" onClick={() => handleViewById(sale.bill_no)}>
                      <Printer size={16} />
                    </button>
                    <button className="btn-icon" title="Details" onClick={() => handleViewById(sale.bill_no)}>
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isPrintModalOpen && selectedSale && (
          <div className="modal-overlay">
            <div className="modal-content print-modal">
              <div className="modal-header no-print">
                <h3>Invoice Preview</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={() => window.print()}>
                        <Printer size={18} /> Print Invoice
                    </button>
                    <button className="close-btn" onClick={() => setIsPrintModalOpen(false)}><X /></button>
                </div>
              </div>
              <div className="modal-body">
                <PrintInvoice sale={selectedSale} />
              </div>
            </div>
          </div>
        )}

        {/* Certification Modal */}
        {isCertModalOpen && selectedSale && (
          <div className="modal-overlay">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
                <div className="modal-header no-print">
                   <h3>Branded Certification Hub</h3>
                   <button className="close-btn" onClick={() => { setIsCertModalOpen(false); setCertItem(null); }}><X /></button>
                </div>
                
                {!certItem ? (
                  <div className="modal-body">
                     <p style={{ color: '#888', marginBottom: '1.5rem' }}>Select an item from <strong>{selectedSale.bill_no}</strong> to certify:</p>
                     <div className="cert-selection-grid">
                        {selectedSale.items.map((item: any) => (
                          <div key={item.tag_no} className="cert-item-card" onClick={() => setCertItem(item)}>
                             <Award size={24} color="#D4AF37" />
                             <div className="cert-item-info">
                                <strong>{item.product_name}</strong>
                                <span>Tag: {item.tag_no} | {item.weight}g</span>
                             </div>
                             <ArrowRight size={18} color="#444" />
                          </div>
                        ))}
                     </div>
                  </div>
                ) : (
                  <div className="modal-body">
                     <div className="cert-preview-actions no-print">
                        <button className="btn" onClick={() => setCertItem(null)}>Back to Selection</button>
                        <button className="btn btn-primary" onClick={() => window.print()}>Print Certificate</button>
                     </div>
                     <div className="cert-print-area">
                        <CertificateTemplate item={{...certItem, net_weight: certItem.stock_net_weight || certItem.weight}} billNo={selectedSale.bill_no} />
                     </div>
                  </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .mode-badge { background: rgba(212, 175, 55, 0.1); color: var(--primary); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
        .print-modal { max-width: 900px; width: 95%; max-height: 90vh; overflow-y: auto; background: white !important; color: black !important; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        
        .cert-selection-grid { display: flex; flex-direction: column; gap: 12px; }
        .cert-item-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; background: rgba(255,255,255,0.03); border-radius: 12px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
        .cert-item-card:hover { border-color: #D4AF37; background: rgba(212, 175, 55, 0.05); }
        .cert-item-info { flex: 1; display: flex; flex-direction: column; }
        .cert-item-info strong { color: white; }
        .cert-item-info span { font-size: 0.8rem; color: #888; margin-top: 4px; }
        
        .cert-preview-actions { display: flex; justify-content: space-between; margin-bottom: 2rem; }
        .cert-print-area { display: flex; justify-content: center; background: #eee; padding: 2rem; border-radius: 12px; overflow: hidden; }

        @media print {
            .modal-overlay { background: white !important; position: static; }
            .modal-content { display: block; width: 100%; max-width: none; background: white !important; color: black !important; position: static; box-shadow: none; padding: 0; }
            .cert-print-area { padding: 0; background: none; }
        }
      `}</style>
    </div>
  );
};

const ArrowRight = ({ size, color }: { size: number, color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);

export default SalesHistory;
