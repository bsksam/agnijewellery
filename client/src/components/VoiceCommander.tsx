import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceCommander } from '../services/voiceService';

const VoiceCommander = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  
  const { processCommand, speak } = useVoiceCommander(setActiveTab);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    const Recognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('Listening for command...');
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      setTranscript(`Recognized: "${command}"`);
      processCommand(command);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setTranscript('Acoustic error. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!isSupported) return null;

  return (
    <div className="voice-commander-fixed">
      <AnimatePresence>
        {transcript && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="command-pill"
          >
             <Command size={14} color="#D4AF37" />
             <span>{transcript}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={startListening}
        className={`orb-button ${isListening ? 'active' : ''}`}
      >
         <div className="orb-rings">
            <div className={`ring ring-1 ${isListening ? 'pulse' : ''}`} />
            <div className={`ring ring-2 ${isListening ? 'pulse delay-1' : ''}`} />
         </div>
         <div className="orb-center">
            {isListening ? <Volume2 size={24} color="#000" /> : <Mic size={24} color="#D4AF37" />}
         </div>
      </motion.button>

      <style>{`
        .voice-commander-fixed {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1rem;
          pointer-events: none;
        }
        .voice-commander-fixed > * { pointer-events: all; }

        .orb-button {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: none;
          background: #1A1A1A;
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          border: 1px solid rgba(212,175,55,0.2);
        }
        .orb-button.active { background: #D4AF37; }

        .orb-center { position: relative; z-index: 2; }

        .orb-rings { position: absolute; inset: -10px; pointer-events: none; }
        .ring { position: absolute; inset: 0; border: 2px solid #D4AF37; border-radius: 50%; opacity: 0; }
        
        @keyframes pulse {
           0% { transform: scale(1); opacity: 0.5; }
           100% { transform: scale(1.8); opacity: 0; }
        }
        .ring.pulse { animation: pulse 2s infinite ease-out; }
        .delay-1 { animation-delay: 1s !important; }

        .command-pill {
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(10px);
          padding: 12px 24px;
          border-radius: 40px;
          border: 1px solid rgba(212,175,55,0.3);
          color: #fff;
          font-size: 0.85rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default VoiceCommander;
