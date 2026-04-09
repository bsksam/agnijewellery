import React from 'react';
import Barcode from 'react-barcode';

interface TagLabelProps {
  tag: any;
  shopName?: string;
}

const TagLabel: React.FC<TagLabelProps> = ({ tag, shopName = "AGNI" }) => {
  return (
    <div className="tag-label-print-area">
      <div className="label-container">
        {/* Left Flap / Top Side */}
        <div className="label-side label-left">
          <div className="shop-name-small">{shopName}</div>
          <div className="tag-id-large">{tag.tag_no}</div>
          <div className="tag-details-mini">
            <span>NW: {tag.net_weight}g</span>
            {tag.stone_value > 0 && <span> | ST: ₹{tag.stone_value}</span>}
          </div>
        </div>

        {/* Right Flap / Barcode Side */}
        <div className="label-side label-right">
          <Barcode 
            value={tag.tag_no} 
            width={1.2} 
            height={30} 
            fontSize={0} 
            margin={0}
            background="transparent"
            lineColor="#000"
          />
          <div className="huid-small">{tag.huid1 || 'NO HUID'}</div>
          {tag.hallmark_charges > 0 && <div className="hm-small">HM: ₹{tag.hallmark_charges}</div>}
        </div>
      </div>

      <style>{`
        .tag-label-print-area {
          background: white;
          color: black;
          padding: 0;
          margin: 0;
          font-family: 'Inter', sans-serif;
          width: 320px; /* Approximate for screen preview */
        }
        .label-container {
          display: flex;
          border: 1px dashed #ccc;
          width: 100%;
          background: #fff;
        }
        .label-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4px;
          height: 80px; /* Adjust based on physical label height */
          overflow: hidden;
        }
        .label-left { border-right: 1px dotted #eee; }
        
        .shop-name-small { font-size: 8px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
        .tag-id-large { font-size: 14px; font-weight: 900; letter-spacing: -0.5px; }
        .tag-details-mini { font-size: 8px; margin-top: 2px; color: #333; }
        
        .huid-small { font-size: 7px; font-weight: bold; margin-top: 2px; }
        .hm-small { font-size: 7px; color: #444; }

        @media print {
          body * { visibility: hidden; }
          .tag-label-print-area, .tag-label-print-area * { visibility: visible; }
          .tag-label-print-area { 
            position: absolute; left: 0; top: 0; 
            width: 50mm; height: 12mm; /* Standard Jewelry Tag Size */
          }
          .label-container { border: none; height: 100%; }
          .label-side { height: 100%; padding: 2px; }
          @page { size: 50mm 12mm; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default TagLabel;
