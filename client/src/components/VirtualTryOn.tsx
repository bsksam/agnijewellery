import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Download, 
  Move, 
  Maximize, 
  RotateCw, 
  Minus, 
  Plus, 
  Share2,
  CheckCircle2,
  Camera as CameraIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VirtualTryOnProps {
  product: any;
  onClose: () => void;
}

const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ product, onClose }) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const savePortrait = () => {
    const canvas = canvasRef.current;
    if (!canvas || !userImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const userImg = new Image();
    const productImg = new Image();
    
    userImg.onload = () => {
      canvas.width = userImg.width;
      canvas.height = userImg.height;
      ctx.drawImage(userImg, 0, 0);

      productImg.onload = () => {
        const prodWidth = (canvas.width * 0.4) * scale;
        const prodHeight = (productImg.height / productImg.width) * prodWidth;
        
        ctx.save();
        ctx.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(productImg, -prodWidth / 2, -prodHeight / 2, prodWidth, prodHeight);
        
        // Add Branding
        ctx.restore();
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 30px Outfit';
        ctx.fillText('AGNI JEWELLERY', 40, canvas.height - 40);

        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `AgniSelfie_${product.product_name}.png`;
        link.href = dataURL;
        link.click();
      };
      // Use placeholder or actual product image
      productImg.src = product.image_url || 'https://images.unsplash.com/photo-1599643477877-50a3ecda45c6?auto=format&fit=crop&q=80&w=200';
      productImg.crossOrigin = "anonymous";
    };
    userImg.src = userImage;
  };

  return (
    <div className="tryon-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="tryon-modal"
      >
        <div className="tryon-header">
           <div className="tryon-title">
              <Camera size={20} color="#D4AF37" />
              <h3>Virtual Mirror: {product.product_name}</h3>
           </div>
           <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="mirror-zone">
           {userImage ? (
              <div 
                className="mirror-canvas" 
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                 <img src={userImage} alt="User" className="user-bg" />
                 <motion.img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1599643477877-50a3ecda45c6?auto=format&fit=crop&q=80&w=600'}
                    alt="Jewelry"
                    className="jewelry-overlay"
                    style={{ 
                       transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                       cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={handleMouseDown}
                    draggable={false}
                 />
                 
                 <div className="controls-hud">
                    <button onClick={() => setScale(s => s + 0.1)}><Plus size={16} /></button>
                    <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))}><Minus size={16} /></button>
                    <button onClick={() => setRotation(r => r + 15)}><RotateCw size={16} /></button>
                    <button className="done-btn" onClick={savePortrait}><Download size={16} /> Save</button>
                 </div>
              </div>
           ) : (
              <div className="upload-prompt" onClick={() => fileInputRef.current?.click()}>
                 <CameraIcon size={48} color="#222" />
                 <h4>Upload a Selfie to Begin</h4>
                 <p>Experience how this piece looks on you instantly.</p>
                 <input 
                   type="file" 
                   hidden 
                   ref={fileInputRef} 
                   accept="image/*"
                   onChange={handleFileUpload} 
                 />
              </div>
           )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="tryon-footer">
           <div className="tip">
              <Move size={14} />
              <span>Drag to position. Use HUD to resize.</span>
           </div>
           {userImage && (
              <button 
                className="btn btn-primary"
                onClick={() => window.open(`https://wa.me/+919876543210?text=Hi, I just tried on the ${product.product_name} in your Virtual Mirror and I love it! Can I schedule a viewing?`)}
              >
                 <Share2 size={18} /> Inquire via WhatsApp
              </button>
           )}
        </div>
      </motion.div>

      <style>{`
        .tryon-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .tryon-modal { background: #0A0A0A; border: 1px solid #222; width: 100%; max-width: 900px; border-radius: 32px; overflow: hidden; display: flex; flex-direction: column; height: 90vh; }
        
        .tryon-header { padding: 1.5rem 2.5rem; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .tryon-title { display: flex; align-items: center; gap: 12px; }
        .tryon-title h3 { font-size: 1.1rem; color: #fff; }
        .close-btn { background: none; border: none; color: #555; cursor: pointer; }

        .mirror-zone { flex: 1; position: relative; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .upload-prompt { text-align: center; cursor: pointer; color: #444; }
        .upload-prompt h4 { color: #fff; margin-bottom: 0.5rem; font-size: 1.5rem; }

        .mirror-canvas { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
        .user-bg { height: 100%; width: 100%; object-fit: contain; }
        .jewelry-overlay { position: absolute; max-width: 300px; pointer-events: all; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5)); }

        .controls-hud { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); padding: 8px; border-radius: 40px; display: flex; gap: 1rem; border: 1px solid #333; }
        .controls-hud button { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #444; background: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .controls-hud .done-btn { width: auto; padding: 0 20px; border-radius: 20px; background: #D4AF37; color: #000; font-weight: 800; gap: 8px; }

        .tryon-footer { padding: 1.5rem 2.5rem; border-top: 1px solid #222; display: flex; justify-content: space-between; align-items: center; background: #050505; }
        .tip { display: flex; align-items: center; gap: 8px; color: #555; font-size: 0.8rem; }
      `}</style>
    </div>
  );
};

export default VirtualTryOn;
