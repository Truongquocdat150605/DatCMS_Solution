import React from 'react';
import '../../styles/HomePage.css'; // Tận dụng style có sẵn của HomePage

export default function ContactPage() {
  return (
    <div className="home-container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <div className="content-wrapper">
        <section className="premium-section">
          <div className="section-header center">
            <span className="section-badge tech">📞 LIÊN HỆ</span>
            <h2 className="section-title">Kết Nối Với Chúng Tôi</h2>
            <div className="section-subtitle">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginTop: '40px' }}>
            <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg-secondary)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '20px' }}>Thông Tin Liên Hệ</h3>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5' }}>
                <li>📍 <strong>Địa chỉ:</strong> 123 Đường Công Nghệ, Quận 1, TP.HCM</li>
                <li>📞 <strong>Điện thoại:</strong> 1900 1234</li>
                <li>📧 <strong>Email:</strong> hotro@cmspro.vn</li>
                <li>⏰ <strong>Giờ làm việc:</strong> 8:00 - 22:00 (Tất cả các ngày)</li>
              </ul>
            </div>
            
            <div style={{ flex: '1 1 400px', backgroundColor: 'var(--bg-secondary)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '20px' }}>Gửi Tin Nhắn</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.'); }}>
                <input type="text" placeholder="Họ và tên" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                <input type="email" placeholder="Email của bạn" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                <textarea placeholder="Nội dung tin nhắn" rows="4" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}></textarea>
                <button type="submit" className="view-all-btn">Gửi Liên Hệ</button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
