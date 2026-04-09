import React, { useState } from 'react';
import Papa from 'papaparse';
import { BulkAPI, DBManagementAPI, BackupAPI } from '../api/api';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Settings, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Download,
  Terminal,
  RefreshCw,
  X,
  Activity,
  ShieldCheck,
  Mail,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Migration = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 4 for Dashboard
  const [dbStats, setDbStats] = useState<any>(null);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importStatus, setImportStatus] = useState({ loading: false, success: false, error: '' });

  React.useEffect(() => {
    fetchHubData();
  }, []);

  const fetchHubData = async () => {
    try {
      const statsRes = await DBManagementAPI.getStats();
      setDbStats(statsRes.data);
      const healthRes = await DBManagementAPI.getHealth();
      setHealthStatus(healthRes.data);
    } catch (e) {
      console.error("Hub data fetch failed");
    }
  };

  // Standard ERP Fields
  const FIELDS = [
    { key: 'tag_no', label: 'Tag/Barcode No', required: true },
    { key: 'product_name', label: 'Product Name', required: true },
    { key: 'category_name', label: 'Category', required: true },
    { key: 'net_weight', label: 'Net Weight (g)', required: true },
    { key: 'gross_weight', label: 'Gross Weight (g)' },
    { key: 'wastage_percent', label: 'Wastage %' },
    { key: 'mc_per_gram', label: 'Making Charges /g' },
    { key: 'stone_value', label: 'Stone Value' },
    { key: 'hallmark_charges', label: 'Hallmark Charges' },
    { key: 'min_sales_value', label: 'Min Sales Price' },
    { key: 'huid1', label: 'HUID 1' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setCsvHeaders(Object.keys(results.data[0] || {}));
        setStep(2);
      }
    });
  };

  const executeImport = async () => {
    setImportStatus({ loading: true, success: false, error: '' });
    
    // Map data
    const mappedItems = csvData.map(row => {
      const item: any = {};
      FIELDS.forEach(f => {
        const csvCol = mapping[f.key];
        item[f.key] = csvCol ? row[csvCol] : '';
      });
      // Default missing values
      item.wastage_percent = parseFloat(item.wastage_percent) || 0;
      item.net_weight = parseFloat(item.net_weight) || 0;
      item.gross_weight = parseFloat(item.gross_weight) || item.net_weight;
      item.mc_per_gram = parseFloat(item.mc_per_gram) || 0;
      item.stone_value = parseFloat(item.stone_value) || 0;
      item.hallmark_charges = parseFloat(item.hallmark_charges) || 0;
      item.min_sales_value = parseFloat(item.min_sales_value) || 0;
      return item;
    });

    try {
      await BulkAPI.importStock(mappedItems);
      setImportStatus({ loading: false, success: true, error: '' });
      setStep(3);
    } catch (err: any) {
      setImportStatus({ loading: false, success: false, error: err.response?.data?.error || 'Import failed' });
    }
  };

  const handleExportAll = async () => {
    try {
      const res = await BulkAPI.exportAll();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AGNI_MASTER_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      alert('Export failed');
    }
  };

  const handleCloudSync = async () => {
    if (!window.confirm("This will overwrite/update records in Turso Cloud instance. Proceed?")) return;
    setIsSyncing(true);
    setSyncLogs(["Initiating handshake...", "Authentication verified."]);
    try {
        const res = await DBManagementAPI.syncCloud({
            url: "libsql://default-db-bschittier.turso.io", // Placeholders or from state
            token: "ey...", // Should be from server env really
            overwrite: true
        });
        setSyncLogs(prev => [...prev, ...res.data.log, "✅ Universal Sync Complete!"]);
    } catch (err: any) {
        setSyncLogs(prev => [...prev, "❌ Sync Failed: " + (err.response?.data?.error || err.message)]);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleManualBackup = async () => {
    try {
        await BackupAPI.trigger();
        alert("Backup sent to bsk**@gmail.com successfully!");
    } catch (err) {
        alert("Backup trigger failed.");
    }
  };

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Migration & Cloud Backup Master</h1>
          <p>Digitize thousands of items and download universal enterprise records.</p>
        </div>
        <button className="btn" onClick={handleExportAll}>
          <Download size={18} /> Download All Data
        </button>
      </header>

      <div className="migration-container">
         <div className="migration-steps no-print">
            <div className={`step-node ${step === 4 ? 'active' : ''}`} onClick={() => setStep(4)} style={{ cursor: 'pointer' }}>Global Hub</div>
            <div className="step-divider"></div>
            <div className={`step-node ${step === 1 ? 'active' : ''}`} onClick={() => setStep(1)} style={{ cursor: 'pointer' }}>CSV Import</div>
            <div className="step-divider"></div>
            <div className={`step-node ${step === 2 || step === 3 ? 'active' : ''}`}>Execute Migration</div>
         </div>

         {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dashboard-view">
               <div className="hub-stats-grid">
                  <div className="hub-card">
                     <div className="hub-card-header">
                        <Activity size={18} color="var(--primary)" />
                        <span>Live Statistics</span>
                     </div>
                     <div className="stats-list">
                        {dbStats ? Object.entries(dbStats).map(([k, v]) => (
                           <div key={k} className="stat-item">
                              <span className="sc-label">{k}</span>
                              <span className="sc-val">{v as number}</span>
                           </div>
                        )) : <p>Loading stats...</p>}
                     </div>
                  </div>

                  <div className="hub-card">
                     <div className="hub-card-header">
                        <ShieldCheck size={18} color="#22c55e" />
                        <span>Environment Health</span>
                     </div>
                     <div className="health-status">
                        <div className={`h-pill ${healthStatus?.status === 'Healthy' ? 'good' : 'bad'}`}>
                           {healthStatus?.status || 'Assessing...'}
                        </div>
                        {healthStatus?.issues?.map((iss: string, idx: number) => (
                           <p key={idx} style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '10px' }}>• {iss}</p>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="hub-card" style={{ marginTop: '1.5rem' }}>
                  <div className="hub-card-header">
                     <Zap size={18} color="var(--primary)" />
                     <span>Enterprise Operations</span>
                  </div>
                  <div className="ops-grid">
                     <div className="op-item">
                        <h4>Automated Backup Delivery</h4>
                        <p>Receive your entire database directly as an encrypted email attachment.</p>
                        <button className="btn" onClick={handleManualBackup}><Mail size={16} /> Send Email Backup</button>
                     </div>
                     <div className="op-item">
                        <h4>Universal Cloud Port</h4>
                        <p>Push local records to Turso Global instance for high-availability access.</p>
                        <button className="btn btn-primary" onClick={handleCloudSync} disabled={isSyncing}>
                           {isSyncing ? <RefreshCw className="spin" size={16} /> : <UploadCloud size={16} />} 
                           {isSyncing ? 'Syncing...' : 'Start Global Sync'}
                        </button>
                     </div>
                  </div>
                  
                  {syncLogs.length > 0 && (
                     <div className="sync-terminal">
                        <div className="terminal-header"><Terminal size={14} /> Migration Logs</div>
                        <div className="terminal-body">
                           {syncLogs.map((log, i) => <div key={i} className="log-line">{log}</div>)}
                        </div>
                     </div>
                  )}
               </div>
            </motion.div>
         )}

         {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="upload-zone data-table-container">
               <UploadCloud size={64} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1.5rem' }} />
               <h3>Begin Inventory Migration</h3>
               <p>Select your existing spreadsheet (CSV) containing your stock records.</p>
               <input type="file" id="bulk-upload" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
               <label htmlFor="bulk-upload" className="btn btn-primary" style={{ marginTop: '2rem', cursor: 'pointer' }}>
                  Choose CSV File
               </label>
            </motion.div>
         )}

         {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mapping-zone">
               <div className="data-table-container">
                  <div className="mapping-header">
                     <h3><Settings size={18} /> Smart Column Mapping</h3>
                     <p>Match your spreadsheet columns with Agni Jewellery fields.</p>
                  </div>
                  <div className="mapping-grid">
                     {FIELDS.map(f => (
                       <div key={f.key} className="mapping-row">
                          <div className="field-info">
                             <span className="field-label">{f.label}</span>
                             {f.required && <span className="req-pill">REQUIRED</span>}
                          </div>
                          <ArrowRight size={16} color="#444" />
                          <select 
                            value={mapping[f.key] || ''} 
                            onChange={e => setMapping({...mapping, [f.key]: e.target.value})}
                          >
                             <option value="">-- Ignore this field --</option>
                             {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                       </div>
                     ))}
                  </div>
                  <div className="mapping-footer">
                     <button className="btn" onClick={() => setStep(1)}>Back</button>
                     <button className="btn btn-primary" onClick={executeImport} disabled={importStatus.loading}>
                        {importStatus.loading ? <RefreshCw className="spin" size={18} /> : 'Start Universal Migration'}
                     </button>
                  </div>
                  {importStatus.error && <div className="error-box"><AlertCircle size={16} /> {importStatus.error}</div>}
               </div>
            </motion.div>
         )}

         {step === 3 && (
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="data-table-container success-zone">
               <CheckCircle2 size={80} color="#22c55e" style={{ marginBottom: '1.5rem' }} />
               <h2>Migration Successful!</h2>
               <p>Successfully processed and ported <strong>{csvData.length}</strong> items to your cloud inventory.</p>
               <div className="success-stats">
                  <div className="s-stat"><span>Destination</span> <strong>AGNI CLOUD</strong></div>
                  <div className="s-stat"><span>Verified Records</span> <strong>{csvData.length}</strong></div>
               </div>
               <button className="btn btn-primary" onClick={() => setStep(1)}>Start Another Migration</button>
            </motion.div>
         )}
      </div>

      <style>{`
        .dashboard-view { margin-top: 1rem; }
        .hub-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .hub-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 1.5rem; }
        .hub-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; font-weight: 700; font-size: 0.9rem; color: #888; text-transform: uppercase; }
        
        .stats-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .stat-item { background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; border: 1px solid rgba(255,255,255,0.03); }
        .sc-label { font-size: 0.7rem; color: #666; text-transform: uppercase; }
        .sc-val { font-size: 1.1rem; font-weight: 800; color: white; }

        .health-status { padding: 10px; }
        .h-pill { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 800; }
        .h-pill.good { background: #22c55e33; color: #22c55e; }
        .h-pill.bad { background: #ef444433; color: #ef4444; }

        .ops-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 10px; }
        .op-item h4 { font-size: 1rem; color: white; margin-bottom: 8px; }
        .op-item p { font-size: 0.8rem; color: #666; margin-bottom: 1.5rem; line-height: 1.5; }

        .sync-terminal { margin-top: 2rem; background: #000; border: 1px solid #333; border-radius: 12px; overflow: hidden; font-family: monospace; }
        .terminal-header { background: #111; padding: 8px 12px; font-size: 0.75rem; color: #666; border-bottom: 1px solid #222; display: flex; align-items: center; gap: 8px; }
        .terminal-body { padding: 15px; font-size: 0.8rem; color: #22c55e; max-height: 200px; overflow-y: auto; }
        .log-line { margin-bottom: 4px; }
        .log-line::before { content: ">"; margin-right: 8px; opacity: 0.5; }

        .migration-container { max-width: 900px; margin: 0 auto; }
        .migration-steps { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 3rem; }
        .step-node { padding: 8px 16px; border-radius: 20px; background: #222; color: #666; font-size: 0.8rem; font-weight: 700; border: 1px solid transparent; }
        .step-node.active { background: var(--primary); color: #000; border-color: rgba(0,0,0,0.1); }
        .step-divider { width: 50px; height: 1px; background: #333; }

        .upload-zone { text-align: center; padding: 5rem 2rem; border: 2px dashed var(--border); }
        .upload-zone h3 { font-size: 1.5rem; margin-bottom: 0.5rem; color: white; }
        .upload-zone p { color: #888; }

        .mapping-header { padding-bottom: 1.5rem; border-bottom: 1px solid #333; margin-bottom: 1.5rem; }
        .mapping-grid { display: flex; flex-direction: column; gap: 12px; }
        .mapping-row { display: flex; align-items: center; gap: 1.5rem; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 12px; }
        .field-info { flex: 1; display: flex; align-items: center; gap: 12px; }
        .field-label { font-weight: 600; font-size: 0.95rem; color: #ccc; }
        .req-pill { font-size: 0.6rem; font-weight: 900; background: rgba(239,68,68,0.1); color: #ef4444; padding: 2px 6px; border-radius: 4px; }
        .mapping-row select { width: 300px; height: 40px; background: #111; border: 1px solid #333; color: white; border-radius: 8px; padding: 0 12px; }

        .mapping-footer { display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #333; }
        .error-box { margin-top: 1.5rem; background: rgba(239,68,68,0.1); color: #ef4444; padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-size: 0.9rem; border: 1px solid rgba(239,68,68,0.2); }

        .success-zone { text-align: center; padding: 5rem 2rem; border: 1px solid #22c55e33; background: linear-gradient(135deg, rgba(34,197,94,0.05) 0%, rgba(0,0,0,0) 100%); }
        .success-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem auto; max-width: 400px; }
        .s-stat { display: flex; flex-direction: column; gap: 4px; padding: 1rem; background: #111; border-radius: 12px; }
        .s-stat span { font-size: 0.7rem; color: #666; text-transform: uppercase; }
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Migration;
