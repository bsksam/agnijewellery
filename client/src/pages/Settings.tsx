import React, { useState, useEffect } from 'react';
import { SettingsAPI, AuthAPI } from '../api/api';
import { Save, Store, MapPin, Phone, FileText, BadgeCheck, ShieldAlert, Key, Lock, CheckCircle } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    shop_name: '',
    shop_address: '',
    shop_phone: '',
    shop_gstin: '',
    upi_id: '',
    invoice_terms: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await SettingsAPI.get();
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await SettingsAPI.update(settings);
      alert('Settings updated successfully! Changes will reflect on new invoices.');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPwdMsg({ type: 'error', text: 'New passwords do not match' });
    }
    setPwdLoading(true);
    setPwdMsg({ type: '', text: '' });
    try {
      await AuthAPI.changePassword({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
      setPwdMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPwdMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update password' });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return <div className="main-content">Loading configuration...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Store Configuration</h1>
          <p>Personalize your shop identity and invoice headers.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={20} />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </header>

      <div className="settings-grid">
        <div className="settings-main">
          <div className="data-table-container" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Store size={20} color="var(--primary)" /> Business Identity
            </h3>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Legal Business Name</label>
                <input 
                  type="text" value={settings.shop_name}
                  onChange={e => setSettings({...settings, shop_name: e.target.value})}
                  placeholder="e.g. AGNI JEWELLERY"
                />
              </div>

              <div className="form-group">
                <label>Business Address (Printed on Invoice)</label>
                <textarea 
                  rows={3} 
                  value={settings.shop_address}
                  onChange={e => setSettings({...settings, shop_address: e.target.value})}
                  style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.75rem', color: 'white', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input 
                    type="text" value={settings.shop_phone}
                    onChange={e => setSettings({...settings, shop_phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>GSTIN / Tax ID</label>
                  <input 
                    type="text" value={settings.shop_gstin}
                    onChange={e => setSettings({...settings, shop_gstin: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>UPI ID (for Dynamic QR Payments)</label>
                <input 
                  type="text" value={settings.upi_id}
                  onChange={e => setSettings({...settings, upi_id: e.target.value})}
                  placeholder="e.g. shopname@bank"
                />
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.4rem' }}>If left blank, QR codes will not appear on invoices.</p>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Invoice Terms & Conditions</label>
                <textarea 
                  rows={4} 
                  value={settings.invoice_terms}
                  onChange={e => setSettings({...settings, invoice_terms: e.target.value})}
                  style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.75rem', color: 'white', fontFamily: 'inherit' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>Use numbers (1., 2.) to separate terms.</p>
              </div>
            </form>
          </div>
        </div>

        <div className="settings-sidebar">
           <div className="data-table-container" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}><BadgeCheck size={18} style={{ marginRight: 8 }} /> Print Configuration</h3>
              <div className="config-item">
                 <span>Print Layout</span>
                 <select disabled style={{ background: '#111', border: '1px solid #333', color: '#555', padding: '4px', borderRadius: '4px' }}>
                    <option>Standard A4/A5</option>
                 </select>
              </div>
              <div className="config-item">
                 <span>Automatic Print</span>
                 <input type="checkbox" defaultChecked />
              </div>
              <div className="config-item">
                 <span>Show Barcodes</span>
                 <input type="checkbox" defaultChecked />
              </div>
            </div>

            <div className="data-table-container" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={18} /> User Security</h3>
              <form onSubmit={handleChangePassword}>
                 <div className="form-group">
                    <input 
                      type="password" placeholder="Current Password" 
                      value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})}
                      style={{ fontSize: '0.8rem', padding: '10px', width: '100%', background: '#000', border: '1px solid #222', borderRadius: '8px', color: 'white' }}
                    />
                 </div>
                 <div className="form-group" style={{ marginTop: '0.8rem' }}>
                    <input 
                      type="password" placeholder="New Password" 
                      value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                      style={{ fontSize: '0.8rem', padding: '10px', width: '100%', background: '#000', border: '1px solid #222', borderRadius: '8px', color: 'white' }}
                    />
                 </div>
                 <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <input 
                      type="password" placeholder="Confirm New Password" 
                      value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                      style={{ fontSize: '0.8rem', padding: '10px', width: '100%', background: '#000', border: '1px solid #222', borderRadius: '8px', color: 'white' }}
                    />
                 </div>
                 {pwdMsg.text && <div style={{ fontSize: '0.7rem', color: pwdMsg.type === 'success' ? '#22c55e' : '#ef4444', marginTop: '0.5rem', fontWeight: 600 }}>{pwdMsg.text}</div>}
                 <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem', padding: '10px' }} disabled={pwdLoading}>
                    <Key size={14} /> {pwdLoading ? 'Updating...' : 'Update Password'}
                 </button>
              </form>
            </div>

            <div className="data-table-container" style={{ padding: '1.5rem', marginTop: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: '#ef4444' }}><ShieldAlert size={18} style={{ marginRight: 8 }} /> Dangerous Zone</h3>
              <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>Deleting inventory data is permanent.</p>
              <button disabled className="btn" style={{ borderColor: '#ef4444', color: '#ef4444', width: '100%', fontSize: '0.8rem' }}>Reset Live Database</button>
           </div>
        </div>
      </div>

      <style>{`
        .settings-grid { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; }
        .config-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem; }
      `}</style>
    </div>
  );
};

export default Settings;
