import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Tag, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings as SettingsIcon, 
  LogOut,
  TrendingUp,
  CircleDollarSign,
  History,
  Layers,
  ShieldCheck,
  BarChart3,
  Scan,
  Library,
  ClipboardList,
  PiggyBank,
  Hammer,
  Database,
  Wrench,
  PartyPopper,
  Building2,
  FileSpreadsheet,
  FileText,
  Trophy,
  Fingerprint,
  ShieldAlert,
  BrainCircuit,
  Smartphone,
  Eye,
  Sparkles,
  ShieldHalf,
  Search,
  Repeat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthAPI, SearchAPI } from './api/api';

// Components
import LanguageSwitcher from './components/LanguageSwitcher';
import VoiceCommander from './components/VoiceCommander';

// Pages
import Dashboard from './pages/Dashboard';
import RateManagement from './pages/RateManagement';
import MasterData from './pages/MasterData';
import Inventory from './pages/Inventory';
import BillingForm from './pages/BillingForm';
import SalesHistory from './pages/SalesHistory';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Audit from './pages/Audit';
import Accounting from './pages/Accounting';
import Orders from './pages/Orders';
import Schemes from './pages/Schemes';
import Dealers from './pages/Dealers';
import Migration from './pages/Migration';
import Repairs from './pages/Repairs';
import Marketing from './pages/Marketing';
import Branches from './pages/Branches';
import TaxHub from './pages/TaxHub';
import Estimator from './pages/Estimator';
import StaffIncentives from './pages/StaffIncentives';
import AuditHub from './pages/AuditHub';
import BackupCenter from './pages/BackupCenter';
import IntelligenceHub from './pages/IntelligenceHub';
import VisionHub from './pages/VisionHub';
import PublicVerify from './pages/PublicVerify';
import PublicShowroom from './pages/PublicShowroom';
import CustomerPassbook from './pages/CustomerPassbook';
import AgniGuardian from './pages/AgniGuardian';
import BuybackForm from './pages/BuybackForm';

