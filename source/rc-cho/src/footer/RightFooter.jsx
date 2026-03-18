import React from 'react';
import { Play } from 'lucide-react';
import './RightFooter.css';

const RightFooter = ({ onCtaClick }) => {
  return (
    <div className="RightFooter">
      <span className="cta-badge">DEMO</span>
      <h3 className="cta-title">FloWeNect</h3>
     
      <button className="cta-icon-button" onClick={onCtaClick}>
        <div className="run-icon-box">
          <Play size={32} fill="currentColor" strokeWidth={2.5} />
          <span className="run-text">RUN</span>
        </div>
        <div className="glow-layer"></div>
      </button>

      <div className="right-footer-bottom">
        <span className="copyright">© 2026 FloWeNect. All rights reserved.</span>
      </div>
    </div>
  );
};

export default RightFooter;