import React, { useState, useEffect } from 'react';
import { AuditAPI } from '../api/api';
import { 
  ShieldCheck, 
  Search, 
  Clock, 
  User, 
  Database, 
  AlertTriangle, 
  ArrowRight,
  Eye,
  Filter,
  Trash2,
  RefreshCcw,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuditHub = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await AuditAPI.getLogs();
      setLogs(res.data);
    } catch (err) {
      console.error('Audit Load Failed', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => 
    l.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entity_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return '#22c55e';
      case 'UPDATE': return '#3b82f6';
      case 'DELETE': return '#ef4444';
      default: return '#888';
    }
  };

  const parseData = (data: string) => {
    try {
       return JSON.parse(data);
    } catch {
       return null;
    }
  };

  const renderDiff = (before: any, after: any) => {
    if (!before || !after) return <p>Incomplete forensic data.</p>;
    
    return (
      <div className="diff-container">
         {Object.keys(after).map(key => {
            const isChanged = JSON.stringify(before[key]) !== JSON.stringify(after[key]);
            if (!isChanged) return null;
            return (
               <div key={key} className="diff-item">
                  <span className="diff-key">{key}:</span>
                  <span className="diff-before">{JSON.stringify(before[key])}</span>
                  <ArrowRight size={14} />
                  <span className="diff-after">{JSON.stringify(after[key])}</span>
               </div>
            );
         })}
      </div>
    );
  };

  if (loading && logs.length === 0) return <div className="main-content">Initializing Forensic Engine...</div>;

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Enterprise Forensic Audit</h1>
          <p>Total accountability and integrity monitoring for Agni Jewellery.</p>
        </div>
        <div className="header-actions">
           <button className="btn" onClick={fetchLogs}><RefreshCcw size={18} /> Refresh Stream</button>
        </div>
      </header>

      <div className="audit-layout">
         <div className="audit-sidebar">
            <div className="search-wrap">
               <Search size={18} />
               <input 
                 type="text" 
                 placeholder="Search by User, Tag, or Bill..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
            
            <div className="activity-stream">
               {filteredLogs.map(log => (
                 <div 
                   key={log.id} 
                   className={`log-card ${selectedLog?.id === log.id ? 'active' : ''}`}
                   onClick={() => setSelectedLog(log)}
                 >
                    <div className="log-icon" style={{ borderColor: getActionColor(log.action_type) }}>
                       {log.action_type === 'DELETE' ? <Trash2 size={16} /> : <Fingerprint size={16} />}
                    </div>
                    <div className="log-info">
                       <div className="log-head">
                          <strong>{log.user_name}</strong>
                          <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                       </div>
                       <div className="log-action">
                          <span style={{ color: getActionColor(log.action_type) }}>{log.action_type}</span>
                          <span className="entity">{log.entity_type}: {log.entity_id}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="audit-main">
            <AnimatePresence mode="wait">
               {selectedLog ? (
                 <motion.div 
                   key={selectedLog.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="audit-detail"
                 >
                    <div className="detail-header">
                       <ShieldCheck size={28} color="#D4AF37" />
                       <div>
                          <h2>Case ID: {selectedLog.id}</h2>
                          <p>Forensic Investigation into {selectedLog.entity_type} {selectedLog.entity_id}</p>
                       </div>
                    </div>

                    <div className="forensic-meta">
                       <div className="meta-box">
                          <User size={16} />
                          <div>
                             <label>Authored By</label>
                             <span>{selectedLog.user_name} ({selectedLog.user_id})</span>
                          </div>
                       </div>
                       <div className="meta-box">
                          <Clock size={16} />
                          <div>
                             <label>Timestamp</label>
                             <span>{new Date(selectedLog.created_at).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>

                    <div className="forensic-payload">
                       <h3>Intelligence Snapshot</h3>
                       {selectedLog.action_type === 'UPDATE' ? (
                          renderDiff(parseData(selectedLog.before_data), parseData(selectedLog.after_data))
                       ) : (
                          <pre className="json-box">
                             {JSON.stringify(parseData(selectedLog.after_data || selectedLog.before_data), null, 2)}
                          </pre>
                       )}
                    </div>

                    {selectedLog.action_type === 'DELETE' && (
                       <div className="incident-alert">
                          <AlertTriangle size={20} />
                          <div>
                             <strong>Critical Deletion Detected</strong>
                             <p>This record has been removed from the active database. This log is the only remaining forensic proof.</p>
                          </div>
                       </div>
                    )}
                 </motion.div>
               ) : (
                 <div className="audit-placeholder">
                    <Database size={64} color="#111" />
                    <h2>Select an activity to begin forensic review</h2>
                    <p>Agni Jewellery maintains permanent records for all data mutations to ensure total fiscal integrity.</p>
                 </div>
               )}
            </AnimatePresence>
         </div>
      </div>

      <style>{`
        .audit-layout { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; margin-top: 1rem; h: calc(100vh - 200px); }
        .audit-sidebar { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; display: flex; flex-direction: column; overflow: hidden; }
        .search-wrap { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); }
        .search-wrap input { background: none; border: none; color: white; width: 100%; outline: none; }
        
        .activity-stream { flex: 1; overflow-y: auto; padding: 1rem; }
        .log-card { display: flex; gap: 1rem; padding: 1rem; border-radius: 16px; cursor: pointer; transition: 0.3s; margin-bottom: 0.5rem; border: 1px solid transparent; }
        .log-card:hover { background: rgba(255,255,255,0.02); }
        .log-card.active { background: rgba(212,175,55,0.05); border-color: rgba(212,175,55,0.2); }
        .log-icon { width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .log-info { flex: 1; min-width: 0; }
        .log-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .log-head strong { font-size: 0.9rem; color: white; }
        .log-head span { font-size: 0.7rem; color: #555; }
        .log-action { font-size: 0.75rem; font-weight: 800; display: flex; gap: 8px; }
        .log-action .entity { color: #888; font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .audit-main { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 3rem; overflow-y: auto; }
        .detail-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 3rem; }
        .detail-header h2 { font-size: 1.5rem; color: white; margin-bottom: 4px; }
        .detail-header p { color: #D4AF37; font-size: 0.85rem; font-weight: 700; }
        
        .forensic-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }
        .meta-box { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); display: flex; gap: 1rem; align-items: center; }
        .meta-box label { display: block; font-size: 0.65rem; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .meta-box span { font-weight: 700; color: #eee; font-size: 0.9rem; }

        .forensic-payload h3 { font-size: 1.1rem; color: #eee; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); pb: 0.5rem; }
        .json-box { background: #080808; padding: 1.5rem; border-radius: 16px; color: #22c55e; font-size: 0.8rem; line-height: 1.6; overflow-x: auto; }
        
        .diff-container { display: flex; flex-direction: column; gap: 0.75rem; }
        .diff-item { background: #080808; padding: 1rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; font-family: monospace; font-size: 0.8rem; }
        .diff-key { color: #888; width: 120px; flex-shrink: 0; }
        .diff-before { color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 2px 6px; border-radius: 4px; }
        .diff-after { color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 2px 6px; border-radius: 4px; }

        .incident-alert { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.2); display: flex; gap: 1rem; margin-top: 3rem; }
        .incident-alert strong { display: block; font-size: 1rem; margin-bottom: 4px; }
        .incident-alert p { font-size: 0.85rem; opacity: 0.8; }

        .audit-placeholder { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1.5rem; color: #444; }
        .audit-placeholder h2 { font-size: 1.5rem; }
        .audit-placeholder p { max-width: 400px; line-height: 1.6; }
      `}</style>
    </div>
  );
};

export default AuditHub;