const Sidebar = ({ active, setActive, user, onLogout, installPrompt }: { 
  active: string, 
  setActive: (v: string) => void,
  user: any,
  onLogout: () => void,
  installPrompt: any
}) => {
  const { t } = useTranslation();

  const menuItems = [
    { name: t('dashboard'), id: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { name: 'Agni Guardian AI', id: 'Agni Guardian', icon: ShieldHalf, roles: ['ADMIN'] },
    { name: t('vision'), id: 'Agni Vision AI', icon: Sparkles, roles: ['ADMIN', 'STAFF'] },
    { name: t('intelligence'), id: 'Strategic Intelligence', icon: BrainCircuit, roles: ['ADMIN'] },
    { name: t('backup'), id: 'Enterprise Backup', icon: ShieldAlert, roles: ['ADMIN'] },
    { name: t('forensic'), id: 'Forensic Audit', icon: Fingerprint, roles: ['ADMIN'] },
    { name: t('performance'), id: 'Team Performance', icon: Trophy, roles: ['ADMIN', 'STAFF'] },
    { name: t('quotation'), id: 'Quotation Desk', icon: FileText, roles: ['ADMIN', 'STAFF'] },
    { name: t('gst'), id: 'GST Compliance', icon: FileSpreadsheet, roles: ['ADMIN'] },
    { name: t('branches'), id: 'Branch & Warehouse', icon: Building2, roles: ['ADMIN'] },
    { name: t('marketing'), id: 'Marketing & Loyalty', icon: PartyPopper, roles: ['ADMIN'] },
    { name: t('repairs'), id: 'Repairs & Service', icon: Wrench, roles: ['ADMIN', 'STAFF'] },
    { name: 'Old Gold Buyback', id: 'Buybacks & Exchanges', icon: Repeat, roles: ['ADMIN', 'STAFF'] },
    { name: t('migration'), id: 'Migration & Backup', icon: Database, roles: ['ADMIN'] },
    { name: t('dealers'), id: 'Dealer Registry', icon: Hammer, roles: ['ADMIN'] },
    { name: t('schemes'), id: 'Savings Schemes', icon: PiggyBank, roles: ['ADMIN', 'STAFF'] },
    { name: t('orders'), id: 'Specialized Orders', icon: ClipboardList, roles: ['ADMIN', 'STAFF'] },
    { name: t('accounting'), id: 'Accounts Hub', icon: Library, roles: ['ADMIN'] },
    { name: t('audit'), id: 'Stock Audit', icon: Scan, roles: ['ADMIN'] },
    { name: t('reports'), id: 'Reports', icon: BarChart3, roles: ['ADMIN'] },
    { name: t('rates'), id: 'Rates', icon: TrendingUp, roles: ['ADMIN'] },
    { name: t('master_data'), id: 'Master Data', icon: Layers, roles: ['ADMIN'] },
    { name: t('inventory'), id: 'Inventory/Tags', icon: Tag, roles: ['ADMIN', 'STAFF'] },
    { name: t('billing'), id: 'Billing', icon: ShoppingCart, roles: ['ADMIN', 'STAFF'] },
    { name: t('history'), id: 'Sales History', icon: History, roles: ['ADMIN', 'STAFF'] },
    { name: t('customers'), id: 'Customers', icon: Users, roles: ['ADMIN', 'STAFF'] },
    { name: t('settings'), id: 'Settings', icon: SettingsIcon, roles: ['ADMIN'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <CircleDollarSign size={20} color="#0F0F0F" />
        </div>
        <span className="logo-text">AGNI</span>
      </div>

      <div className="user-profile-section no-print">
         <div className="user-avatar">
            <ShieldCheck size={18} color={user.role === 'ADMIN' ? '#D4AF37' : '#22c55e'} />
         </div>
         <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
         </div>
      </div>
      
      <ul className="nav-links">
        {visibleItems.map((item) => (
          <li 
            key={item.id} 
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => setActive(item.id)}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 'auto' }}>
        <LanguageSwitcher />
        {installPrompt && (
           <div className="install-banner" onClick={() => installPrompt.prompt()}>
              <Smartphone size={18} />
              <span>Install Agni Pro</span>
           </div>
        )}
        <div className="nav-item logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </div>
      </div>

      <style>{`
        .user-profile-section {
          padding: 1.5rem;
          margin-bottom: 1rem;
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .user-avatar {
          background: #1A1A1A;
          padding: 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-name { font-weight: 700; font-size: 0.9rem; color: white; }
        .user-role { font-size: 0.7rem; color: #888; font-weight: 600; letter-spacing: 0.5px; }
        .logout-btn { color: #EF4444 !important; opacity: 0.8; }
        .logout-btn:hover { opacity: 1; background: rgba(239, 68, 68, 0.1) !important; }
        
        .install-banner {
          margin: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
          border-radius: 12px;
          color: #000;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 800;
          font-size: 0.8rem;
          box-shadow: 0 4px 15px rgba(212,175,55,0.3);
          transition: 0.3s;
        }
        .install-banner:hover { transform: scale(1.02); }
      `}</style>
    </aside>
  );
};

const CommandPalette = ({ isOpen, onClose, setActiveTab }: any) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await SearchAPI.universalSearch(query);
        setResults(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <motion.div 
         initial={{ y: -20, opacity: 0 }} 
         animate={{ y: 0, opacity: 1 }}
         className="command-palette-box" 
         onClick={(e: any) => e.stopPropagation()}
      >
        <div className="search-input-wrapper">
          <Search size={20} color="#D4AF37" />
          <input 
            autoFocus 
            placeholder="Search Tags, Customers, or Bills..." 
            value={query}
            onChange={(e: any) => setQuery(e.target.value)}
          />
        </div>

        <div className="search-results scrollable">
          {loading && <div className="p-4 text-center text-xs opacity-50">Searching Oracle...</div>}
          {results.map((res, i) => (
            <div key={i} className="search-result-item" onClick={() => {
              if (res.type === 'CUSTOMER') setActiveTab('Customers');
              if (res.type === 'BILL') setActiveTab('Sales History');
              if (res.type === 'STOCK') setActiveTab('Inventory/Tags');
              onClose();
            }}>
              <div className="res-type">{res.type}</div>
              <div className="res-content">
                <strong>{res.title}</strong>
                <span>{res.subtitle}</span>
              </div>
            </div>
          ))}
          {query.length >= 2 && results.length === 0 && !loading && (
            <div className="p-4 text-center text-xs opacity-50">No matches found</div>
          )}
        </div>
        <div className="p-4 border-t border-white/5 text-[10px] text-zinc-500 uppercase tracking-widest text-center">
           Press ESC to close
        </div>
      </motion.div>
      <style>{`
        .command-palette-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 9999; display: flex; justify-content: center; padding-top: 10vh; }
        .command-palette-box { background: #151515; width: 100%; max-width: 600px; border-radius: 20px; border: 1px solid rgba(212,175,55,0.2); box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; height: fit-content; max-height: 500px; display: flex; flex-direction: column; }
        .search-input-wrapper { display: flex; align-items: center; gap: 15px; padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .search-input-wrapper input { background: none; border: none; flex: 1; color: white; font-size: 1.1rem; outline: none; }
        .search-results { flex: 1; overflow-y: auto; }
        .search-result-item { display: flex; align-items: center; gap: 15px; padding: 1rem 1.5rem; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.02); transition: 0.2s; }
        .search-result-item:hover { background: rgba(212,175,55,0.05); }
        .res-type { font-size: 0.6rem; font-weight: 900; background: rgba(212,175,55,0.1); color: #D4AF37; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(212,175,55,0.2); }
        .res-content { display: flex; flex-direction: column; gap: 2px; }
        .res-content strong { font-size: 0.9rem; color: #eee; }
        .res-content span { font-size: 0.75rem; color: #666; }
      `}</style>
    </div>
  );
};

const MobileNav = ({ activeTab, setActiveTab }: any) => {
  const tabs = [
    { name: 'Dashboard', icon: Sparkles },
    { name: 'Billing', icon: ShoppingCart },
    { name: 'Inventory/Tags', icon: Package },
    { name: 'Agni Guardian', icon: ShieldHalf }
  ];

  return (
    <div className="mobile-nav no-print">
      {tabs.map(t => (
        <div 
          key={t.name} 
          className={`mob-nav-item ${activeTab === t.name ? 'active' : ''}`}
          onClick={() => setActiveTab(t.name)}
        >
          <t.icon size={20} />
          <span>{t.name.split('/')[0]}</span>
        </div>
      ))}
      <style>{`
        .mobile-nav { 
          position: fixed; bottom: 15px; left: 15px; right: 15px; height: 70px; 
          background: rgba(15,15,15,0.8); backdrop-filter: blur(20px); 
          border: 1px solid rgba(212,175,55,0.2); border-radius: 20px; 
          display: flex; justify-content: space-around; align-items: center; z-index: 1000;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .mob-nav-item { display: flex; flex-direction: column; align-items: center; gap: 5px; color: #555; transition: 0.3s; width: 25%; }
        .mob-nav-item span { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
        .mob-nav-item.active { color: #D4AF37; }
        .mob-nav-item.active svg { filter: drop-shadow(0 0 5px #D4AF37); }
      `}</style>
    </div>
  );
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    checkAuth();
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      console.log('Agni ERP installed successfully');
    });
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await AuthAPI.getMe();
      setUser(res.data.user);
      setActiveTab(res.data.user.role === 'ADMIN' ? 'Dashboard' : 'Billing');
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user: any, token: string) => {
    localStorage.setItem('token', token);
    setUser(user);
    setActiveTab(user.role === 'ADMIN' ? 'Dashboard' : 'Billing');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <div className="loading-screen">Verifying session...</div>;

  // Handle Public QR Verification Route
  if (window.location.pathname.startsWith('/verify/')) {
    const tagNo = window.location.pathname.split('/').pop();
    return <PublicVerify tagNo={tagNo} />;
  }

  // Handle Public Showroom Route
  if (window.location.pathname === '/showroom') {
    return <PublicShowroom />;
  }

  // Handle Customer Passbook Route
  if (window.location.pathname === '/my-gold') {
    return <CustomerPassbook />;
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`dashboard-container ${isMobile ? 'mobile-layout' : ''}`}>
      {!isMobile && (
        <Sidebar 
          active={activeTab} 
          setActive={setActiveTab} 
          user={user} 
          onLogout={handleLogout} 
          installPrompt={deferredPrompt}
        />
      )}
      
      {activeTab === 'Dashboard' && user.role === 'ADMIN' && <Dashboard />}
      {activeTab === 'Agni Guardian' && user.role === 'ADMIN' && <AgniGuardian />}
      {activeTab === 'Agni Vision AI' && <VisionHub />}
      {activeTab === 'Strategic Intelligence' && user.role === 'ADMIN' && <IntelligenceHub />}
      {activeTab === 'Enterprise Backup' && user.role === 'ADMIN' && <BackupCenter />}
      {activeTab === 'Forensic Audit' && user.role === 'ADMIN' && <AuditHub />}
      {activeTab === 'Team Performance' && <StaffIncentives user={user} />}
      {activeTab === 'Quotation Desk' && <Estimator />}
      {activeTab === 'GST Compliance' && user.role === 'ADMIN' && <TaxHub />}
      {activeTab === 'Branch & Warehouse' && user.role === 'ADMIN' && <Branches />}
      {activeTab === 'Marketing & Loyalty' && user.role === 'ADMIN' && <Marketing />}
      {activeTab === 'Repairs & Service' && <Repairs />}
      {activeTab === 'Buybacks & Exchanges' && <BuybackForm />}
      {activeTab === 'Migration & Backup' && user.role === 'ADMIN' && <Migration />}
      {activeTab === 'Dealer/Smith Registry' && user.role === 'ADMIN' && <Dealers />}
      {activeTab === 'Savings Schemes' && <Schemes />}
      {activeTab === 'Specialized Orders' && <Orders />}
      {activeTab === 'Accounts Hub' && user.role === 'ADMIN' && <Accounting />}
      {activeTab === 'Stock Audit' && user.role === 'ADMIN' && <Audit />}
      {activeTab === 'Reports' && user.role === 'ADMIN' && <Reports />}
      {activeTab === 'Rates' && user.role === 'ADMIN' && <RateManagement />}
      {activeTab === 'Master Data' && user.role === 'ADMIN' && <MasterData />}
      {activeTab === 'Settings' && user.role === 'ADMIN' && <Settings />}
      
      {activeTab === 'Inventory/Tags' && <Inventory />}
      {activeTab === 'Billing' && <BillingForm />}
      {activeTab === 'Sales History' && <SalesHistory />}
      {activeTab === 'Customers' && <Customers />}

      <VoiceCommander setActiveTab={setActiveTab} />
      <CommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        setActiveTab={setActiveTab} 
      />
      {isMobile && <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
}

export default App;
