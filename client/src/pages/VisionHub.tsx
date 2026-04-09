import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import { 
  Camera, 
  Scan, 
  Search, 
  FileText, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Maximize,
  Sparkles,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VisionHub = () => {
  const [mode, setMode] = useState<'OCR' | 'SEARCH'>('OCR');
  const [isCapturing, setIsCapturing] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsCapturing(false);
      processImage(imageSrc);
    }
  }, [webcamRef]);

  const processImage = async (image: string) => {
    setProcessing(true);
    try {
      if (mode === 'OCR') {
        const { data: { text } } = await Tesseract.recognize(image, 'eng', {
           logger: m => console.log(m)
        });
        
        // Advanced Logic: Extract weight and name from OCR text
        const weightMatch = text.match(/(\d+\.\d+)\s*(g|grams|gm)/i);
        const nameMatch = text.match(/[A-Z\s]{4,}/g);

        setResults({
          text,
          detectedWeight: weightMatch ? weightMatch[1] : 'Not Found',
          detectedName: nameMatch ? nameMatch[0].trim() : 'Scanning...'
        });
      } else {
        // Mocked Item Search Analysis
        setResults({
          matchFound: true,
          suggestions: [
            { tag: 'TJ10294', name: 'Gold Haram (Traditional)', match: '94%' },
            { tag: 'TJ88273', name: 'Antique Gold Necklace', match: '82%' }
          ]
        });
      }
    } catch (err) {
      console.error('Vision Processing Error', err);
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResults(null);
    setIsCapturing(true);
  };

  return (
    <div className="main-content">
      <header className="header">
        <div className="welcome-msg">
          <h1>Agni Vision AI Hub</h1>
          <p>Next-generation computer vision for intelligent stock recognition & data entry.</p>
        </div>
        <div className="mode-toggle">
            <button 
              className={`btn ${mode === 'OCR' ? 'active' : ''}`} 
              onClick={() => { setMode('OCR'); reset(); }}
            >
               <FileText size={18} /> Invoice OCR
            </button>
            <button 
              className={`btn ${mode === 'SEARCH' ? 'active' : ''}`} 
              onClick={() => { setMode('SEARCH'); reset(); }}
            >
               <Search size={18} /> Item Search
            </button>
        </div>
      </header>

      <div className="vision-container">
         <div className="camera-section">
            <AnimatePresence mode="wait">
               {isCapturing ? (
                 <motion.div 
                   key="webcam"
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   className="webcam-wrapper"
                 >
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: 'environment' }}
                      className="webcam-view"
                    />
                    <div className="viewfinder">
                       <div className="corner tl" />
                       <div className="corner tr" />
                       <div className="corner bl" />
                       <div className="corner br" />
                    </div>
                    <button className="capture-btn" onClick={capture}>
                       <Camera size={32} />
                    </button>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="preview"
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   className="preview-wrapper"
                 >
                    <img src={capturedImage!} alt="Captured" className="captured-img" />
                    {processing && (
                       <div className="processing-overlay">
                          <Zap size={48} color="#D4AF37" className="animate-pulse" />
                          <p>Agni Intelligence Processing...</p>
                       </div>
                    )}
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         <div className="results-section">
            {!isCapturing && (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }}
                 className="results-content"
               >
                  <div className="result-header">
                     {processing ? <Sparkles size={24} color="#D4AF37" /> : <CheckCircle2 size={24} color="#22c55e" />}
                     <h3>Analysis Report</h3>
                  </div>

                  {results && mode === 'OCR' && (
                     <div className="ocr-results">
                        <div className="extracted-boxes">
                           <div className="ex-box">
                              <label>Predicted Weight</label>
                              <div className="val">{results.detectedWeight}g</div>
                           </div>
                           <div className="ex-box">
                              <label>Detected Category</label>
                              <div className="val">{results.detectedName}</div>
                           </div>
                        </div>
                        <div className="raw-text">
                           <label>Raw OCR Data</label>
                           <pre>{results.text}</pre>
                        </div>
                        <button className="btn btn-primary full-width">
                           <RefreshCcw size={18} /> Auto-Fill Stock Form
                        </button>
                     </div>
                  )}

                  {results && mode === 'SEARCH' && (
                     <div className="search-results">
                        <p>Found {results.suggestions.length} potential matches for this design:</p>
                        <div className="suggestion-list">
                           {results.suggestions.map((s: any) => (
                             <div key={s.tag} className="suggestion-card">
                                <div>
                                   <strong>{s.tag}</strong>
                                   <span>{s.name}</span>
                                </div>
                                <div className="match-val">{s.match}</div>
                             </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <button className="btn btn-secondary full-width" style={{ marginTop: 'auto' }} onClick={reset}>
                     <RefreshCcw size={18} /> New Scan
                  </button>
               </motion.div>
            )}

            {isCapturing && (
               <div className="guide-placeholder">
                  <ImageIcon size={64} color="#222" />
                  <h2>Align {mode === 'OCR' ? 'Invoice' : 'Jewelry'}</h2>
                  <p>Hold your camera steady for the sharpest results. Agni Vision works best in bright lighting.</p>
               </div>
            )}
         </div>
      </div>

      <style>{`
        .mode-toggle { display: flex; gap: 8px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 12px; }
        .mode-toggle .btn { padding: 8px 16px; font-size: 0.8rem; border-radius: 8px; opacity: 0.6; border: none !important; }
        .mode-toggle .btn.active { opacity: 1; background: #D4AF37; color: #000; font-weight: 800; }

        .vision-container { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; margin-top: 2rem; height: calc(100vh - 250px); }
        
        .camera-section { background: #000; border-radius: 32px; overflow: hidden; position: relative; border: 1px solid var(--border); }
        .webcam-wrapper, .preview-wrapper { width: 100%; height: 100%; position: relative; }
        .webcam-view, .captured-img { width: 100%; height: 100%; object-fit: cover; }
        
        .viewfinder { position: absolute; inset: 10%; border: 1px solid rgba(255,255,255,0.1); pointer-events: none; }
        .corner { width: 30px; height: 30px; border: 4px solid #D4AF37; position: absolute; }
        .tl { top: -4px; left: -4px; border-right: 0; border-bottom: 0; border-radius: 12px 0 0 0; }
        .tr { top: -4px; right: -4px; border-left: 0; border-bottom: 0; border-radius: 0 12px 0 0; }
        .bl { bottom: -4px; left: -4px; border-right: 0; border-top: 0; border-radius: 0 0 0 12px; }
        .br { bottom: -4px; right: -4px; border-left: 0; border-top: 0; border-radius: 0 0 12px 0; }

        .capture-btn { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); width: 70px; height: 70px; border-radius: 50%; background: #D4AF37; border: 8px solid rgba(255,255,255,0.2); color: #000; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
        .capture-btn:active { transform: translateX(-50%) scale(0.9); }

        .processing-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: #D4AF37; font-weight: 800; }

        .results-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 2.5rem; display: flex; flex-direction: column; }
        .results-content { display: flex; flex-direction: column; height: 100%; }
        .result-header { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; border-bottom: 1px solid var(--border); pb: 1rem; }
        .result-header h3 { font-size: 1.2rem; color: #fff; }

        .extracted-boxes { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
        .ex-box { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; border: 1px solid var(--border); }
        .ex-box label { display: block; font-size: 0.65rem; color: #666; text-transform: uppercase; margin-bottom: 4px; }
        .ex-box .val { font-size: 1.1rem; font-weight: 800; color: #D4AF37; }

        .raw-text { flex: 1; background: #080808; padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; overflow-y: auto; }
        .raw-text label { display: block; font-size: 0.7rem; color: #444; margin-bottom: 1rem; }
        .raw-text pre { font-family: monospace; font-size: 0.8rem; color: #888; white-space: pre-wrap; line-height: 1.6; }

        .suggestion-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
        .suggestion-card { background: rgba(0,0,0,0.2); padding: 1.2rem; border-radius: 16px; border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .suggestion-card strong { display: block; color: #fff; margin-bottom: 4px; }
        .suggestion-card span { font-size: 0.75rem; color: #555; }
        .match-val { background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 0.75rem; }

        .guide-placeholder { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1.5rem; opacity: 0.5; }
        .guide-placeholder h2 { font-size: 1.4rem; color: #fff; }
        .guide-placeholder p { max-width: 250px; line-height: 1.6; font-size: 0.85rem; }
      `}</style>
    </div>
  );
};

export default VisionHub;
