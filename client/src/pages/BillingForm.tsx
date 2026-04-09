import React, { useState, useEffect, useRef } from 'react';
import { RatesAPI, StockAPI, BillingAPI, SchemeAPI, BuybackAPI } from '../api/api';
import { ShoppingCart, Search, Plus, Trash2, Save, User, Phone, FileText, Calculator, AlertTriangle, ShieldCheck, Printer, X, Repeat, PiggyBank, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PrintInvoice from '../components/PrintInvoice';

const BillingForm = () => {
  const [customer, setCustomer] = useState({ name: '', mobile: '' });
  const [items, setItems] = useState<any[]>([]);
  const [exchangeItems, setExchangeItems] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [latestRates, setLatestRates] = useState<any[]>([]);
  const [invoiceSummary, setInvoiceSummary] = useState({
    gross: 0,
    tax: 0,
    discount: 0,
    exchange: 0,
    net: 0
  });
  
  const [schemeCredits, setSchemeCredits] = useState<any[]>([]);
  const [selectedSchemeCredit, setSelectedSchemeCredit] = useState(0);
  const [exchangeVoucherId, setExchangeVoucherId] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [staffList, setStaffList] = useState<string[]>(['Admin', 'Staff 1', 'Staff 2', 'Staff 3']);
  const [selectedStaff, setSelectedStaff] = useState('Admin');
  const [isTurbo, setIsTurbo] = useState(true);
  const [printFormat, setPrintFormat] = useState<'A4' | 'A5'>('A4');

  const [savedBill, setSavedBill] = useState<any>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initial focus for scanner
    if (tagInputRef.current) tagInputRef.current.focus();
  }, []);

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (customer.mobile.length >= 10) {
        checkSavingsSchemes();
    }
  }, [customer.mobile]);

  useEffect(() => {
    calculateGrandTotals();
  }, [items, exchangeItems, invoiceSummary.discount, selectedSchemeCredit]);

  const fetchRates = async () => {
    try {
      const res = await RatesAPI.getLatestRates();
      setLatestRates(res.data);
    } catch (err) {
      console.error('Failed to fetch rates', err);
    }
  };

  const checkSavingsSchemes = async () => {
    try {
        const res = await SchemeAPI.getActive(customer.mobile);
        setSchemeCredits(res.data);
    } catch (e) {
        console.error('Scheme check failed', e);
    }
  };

  const calculateGrandTotals = () => {
    const gross = items.reduce((sum: number, item: any) => sum + item.total_amount, 0);
    const tax = gross * 0.03; // 3% GST
    const subtotal = gross + tax - invoiceSummary.discount;
    
    const totalExchange = (exchangeItems.reduce((sum: number, item: any) => {
        const val = (parseFloat(item.weight) || 0) * (parseFloat(item.touch) / 100) * (parseFloat(item.rate) || 0);
        return sum + val;
    }, 0)) + (appliedVoucher ? appliedVoucher.total_value : 0);

    const net = subtotal - totalExchange - selectedSchemeCredit;
    setInvoiceSummary((prev: any) => ({ ...prev, gross, tax, exchange: totalExchange, net }));
  };

  const verifyVoucher = async () => {
    if (!exchangeVoucherId) return;
    try {
        const res = await BuybackAPI.getActiveVouchers();
        const voucher = res.data.find((v: any) => v.id === exchangeVoucherId);
        if (voucher) {
            setAppliedVoucher(voucher);
            alert(`Voucher Applied: ₹${voucher.total_value}`);
        } else {
            alert('Invalid or already used voucher ID');
        }
    } catch (e) {
        alert('Error verifying voucher');
    }
  };

  const handleTagLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput) return;

    try {
      const res = await StockAPI.getTag(tagInput.toUpperCase());
      const tag = res.data;

      if (items.find((i: any) => i.tag_no === tag.tag_no)) {
        return alert('Tag already added to invoice');
      }

      const rateObj = latestRates.find((r: any) => r.metal === tag.category_name);
      const currentRate = rateObj ? rateObj.selling_rate : 0;

      const newItem = {
        tag_no: tag.tag_no,
        product_id: tag.product_id,
        product_name: tag.product_name,
        category_name: tag.category_name,
        weight: tag.net_weight,
        rate: currentRate,
        wastage: tag.wastage_percent,
        mc: tag.mc_per_gram,
        stone_value: tag.stone_value,
        hallmark_charges: tag.hallmark_charges || 0,
        min_sales_value: tag.min_sales_value || 0,
        huid1: tag.huid1,
        huid2: tag.huid2,
        total_amount: 0
      };

      newItem.total_amount = calculateItemTotal(newItem);
      setItems([...items, newItem]);
      setTagInput('');
      if (tagInputRef.current) tagInputRef.current.focus();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Tag lookup failed');
    }
  };

  const calculateItemTotal = (item: any) => {
    const wastageWt = (parseFloat(item.weight) * parseFloat(item.wastage)) / 100;
    const metalValue = (parseFloat(item.weight) + wastageWt) * parseFloat(item.rate);
    const makingCharges = parseFloat(item.mc) * parseFloat(item.weight);
    return metalValue + makingCharges + parseFloat(item.stone_value) + parseFloat(item.hallmark_charges);
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index], [field]: value };
    item.total_amount = calculateItemTotal(item);
    updatedItems[index] = item;
    setItems(updatedItems);
  };

  const addExchangeRow = () => {
    const defaultRate = latestRates.find((r: any) => r.metal === 'GOLD')?.selling_rate || 0;
    setExchangeItems([...exchangeItems, { description: '', weight: '', touch: '100', rate: defaultRate }]);
  };

  const updateExchangeItem = (index: number, field: string, value: any) => {
    const updated = [...exchangeItems];
    updated[index] = { ...updated[index], [field]: value };
    setExchangeItems(updated);
  };

  const handleSaveInvoice = async () => {
    if (items.length === 0) return alert('No items added');
    
    const lowValueItems = items.filter((i: any) => i.total_amount < i.min_sales_value);
    if (lowValueItems.length > 0) {
      const tags = lowValueItems.map((i: any) => i.tag_no).join(', ');
      return alert(`Error: The following tags are below the Minimum Sales Value: ${tags}. Please adjust the rate or wastage.`);
    }

    try {
      const saleData = {
        customer_name: customer.name,
        customer_mobile: customer.mobile,
        items,
        gross_amount: invoiceSummary.gross,
        tax_amount: invoiceSummary.tax,
        discount_amount: invoiceSummary.discount,
        exchange_amount: invoiceSummary.exchange,
        exchange_details: JSON.stringify(exchangeItems),
        net_amount: invoiceSummary.net,
        payment_mode: 'CASH',
        staff_name: selectedStaff,
        remarks: '',
        exchange_voucher_id: appliedVoucher?.id || null
      };

      const res = await BillingAPI.createSale(saleData);

      if (appliedVoucher) {
        await BuybackAPI.useVoucher(appliedVoucher.id);
      }
      
      // Load the full bill for printing
      const fullBillRes = await BillingAPI.getSale(res.data.bill_no);
      setSavedBill(fullBillRes.data);
      setShowPrintPreview(true);
      
      // Reset form
      setItems([]);
      setExchangeItems([]);
      setCustomer({ name: '', mobile: '' });
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save invoice');
    }
  };

  return (
    <div className="main-content">
      <header className="header" style={{ marginBottom: '1.5rem' }}>
        <div className="welcome-msg">
          <h1>Modern Billing Invoice</h1>
          <p>Automated wastage, MC, and Minimum Sale Price protection.</p>
        </div>
        <div className="rate-ticker no-print">
          <div 
            className={`turbo-btn ${isTurbo ? 'active' : ''}`}
            onClick={() => setIsTurbo(!isTurbo)}
            title="Turbo Mode: Press Enter on Tag to Add instantly."
          >
             <Sparkles size={14} /> Turbo Mode: {isTurbo ? 'ON' : 'OFF'}
          </div>
          {latestRates.map((r: any) => (
            <span key={r.id} className="rate-item">
              {r.metal}: <strong>₹{r.selling_rate}</strong>
            </span>
          ))}
        </div>
      </header>

      <div className="billing-grid">
        <div className="billing-main">
          {/* Customer Info */}
          <div className="data-table-container no-print" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label><User size={14} style={{ marginRight: 6 }} /> Customer Name</label>
                <input 
                  type="text" 
                  value={customer.name} 
                  onChange={e => setCustomer({...customer, name: e.target.value})}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label><Phone size={14} style={{ marginRight: 6 }} /> Mobile Number</label>
                <input 
                  type="text" 
                  value={customer.mobile} 
                  onChange={e => setCustomer({...customer, mobile: e.target.value})}
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>

          {/* Salesperson Selection */}
          <div className="data-table-container no-print" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
             <div className="form-group" style={{ margin: 0 }}>
                <label><Users size={14} style={{ marginRight: 6 }} /> Salesperson / Served By</label>
                <select 
                    value={selectedStaff} 
                    onChange={e => setSelectedStaff(e.target.value)}
                    style={{ 
                        width: '100%', height: '45px', borderRadius: '12px', 
                        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', 
                        color: 'white', padding: '0 15px', fontSize: '1rem', fontWeight: 600
                    }}
                >
                   {staffList.map((s: any) => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
          </div>

          {/* Tag Lookup */}
          <div className="data-table-container no-print" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <form onSubmit={handleTagLookup} className="tag-lookup">
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input 
                  type="text" 
                  ref={tagInputRef}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && isTurbo) {
                       handleTagLookup(e);
                    }
                  }}
                  placeholder={isTurbo ? "Scan Tag & Press Enter..." : "Scan Tag (e.g. AG-1001)"} 
                  style={{ width: '100%', paddingLeft: '2.5rem', borderColor: isTurbo ? 'var(--primary)' : 'var(--border)' }}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Tag
              </button>
            </form>
          </div>

          {/* Items Table */}
          <div className="data-table-container scrollable-x" style={{ marginBottom: '1.5rem' }}>
            <table className="custom-table billing-table">
              <thead>
                <tr>
                  <th>Product / HUID</th>
                  <th>Weight (g)</th>
                  <th>Rate (₹)</th>
                  <th>Wastage %</th>
                  <th>MC / g (₹)</th>
                  <th>Other / HM (₹)</th>
                  <th>Total (₹)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                      <ShoppingCart size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                      <p>Scan a tag to begin billing.</p>
                    </td>
                  </tr>
                ) : items.map((item: any, idx: number) => (
                  <tr key={idx} className={item.total_amount < item.min_sales_value ? 'row-warning' : ''}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{item.product_name}</div>
                      <div className="tag-subtext">{item.tag_no} | <ShieldCheck size={10} /> {item.huid1 || 'No HUID'}</div>
                    </td>
                    <td>
                      <input 
                        type="number" value={item.weight} 
                        onChange={e => handleUpdateItem(idx, 'weight', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" value={item.rate} 
                        onChange={e => handleUpdateItem(idx, 'rate', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" value={item.wastage} 
                        onChange={e => handleUpdateItem(idx, 'wastage', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" value={item.mc} 
                        onChange={e => handleUpdateItem(idx, 'mc', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>HM: ₹{item.hallmark_charges}</div>
                      <div style={{ fontSize: '0.8rem' }}>St: ₹{item.stone_value}</div>
                    </td>
                    <td>
                      <div className="item-total">₹{Math.round(item.total_amount).toLocaleString()}</div>
                      {item.total_amount < item.min_sales_value && (
                        <div className="min-val-alert">
                          <AlertTriangle size={10} /> Min: ₹{Math.round(item.min_sales_value).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => setItems(items.filter((_: any, i: number) => i !== idx))}>
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Exchange Table */}
          <div className="data-table-container">
             <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Repeat size={18} color="var(--primary)" /> Old Gold Exchange
                </h3>
                <button className="btn btn-icon" onClick={addExchangeRow} style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary)', padding: '4px 12px', fontSize: '0.8rem' }}>
                    <Plus size={14} /> Add Swap Item
                </button>
             </div>
             <table className="custom-table billing-table">
                <thead>
                    <tr>
                        <th>Old Item Description</th>
                        <th>Weight (g)</th>
                        <th>Touch %</th>
                        <th>Rate (₹)</th>
                        <th>Value (₹)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {exchangeItems.map((item: any, idx: number) => (
                        <tr key={idx}>
                            <td>
                                <input 
                                    type="text" value={item.description} 
                                    onChange={e => updateExchangeItem(idx, 'description', e.target.value)}
                                    className="table-input" style={{ width: '100%' }}
                                    placeholder="e.g. Old Ring"
                                />
                            </td>
                            <td>
                                <input 
                                    type="number" value={item.weight} 
                                    onChange={e => updateExchangeItem(idx, 'weight', e.target.value)}
                                    className="table-input"
                                />
                            </td>
                            <td>
                                <input 
                                    type="number" value={item.touch} 
                                    onChange={e => updateExchangeItem(idx, 'touch', e.target.value)}
                                    className="table-input"
                                />
                            </td>
                            <td>
                                <input 
                                    type="number" value={item.rate} 
                                    onChange={e => updateExchangeItem(idx, 'rate', e.target.value)}
                                    className="table-input"
                                />
                            </td>
                            <td>
                                <div className="item-total">
                                    ₹{Math.round((parseFloat(item.weight) || 0) * (parseFloat(item.touch) / 100) * (parseFloat(item.rate) || 0)).toLocaleString()}
                                </div>
                            </td>
                            <td>
                                <button className="btn-icon" onClick={() => setExchangeItems(exchangeItems.filter((_: any, i: number) => i !== idx))}>
                                    <Trash2 size={16} color="#EF4444" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {exchangeItems.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#444', fontSize: '0.85rem' }}>No exchange items added.</td>
                        </tr>
                    )}
                </tbody>
             </table>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="billing-summary">
          <div className="data-table-container summary-card">
            <h3><Calculator size={18} style={{ marginRight: 8 }} /> Bill Summary</h3>
            <div className="summary-list">
              <div className="summary-row">
                <span>Items Total</span>
                <span>₹{Math.round(invoiceSummary.gross).toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>GST (3%)</span>
                <span>₹{Math.round(invoiceSummary.tax).toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Discount</span>
                <input 
                  type="number" value={invoiceSummary.discount}
                  onChange={e => setInvoiceSummary({...invoiceSummary, discount: parseFloat(e.target.value) || 0})}
                  className="inline-input"
                />
              </div>
              <div className="summary-row" style={{ color: '#ef4444', fontWeight: 600 }}>
                <span>Old Gold SWAP (-)</span>
                <span>₹{Math.round(invoiceSummary.exchange).toLocaleString()}</span>
              </div>

              {/* Buyback Voucher Lookup */}
              <div className="voucher-lookup-box no-print">
                 <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 800, textTransform: 'uppercase' }}>Old Gold Voucher Credit</label>
                 <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                    <input 
                      type="text" 
                      placeholder="BB-2026..." 
                      value={exchangeVoucherId}
                      onChange={e => setExchangeVoucherId(e.target.value)}
                      style={{ background: '#000', border: '1px solid #333', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '0.8rem', flex: 1 }}
                    />
                    <button 
                      className="btn" 
                      onClick={verifyVoucher}
                      style={{ padding: '6px 12px', background: 'rgba(212,175,55,0.1)', color: 'var(--primary)', border: '1px solid rgba(212,175,55,0.2)' }}
                    >
                      <Repeat size={14} /> Apply
                    </button>
                 </div>
                 {appliedVoucher && (
                    <div style={{ marginTop: '5px', fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>
                       ✓ Applied: ₹{appliedVoucher.total_value.toLocaleString()}
                    </div>
                 )}
              </div>
              
              {schemeCredits.length > 0 && (
                <div className="scheme-redemption-box no-print">
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><PiggyBank size={14} /> Available Savings Schemes</p>
                    {schemeCredits.map((sc: any) => (
                        <div key={sc.id} className={`scheme-credit-option ${selectedSchemeCredit === (sc.total_saved + (sc.installments_paid >= 11 ? sc.bonus_amount : 0)) ? 'active' : ''}`} onClick={() => setSelectedSchemeCredit(selectedSchemeCredit === (sc.total_saved + (sc.installments_paid >= 11 ? sc.bonus_amount : 0)) ? 0 : (sc.total_saved + (sc.installments_paid >= 11 ? sc.bonus_amount : 0)))}>
                            <div className="sc-name" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{sc.scheme_name}</div>
                            <div className="sc-val" style={{ fontSize: '0.75rem', color: '#888' }}>Credit: ₹{(sc.total_saved + (sc.installments_paid >= 11 ? sc.bonus_amount : 0)).toLocaleString()}</div>
                        </div>
                    ))}
                </div>
              )}

              <div className="summary-divider"></div>
              <div className="summary-row grand-total">
                <span>Payable Amount</span>
                <span style={{ color: 'var(--primary)' }}>₹{Math.round(invoiceSummary.net).toLocaleString()}</span>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', height: 'auto', fontSize: '1.1rem' }}
                onClick={handleSaveInvoice}
              >
                <Save size={20} /> Save & Generate Bill
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPrintPreview && savedBill && (
          <div className="modal-overlay">
            <div className="modal-content print-modal">
              <div className="modal-header no-print">
                <h3>Invoice Generated Successfully!</h3>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#000', padding: '4px', borderRadius: '10px' }}>
                    <button 
                      className={`btn ${printFormat === 'A4' ? 'btn-primary' : ''}`} 
                      style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                      onClick={() => setPrintFormat('A4')}
                    >A4 Format</button>
                    <button 
                      className={`btn ${printFormat === 'A5' ? 'btn-primary' : ''}`} 
                      style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                      onClick={() => setPrintFormat('A5')}
                    >A5 Format</button>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={() => window.print()}>
                        <Printer size={18} /> Print Now
                    </button>
                    <button className="close-btn" onClick={() => { setShowPrintPreview(false); setSavedBill(null); }}><X /></button>
                </div>
              </div>
              <div className="modal-body">
                <PrintInvoice sale={savedBill} paperFormat={printFormat} />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .billing-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; }
        .tag-lookup { display: flex; gap: 1rem; }
        .tag-subtext { font-size: 0.7rem; color: #888; display: flex; align-items: center; gap: 4px; }
        .table-input {
          background: rgba(255,255,255,0.05); border: 1px solid #333; color: white; width: 80px;
          padding: 6px; border-radius: 8px; font-family: inherit; font-size: 0.85rem;
        }
        .item-total { font-weight: 800; color: white; font-size: 1rem; }
        .row-warning { background: rgba(239, 68, 68, 0.05); }
        .min-val-alert { color: #ef4444; font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
        .rate-ticker { display: flex; gap: 1rem; }
        .rate-item { background: var(--bg-card); padding: 0.5rem 1rem; border-radius: 12px; border: 1px solid var(--border); font-size: 0.8rem; }
        .rate-item strong { color: var(--primary); margin-left: 4px; }
        .summary-card h3 { margin-bottom: 1.5rem; display: flex; align-items: center; border-bottom: 1px solid #333; padding-bottom: 1rem; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 1.25rem; color: var(--text-secondary); font-size: 1rem; }
        .scheme-redemption-box { background: rgba(255,255,255,0.03); border: 1px solid var(--border); padding: 1rem; border-radius: 12px; margin-bottom: 1.25rem; }
        .scheme-credit-option { background: var(--bg-dark); border: 1px solid var(--border); padding: 10px; border-radius: 8px; cursor: pointer; transition: 0.3s; margin-bottom: 8px; }
        .scheme-credit-option:hover { border-color: var(--primary); }
        .scheme-credit-option.active { border-color: var(--primary); background: rgba(212,175,55,0.1); }
        .grand-total { font-size: 1.5rem; font-weight: 800; margin-top: 1.5rem; border-top: 1px solid #333; padding-top: 1.5rem; }
        .inline-input { background: none; border: none; border-bottom: 1px dashed #666; color: white; width: 80px; text-align: right; font-size: 1rem; }
        .scrollable-x { overflow-x: auto; }
        
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8); z-index: 2000;
          display: flex; align-items: center; justify-content: center;
        }
        .print-modal {
          max-width: 900px;
          width: 95%;
          max-height: 90vh;
          overflow-y: auto;
          background: white !important;
          color: black !important;
          padding: 2rem;
          border-radius: 16px;
        }
        @media print {
            .modal-overlay { background: white !important; position: static; }
            .print-modal { width: 100%; max-width: none; border: none; box-shadow: none; position: static; overflow: visible; padding: 0; }
            .no-print { display: none !important; }
        }

        .turbo-btn { 
          display: flex; align-items: center; gap: 8px; 
          background: rgba(255,255,255,0.03); border: 1px solid var(--border); 
          padding: 0.5rem 1rem; border-radius: 12px; font-size: 0.8rem; font-weight: 800;
          cursor: pointer; transition: 0.3s; color: #666;
        }
        .turbo-btn.active { background: rgba(212,175,55,0.1); border-color: var(--primary); color: var(--primary); box-shadow: 0 0 15px rgba(212,175,55,0.2); }
      `}</style>
    </div>
  );
};

export default BillingForm;
