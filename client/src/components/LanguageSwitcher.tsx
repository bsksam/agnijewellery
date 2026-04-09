import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronUp } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', label: 'EN' },
    { code: 'hi', name: 'हिन्दी', label: 'HI' },
    { code: 'kn', name: 'ಕನ್ನಡ', label: 'KN' },
    { code: 'ta', name: 'தமிழ்', label: 'TA' },
    { code: 'ml', name: 'മലയാളം', label: 'ML' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className="language-switcher-wrapper">
      <div className="current-lang">
         <Languages size={18} color="#D4AF37" />
         <span className="lang-text">{currentLang.name}</span>
      </div>
      <div className="lang-dropdown">
         {languages.map(lang => (
            <div 
              key={lang.code} 
              className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
              onClick={() => i18n.changeLanguage(lang.code)}
            >
               <span className="lang-name">{lang.name}</span>
               <span className="lang-code-box">{lang.label}</span>
            </div>
         ))}
      </div>

      <style>{`
        .language-switcher-wrapper {
          position: relative;
          margin: 1rem;
          padding: 1rem;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: 0.3s;
        }
        .current-lang { display: flex; align-items: center; gap: 12px; }
        .lang-text { font-size: 0.85rem; font-weight: 700; color: #eee; }
        
        .lang-dropdown {
          position: absolute;
          bottom: 110%;
          left: 0;
          width: 100%;
          background: #1A1A1A;
          border: 1px solid #333;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          opacity: 0;
          transform: translateY(10px);
          pointer-events: none;
          transition: 0.3s;
          z-index: 1000;
          overflow: hidden;
        }
        .language-switcher-wrapper:hover .lang-dropdown {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }

        .lang-option {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: 0.2s;
        }
        .lang-option:hover { background: rgba(212,175,55,0.1); }
        .lang-option.active { background: rgba(212,175,55,0.05); }
        .lang-name { font-size: 0.8rem; font-weight: 600; color: #aaa; }
        .lang-option.active .lang-name { color: #D4AF37; }
        .lang-code-box { font-size: 0.65rem; font-weight: 800; background: #222; padding: 2px 6px; border-radius: 4px; color: #555; }
        .lang-option.active .lang-code-box { background: #D4AF37; color: #000; }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;
