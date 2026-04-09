import React, { useState, useEffect } from 'react';
import { BackupAPI } from '../api/api';
import { 
  ShieldCheck, 
  Mail, 
  Download, 
  CloudRain, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw,
  Database,
  Lock,
  Archive,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

const BackupCenter = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await BackupAPI.getStatus();
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to load backup status');
    }
  };

  const handleTrigger = async () => {
    try {
      setLoading(true);
      setSuccessMsg('');
      setErrorMsg('');
      const res = await BackupAPI.trigger();
      setSuccessMsg('Master Backup delivered to bsksam@gmail.com');
      fetchStatus();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Backup failed. Ensure SMTP App Password is configured in Server env.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Enterprise Fortress — Disaster Recovery</h1>
          <p>Complete data residency and automated cloud-to-owner backups for Agni Jewellery.</p>
        </div>
      </header>

      <div className="fortress-grid">
         <motion.div 
           initial={{ opacity: 0, y: 20 }} 
           animate={{ opacity: 1, y: 0 }} 
           className="fortress-card master-control"
         >
            <div className="card-icon"><ShieldCheck size={32} color="#D4AF37" /></div>
            <h2>Total Data Ownership</h2>
            <p>Your entire showroom history is mirrored to your private inbox. You are never dependent on cloud alone.</p>
            
            <div className="status-badges">
               <div className="badge success"><CheckCircle2 size={14} /> BSKSAM@GMAIL.COM Verified</div>
               <div className="badge pulse"><RefreshCcw size={14} className="animate-spin" /> Auto-Sync Active</div>
            </div>

            <div className="action-zone">
               <button 
                 className={`btn btn-primary large-action ${loading ? 'loading' : ''}`}
                 onClick={handleTrigger}
                 disabled={loading}
               >
                  {loading ? 'Securing Data...' : <><Mail size={20} /> Trigger Instant Cloud-to-Email Backup</>}
               </button>
               {successMsg && <div className="success-banner"><CheckCircle2 size={20} /> {successMsg}</div>}
               {errorMsg && <div className="error-banner"><AlertCircle size={20} /> {errorMsg}</div>}
            </div>
         </motion.div>

         <div className="fortress-info-stack">
            <div className="fortress-card mini">
               <div className="mini-head">
                  <Database size={20} color="#3b82f6" />
                  <h3>Cloud Residency</h3>
               </div>
               <div className="mini-stat">Turso (High-Availability)</div>
               <p className="mini-desc">Live primary storage with 99.99% uptime globally.</p>
            </div>

            <div className="fortress-card mini">
               <div className="mini-head">
                  <Archive size={20} color="#22c55e" />
                  <h3>Ownership Backup</h3>
               </div>
               <div className="mini-stat">Daily Email Delivery</div>
               <p className="mini-desc">Full JSON snapshots delivered to bsksam@gmail.com every 24 hours.</p>
            </div>

            <div className="fortress-card mini alert">
               <div className="mini-head">
                  <Lock size={20} color="#ef4444" />
                  <h3>Security Protocol</h3>
               </div>
               <div className="mini-stat">AES-256 Readiness</div>
               <p className="mini-desc">Your portable data is compiled in a machine-readable format for total portability.</p>
            </div>
         </div>
      </div>

      <section className="smtp-guide">
         <div className="guide-header">
            <Terminal size={24} color="#D4AF37" />
            <h2>System Administrator — SMTP Setup</h2>
         </div>
         <div className="guide-content">
            <p>To enable the **Enterprise Fortress** automated email delivery, ensure your server <code>.env</code> file contains the following credentials:</p>
            <pre className="code-box">
{`# REQUIRED: SMTP Security Credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=bsksam@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx # Your Google App Password
OWNER_EMAIL=bsksam@gmail.com`}
            </pre>
            <div className="guide-tip">
               <AlertCircle size={16} />
               <span>Need an App Password? Go to Google Account {' > '} Security {' > '} 2-Step Verification {' > '} App Passwords.</span>
            </div>
         </div>
      </section>

      <style>{`
        .fortress-grid { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; margin-top: 2rem; }
        .fortress-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 32px; padding: 3rem; position: relative; overflow: hidden; }
        .fortress-card.master-control { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.5rem; }
        .card-icon { width: 80px; height: 80px; background: rgba(212,175,55,0.05); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .fortress-card h2 { font-size: 2rem; color: #fff; }
        .fortress-card p { color: #888; max-width: 500px; line-height: 1.6; }

        .status-badges { display: flex; gap: 1rem; margin-top: 1rem; }
        .badge { font-size: 0.75rem; font-weight: 800; padding: 8px 16px; border-radius: 40px; display: flex; align-items: center; gap: 8px; border: 1px solid transparent; text-transform: uppercase; letter-spacing: 1px; }
        .badge.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; border-color: rgba(34, 197, 94, 0.2); }
        .badge.pulse { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-color: rgba(59, 130, 246, 0.2); }

        .action-zone { width: 100%; max-width: 600px; margin-top: 3rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .large-action { padding: 1.5rem 3rem; font-size: 1.1rem; border-radius: 20px; box-shadow: 0 10px 40px rgba(212,175,55,0.2); display: flex; align-items: center; justify-content: center; gap: 15px; }
        .success-banner { background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(34, 197, 94, 0.2); font-weight: 700; display: flex; align-items: center; gap: 12px; }
        .error-banner { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.2); font-weight: 700; display: flex; align-items: center; gap: 12px; }

        .fortress-info-stack { display: flex; flex-direction: column; gap: 1.5rem; }
        .fortress-card.mini { padding: 1.5rem; }
        .fortress-card.mini.alert { border-color: rgba(239, 68, 68, 0.1); }
        .mini-head { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
        .mini-head h3 { font-size: 1rem; color: #fff; }
        .mini-stat { font-size: 1.1rem; font-weight: 800; color: #D4AF37; margin-bottom: 0.5rem; }
        .mini-desc { font-size: 0.8rem !important; color: #555 !important; margin: 0 !important; }

        .smtp-guide { margin-top: 4rem; background: #0a0a0a; border: 1px solid var(--border); border-radius: 32px; padding: 3rem; }
        .guide-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .guide-header h2 { font-size: 1.5rem; color: #fff; }
        .code-box { background: #000; padding: 2rem; border-radius: 16px; font-family: 'Fira Code', monospace; font-size: 0.9rem; color: #D4AF37; border: 1px solid rgba(212,175,55,0.2); margin: 1.5rem 0; }
        .guide-tip { display: flex; align-items: center; gap: 10px; color: #666; font-size: 0.85rem; }
      `}</style>
    </div>
  );
};

export default BackupCenter;
