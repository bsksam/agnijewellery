import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Award, MapPin, Smartphone, CircleDollarSign } from 'lucide-react';

const CertificateTemplate = ({ item, billNo }: { item: any, billNo: string }) => {
  // Public verification URL
  const verifyUrl = `${window.location.origin}/verify/${item.tag_no}`;

  return (
    <div className="certificate-print-container">
       <div className="cert-border-outer">
          <div className="cert-border-inner">
             
             {/* Header */}
             <div className="cert-header">
                <div className="cert-logo">
                   <CircleDollarSign size={40} color="#D4AF37" />
                </div>
                <div className="cert-title">
                   <h1>CERTIFICATE OF AUTHENTICITY</h1>
                   <p>Official Guarantee of Purity & Quality</p>
                </div>
             </div>

             {/* Content */}
             <div className="cert-body">
                <div className="cert-item-info">
                   <div className="info-group">
                      <span className="info-label">Product Name</span>
                      <span className="info-value">{item.product_name}</span>
                   </div>
                   <div className="info-group">
                      <span className="info-label">Tag Serial No.</span>
                      <span className="info-value">{item.tag_no}</span>
                   </div>
                   <div className="info-group">
                      <span className="info-label">Gold Purity / HUID</span>
                      <span className="info-value">{item.huid1}</span>
                   </div>
                   <div className="info-group">
                      <span className="info-label">Net Weight</span>
                      <span className="info-value">{item.net_weight} grams</span>
                   </div>
                   <div className="info-group">
                      <span className="info-label">Invoiced to Bill</span>
                      <span className="info-value">#{billNo}</span>
                   </div>
                </div>

                <div className="cert-right-content">
                   <div className="qr-box">
                      <QRCodeSVG value={verifyUrl} size={100} />
                      <p>Scan to Verify Authenticity</p>
                   </div>
                   <div className="seal-box">
                      <ShieldCheck size={80} color="rgba(212, 175, 55, 0.1)" style={{ position: 'absolute' }} />
                      <div className="seal-text">Official Shop Seal</div>
                   </div>
                </div>
             </div>

             {/* Footer */}
             <div className="cert-footer">
                <div className="guarantee-text">
                   <Award size={20} color="#D4AF37" />
                   <p>Agni Jewellery hereby certifies that the aforementioned item conforms to the highest standards of craftsmanship and purity.</p>
                </div>
                <div className="signature-area">
                   <div className="sig-line"></div>
                   <p>Authorized Representative</p>
                </div>
             </div>

             <div className="shop-details">
                <p><MapPin size={10} /> Main Bazaar, Bangalore | <Smartphone size={10} /> +91 99000-00000</p>
             </div>

          </div>
       </div>

       <style>{`
          .certificate-print-container { width: 210mm; height: 148mm; padding: 10mm; background: white; color: #1a1a1a; font-family: 'Outfit', sans-serif; position: relative; }
          .cert-border-outer { border: 4px double #D4AF37; height: 100%; padding: 2mm; }
          .cert-border-inner { border: 1px solid #D4AF37; height: 100%; padding: 8mm; display: flex; flex-direction: column; }
          
          .cert-header { display: flex; align-items: center; gap: 20px; border-bottom: 2px solid #D4AF3733; padding-bottom: 5mm; margin-bottom: 8mm; }
          .cert-title h1 { font-size: 1.8rem; letter-spacing: 3px; font-weight: 300; margin: 0; color: #a1841a; }
          .cert-title p { font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 2px; margin: 2px 0 0 0; }

          .cert-body { flex: 1; display: flex; justify-content: space-between; }
          .cert-item-info { display: flex; flex-direction: column; gap: 15px; flex: 1; }
          .info-group { display: flex; flex-direction: column; gap: 4px; }
          .info-label { font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
          .info-value { font-size: 1.1rem; font-weight: 600; color: #333; }

          .cert-right-content { display: flex; flex-direction: column; align-items: center; gap: 2rem; width: 150px; }
          .qr-box { text-align: center; }
          .qr-box p { font-size: 0.6rem; margin-top: 8px; font-weight: 700; color: #888; }
          .seal-box { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
          .seal-text { font-size: 0.5rem; text-transform: uppercase; text-align: center; color: #D4AF37; font-weight: 800; }

          .cert-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 5mm; }
          .guarantee-text { max-width: 60%; display: flex; gap: 12px; align-items: flex-start; }
          .guarantee-text p { font-size: 0.75rem; font-style: italic; color: #666; margin: 0; line-height: 1.4; }
          
          .signature-area { text-align: center; width: 140px; }
          .sig-line { width: 100%; height: 1px; background: #D4AF37; margin-bottom: 8px; }
          .signature-area p { font-size: 0.7rem; color: #888; font-weight: 700; }

          .shop-details { position: absolute; bottom: 15mm; left: 50%; transform: translateX(-50%); text-align: center; width: 100%; }
          .shop-details p { font-size: 0.6rem; color: #BBB; display: flex; align-items: center; justify-content: center; gap: 8px; }

          @media print {
            body * { visibility: hidden; }
            .certificate-print-container, .certificate-print-container * { visibility: visible; }
            .certificate-print-container { position: absolute; left: 0; top: 0; width: 210mm; height: 148mm; }
          }
       `}</style>
    </div>
  );
};

export default CertificateTemplate;
