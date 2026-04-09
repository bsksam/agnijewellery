import React, { useState } from 'react';
import { AuthAPI } from '../api/api';
import { Lock, User, CircleDollarSign, LogIn, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Background Particles
  const particles = Array.from({ length: 20 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await AuthAPI.login({ username, password });
      onLoginSuccess(res.data.user, res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="grain-overlay"></div>
      <div className="particle-container">
         {particles.map((_, i) => (
            <motion.div 
               key={i} 
               className="jewel-dust"
               initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight,
                  opacity: 0 
               }}
               animate={{ 
                  y: [null, Math.random() * -500],
                  opacity: [0, 0.4, 0]
               }}
               transition={{ 
                  duration: 10 + Math.random() * 20, 
                  repeat: Infinity,
                  ease: "linear"
               }}
            />
         ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="login-card-elite"
      >
        <div className="login-header">
           <div className="login-logo-elite">
              <CircleDollarSign size={32} color="#D4AF37" />
           </div>
           <h1>Agni Jewellery <span className="gold-text">Pro</span></h1>
           <p>Universal Enterprise Intelligence Hub</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group-login">
            <label><User size={14} /> Identity</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>

          <div className="form-group-login">
            <label><Lock size={14} /> Secret Key</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-login-elite">
            {loading ? (
               <div className="auth-pulse">Authenticating Portal...</div>
            ) : (
              <>
                Ignite Suite <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer-elite">
          <p>© 2026 AGNI INTELLIGENCE SYSTEMS</p>
          <div className="security-tag">ESTD. 24-BIT ENCRYPTION</div>
        </div>
      </motion.div>

      <style>{`
        .login-page {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #050505;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }
        .grain-overlay {
           position: absolute; inset: 0;
           background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
           opacity: 0.03; pointer-events: none; z-index: 1;
        }
        .particle-container { position: absolute; inset: 0; z-index: 0; }
        .jewel-dust { position: absolute; width: 4px; height: 4px; background: #D4AF37; border-radius: 50%; filter: blur(2px); box-shadow: 0 0 10px #D4AF37; }
        
        .login-card-elite {
          width: 100%;
          max-width: 440px;
          background: rgba(20, 20, 20, 0.4);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 40px;
          padding: 3.5rem;
          z-index: 10;
          box-shadow: 0 30px 100px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.02);
        }
        .login-header { text-align: center; margin-bottom: 2.5rem; }
        .login-logo-elite {
          display: inline-flex;
          width: 64px; height: 64px;
          background: #000;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 20px;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);
        }
        .login-header h1 { font-size: 2.2rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 0.5rem; color: #fff; }
        .gold-text { color: #D4AF37; }
        .login-header p { color: #555; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }

        .form-group-login { margin-bottom: 1.5rem; }
        .form-group-login label { display: block; color: #777; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.75rem; }
        .form-group-login input {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 1rem 1.25rem;
          color: white;
          font-family: inherit;
          font-size: 1rem;
          transition: 0.3s;
        }
        .form-group-login input:focus { border-color: #D4AF37; outline: none; background: rgba(0,0,0,0.5); box-shadow: 0 0 20px rgba(212, 175, 55, 0.1); }

        .btn-login-elite {
          width: 100%;
          background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
          color: #000;
          border: none;
          padding: 1.1rem;
          border-radius: 16px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3);
        }
        .btn-login-elite:hover { transform: scale(1.02); box-shadow: 0 15px 35px rgba(212, 175, 55, 0.4); }
        .auth-pulse { animation: pulse 2s infinite; font-size: 0.9rem; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .login-footer-elite { margin-top: 3rem; text-align: center; }
        .login-footer-elite p { font-size: 0.65rem; color: #333; font-weight: 800; letter-spacing: 1px; }
        .security-tag { display: inline-block; margin-top: 10px; font-size: 0.55rem; color: #22c55e; border: 1px solid #22c55e33; padding: 2px 8px; border-radius: 4px; font-weight: 900; }
      `}</style>
    </div>
  );
};

export default Login;
