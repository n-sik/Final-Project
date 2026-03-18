import React from 'react';
import './LeftFooter.css';

const LeftFooter = () => {
  return (
    <div className="LeftFooter">
      <div className="brand-header">
        <div className="status-indicator">
          <span className="pulse-dot"></span>
          <span className="status-text">FloWeNect</span>
        </div>
        <div className="hero-wrap">
          <h2 className="hero-main-title">
            인재를 향한 <span className="connect-text">CONNECT</span> <br />
            <span className="highlight">새로운 관점</span>
          </h2>
        </div>
      </div>

      <div className="spec-master-card">
        <div className="card-content-wrapper">
          <div className="content-left">
            <div className="contact-group">
              <div className="contact-unit">
                <label>CALL</label>
                <p className="val">02. 1234. 5678</p>
              </div>
              <div className="contact-unit">
                <label>MAIL</label>
                <p className="val">contact@flowenect.com</p>
              </div>
              <div className="contact-unit">
                <label>LOCATION</label>
                <p className="val">대전광역시 중구 계룡로 846</p>
                <p className="sub-val">402호</p>
              </div>
            </div>
          </div>
          
          <div className="content-right">
            <div className="card-top">
              <p className="main-slosun">
                실제 운영에 최적화된<br />실용적 인사 플랫폼
              </p>
            </div>
            <div className="card-grid">
              <div className="grid-item"><span className="item-no">01</span><p className="item-txt">인사 체계 수립</p></div>
              <div className="grid-item"><span className="item-no">02</span><p className="item-txt">데이터 기반 운영</p></div>
              <div className="grid-item"><span className="item-no">03</span><p className="item-txt">업무 흐름 통합</p></div>
              <div className="grid-item"><span className="item-no">04</span><p className="item-txt">KPI 성과 관리</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftFooter;