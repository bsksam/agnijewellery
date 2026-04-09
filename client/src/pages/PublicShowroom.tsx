import React, { useState, useEffect } from 'react';
import { PublicAPI } from '../api/api';
import { 
  Gem, 
  MessageCircle, 
  Search, 
  Filter, 
  ChevronRight, 
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  Maximize2,
  X,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VirtualTryOn from '../components/VirtualTryOn';

const PublicShowroom = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [tryOnItem, setTryOnItem] = useState<any>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await PublicAPI.getPublicShowroom();
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load showroom', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', ...new Set(items.map(i => i.category_name))];

  const filteredItems = items.filter(i => {
    const matchesSearch = i.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         i.tag_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || i.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleWhatsAppEnquiry = (item: any) => {
    const message = `Hi Agni Jewellery, I'm interested in viewing this piece:
Item: ${item.product_name}
Tag No: ${item.tag_no}
Category: ${item.category_name}
Weight: ${item.net_weight}g

Please let me know the current price and availability. Thank you!`;

    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return (
    <div className="showroom-loading">
       <Gem className="animate-pulse" size={48} color="#D4AF37" />
       <h2>Entering the Luxury Vault...</h2>
    </div>
  );

  return (
    <div className="showroom-page">
      <nav className="showroom-nav">
         <div className="nav-content">
            <div className="luxury-logo">
               <Gem size={28} color="#D4AF37" />
               <span>AGNI JEWELLERY</span>
            </div>
            <div className="nav-links">
               <a href="#collections">Collections</a>
               <a href="#contact">Visit Store</a>
            </div>
         </div>
      </nav>

      <header className="showroom-hero">
         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="hero-content">
            <h1>The Eternal Collection</h1>
            <p>Handcrafted luxury. Timeless elegance. Explore our live showroom.</p>
         </motion.div>
      </header>

      <main className="showroom-main">
         <section className="filter-bar">
            <div className="search-wrap">
               <Search size={18} />
               <input 
                 type="text" 
                 placeholder="Search by collection or tag..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="category-scroll">
               {categories.map(cat => (
                 <button 
                   key={cat} 
                   className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                   onClick={() => setSelectedCategory(cat)}
                 >
                   {cat}
                 </button>
               ))}
            </div>
         </section>

         <div className="gallery-grid">
            {filteredItems.map(item => (
              <motion.div 
                layoutId={item.tag_no} 
                key={item.tag_no} 
                className="product-card"
                onClick={() => setSelectedItem(item)}
              >
                <div className="product-image">
                   <div className="image-placeholder">
                      <Gem size={40} color="rgba(212,175,55,0.2)" />
                   </div>
                   <div className="product-badge">NEW ARRIVAL</div>
                   <button 
                     className="tryon-badge-btn"
                     onClick={(e) => { e.stopPropagation(); setTryOnItem(item); }}
                   >
                     <Camera size={14} /> Virtual Try-On
                   </button>
                </div>
                <div className="product-info">
                   <div className="p-header">
                      <h3>{item.product_name}</h3>
                      <span className="p-tag">{item.tag_no}</span>
                   </div>
                   <div className="p-details">
                      <span>{item.category_name}</span>
                      <span>{item.net_weight}g / {item.purity_info}</span>
                   </div>
                   <div className="p-footer">
                      <span className="price-on-req">Enquire for Price</span>
                      <ChevronRight size={18} color="#D4AF37" />
                   </div>
                </div>
              </motion.div>
            ))}
         </div>
      </main>

      <footer className="showroom-footer">
         <div className="footer-content">
            <div className="store-info">
                <h3>Our Showroom</h3>
                <p><MapPin size={16} /> MG Road Central, Bangalore, India</p>
                <p><Phone size={16} /> +91 999 999 9999</p>
            </div>
            <div className="footer-branding">
               <Gem size={20} color="#D4AF37" />
               <span>© 2026 Agni Jewellery Lifestyle</span>
            </div>
         </div>
      </footer>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
             <motion.div 
               layoutId={selectedItem.tag_no}
               className="product-modal"
               onClick={e => e.stopPropagation()}
             >
                <button className="modal-close" onClick={() => setSelectedItem(null)}><X /></button>
                <div className="modal-grid">
                   <div className="modal-visual">
                      <div className="visual-placeholder">
                         <div className="big-gem"><Gem size={80} color="#D4AF37" /></div>
                         <div className="authenticity-check">
                            <ShieldCheck size={18} color="#22c55e" />
                            <span>100% BIS Hallmarked</span>
                         </div>
                      </div>
                   </div>
                   <div className="modal-meta">
                      <div className="meta-breadcrumb">{selectedItem.category_name} <span>/</span> {selectedItem.tag_no}</div>
                      <h2>{selectedItem.product_name}</h2>
                      <div className="meta-specs">
                         <div className="spec-item"><strong>Metal Purity</strong> <span>{selectedItem.purity_info}</span></div>
                         <div className="spec-item"><strong>Net Weight</strong> <span>{selectedItem.net_weight}g</span></div>
                         <div className="spec-item"><strong>Availability</strong> <span className="in-stock">In-Store</span></div>
                      </div>
                      
                      <div className="enquiry-actions">
                         <button className="wa-btn" onClick={() => handleWhatsAppEnquiry(selectedItem)}>
                            <MessageCircle size={20} /> Enquire on WhatsApp
                         </button>
                         <button 
                           className="book-btn"
                           onClick={() => setTryOnItem(selectedItem)}
                         >
                           <Camera size={18} /> Virtual Try-On
                         </button>
                      </div>
                      
                      <p className="price-notice">Prices for our exclusive collections are calculated based on live gold rates at the time of purchase in-store.</p>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Virtual Try-On Layer */}
      {tryOnItem && (
         <VirtualTryOn 
           product={tryOnItem} 
           onClose={() => setTryOnItem(null)} 
         />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        
        .showroom-page { background: #080808; color: #fff; font-family: 'Outfit', sans-serif; min-height: 100vh; overflow-x: hidden; }
        .showroom-nav { height: 80px; border-bottom: 1px solid rgba(212,175,55,0.1); position: sticky; top: 0; background: rgba(8,8,8,0.95); backdrop-filter: blur(20px); z-index: 1000; }
        .nav-content { max-width: 1200px; margin: 0 auto; height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; }
        .luxury-logo { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: 4px; font-size: 1.2rem; }
        .nav-links { display: flex; gap: 3rem; }
        .nav-links a { text-decoration: none; color: #888; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; transition: 0.3s; }
        .nav-links a:hover { color: #D4AF37; }

        .showroom-hero { height: 400px; display: flex; align-items: center; justify-content: center; text-align: center; background: radial-gradient(circle at center, #1a1a1a 0%, #080808 100%); position: relative; }
        .hero-content h1 { font-family: 'Playfair Display', serif; font-size: 4rem; margin-bottom: 1rem; color: #D4AF37; }
        .hero-content p { color: #888; font-size: 1.1rem; letter-spacing: 1px; }

        .showroom-main { max-width: 1200px; margin: 0 auto; padding: 4rem 2rem; }
        .filter-bar { margin-bottom: 4rem; display: flex; flex-direction: column; gap: 2rem; align-items: center; }
        .search-wrap { background: #111; border: 1px solid rgba(255,255,255,0.05); padding: 0.75rem 2rem; border-radius: 40px; display: flex; align-items: center; gap: 15px; width: 100%; max-width: 500px; transition: 0.3s; }
        .search-wrap:focus-within { border-color: #D4AF37; box-shadow: 0 0 20px rgba(212,175,55,0.1); }
        .search-wrap input { background: none; border: none; color: white; width: 100%; font-family: inherit; font-size: 1rem; }
        .search-wrap input:focus { outline: none; }
        .category-scroll { display: flex; gap: 1rem; overflow-x: auto; padding: 10px; width: 100%; justify-content: center; }
        .cat-btn { background: none; border: 1px solid rgba(212,175,55,0.1); color: #888; padding: 0.6rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: 0.3s; }
        .cat-btn.active { background: #D4AF37; color: #000; border-color: #D4AF37; }

        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 3rem; }
        .product-card { background: #111; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.03); transition: 0.4s; cursor: pointer; }
        .product-card:hover { transform: translateY(-10px); border-color: rgba(212,175,55,0.2); }
        .product-image { height: 320px; background: #0f0f0f; position: relative; display: flex; align-items: center; justify-content: center; }
        .image-placeholder { opacity: 0.5; }
        .product-badge { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.8); border: 1px solid rgba(212,175,55,0.2); color: #D4AF37; padding: 4px 12px; border-radius: 40px; font-size: 0.65rem; font-weight: 800; letter-spacing: 1px; }
        
        .tryon-badge-btn { 
          position: absolute; 
          bottom: 20px; 
          left: 50%; 
          transform: translateX(-50%); 
          background: #D4AF37; 
          color: #000; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 40px; 
          font-weight: 800; 
          font-size: 0.7rem; 
          display: flex; 
          align-items: center; 
          gap: 8px;
          opacity: 0;
          transition: 0.3s;
          box-shadow: 0 4px 15px rgba(212,175,55,0.3);
        }
        .product-card:hover .tryon-badge-btn { opacity: 1; bottom: 30px; }

        .product-info { padding: 1.5rem; }
        .p-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
        .p-header h3 { font-size: 1.1rem; color: #fff; margin: 0; }
        .p-tag { font-size: 0.65rem; color: #555; font-weight: 800; }
        .p-details { display: flex; justify-content: space-between; font-size: 0.8rem; color: #777; margin-bottom: 1.5rem; font-weight: 600; }
        .p-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.03); pt: 1rem; }
        .price-on-req { color: #D4AF37; font-weight: 800; font-size: 0.85rem; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .product-modal { background: #0a0a0a; border: 1px solid rgba(212,175,55,0.2); border-radius: 32px; width: 100%; max-width: 900px; position: relative; overflow: hidden; }
        .modal-close { position: absolute; top: 25px; right: 25px; background: none; border: none; color: #fff; cursor: pointer; z-index: 10; }
        .modal-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .modal-visual { background: #0f0f0f; height: 500px; display: flex; align-items: center; justify-content: center; }
        .authenticity-check { margin-top: 2rem; display: flex; align-items: center; gap: 10px; font-size: 0.75rem; color: #888; background: rgba(0,0,0,0.4); padding: 8px 16px; border-radius: 30px; }
        .modal-meta { padding: 4rem 3rem; }
        .meta-breadcrumb { font-size: 0.7rem; font-weight: 800; color: #D4AF37; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem; }
        .meta-breadcrumb span { opacity: 0.3; mx: 8px; }
        .modal-meta h2 { font-family: 'Playfair Display', serif; font-size: 2.5rem; margin-bottom: 2rem; color: #fff; }
        .meta-specs { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 3rem; }
        .spec-item { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; }
        .spec-item strong { font-size: 0.85rem; color: #555; text-transform: uppercase; letter-spacing: 1px; }
        .spec-item span { font-weight: 700; color: #eee; }
        .in-stock { color: #22c55e !important; }
        
        .enquiry-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
        .wa-btn { background: #22c55e; color: #fff; border: none; padding: 1rem; border-radius: 12px; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; }
        .book-btn { background: transparent; color: #D4AF37; border: 1px solid #D4AF37; padding: 1rem; border-radius: 12px; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; }
        .price-notice { font-size: 0.7rem; color: #444; font-style: italic; line-height: 1.6; }

        .showroom-footer { border-top: 1px solid rgba(255,255,255,0.03); padding: 6rem 2rem 4rem; }
        .footer-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-end; }
        .store-info h3 { font-family: 'Playfair Display', serif; color: #D4AF37; font-size: 1.8rem; margin-bottom: 1.5rem; }
        .store-info p { color: #666; font-size: 0.9rem; display: flex; align-items: center; gap: 10px; margin-bottom: 0.75rem; }
        .footer-branding { display: flex; align-items: center; gap: 10px; font-size: 0.75rem; color: #333; font-weight: 800; letter-spacing: 2px; }

        .showroom-loading { height: 100vh; background: #080808; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; }
        .showroom-loading h2 { color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 2rem; letter-spacing: 2px; }
        
        @media (max-width: 768px) {
           .modal-grid { grid-template-columns: 1fr; }
           .modal-visual { height: 300px; }
           .modal-meta { padding: 2rem; }
           .hero-content h1 { font-size: 2.5rem; }
           .footer-content { flex-direction: column; align-items: flex-start; gap: 4rem; }
           .nav-links { display: none; }
        }
      `}</style>
    </div>
  );
};

export default PublicShowroom;
