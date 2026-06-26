import React from 'react';

const PremiumPolicy = () => {
  return (
    <section className="premium-policy">
      <div className="policy-grid">
        <div className="premium-policy-card">
          <div className="pp-icon">🚀</div>
          <h4>Giao Tốc Hành 2H</h4>
          <p>Nội thành TP.HCM</p>
        </div>
        <div className="premium-policy-card">
          <div className="pp-icon">🛡️</div>
          <h4>Bảo Hành Tận Nơi</h4>
          <p>Hỗ trợ trong 24h</p>
        </div>
        <div className="premium-policy-card">
          <div className="pp-icon">💎</div>
          <h4>Cam Kết 100% Mới</h4>
          <p>Nguyên seal chính hãng</p>
        </div>
        <div className="premium-policy-card">
          <div className="pp-icon">💳</div>
          <h4>Trả Góp 0%</h4>
          <p>Thủ tục siêu nhanh</p>
        </div>
      </div>
    </section>
  );
};

export default PremiumPolicy;
