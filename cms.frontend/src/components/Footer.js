// Footer.js
import React from 'react';
import '../styles/Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: '📘', url: '#', label: 'Facebook' },
    { icon: '📷', url: '#', label: 'Instagram' },
    { icon: '🐦', url: '#', label: 'Twitter' },
    { icon: '💼', url: '#', label: 'LinkedIn' },
  ];

  const paymentIcons = ['💳', '🏦', '📱', '🪙'];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <a href="/" className="footer-logo">
              <span className="footer-logo-icon">🛍️</span>
              <span className="footer-logo-text">CMS Pro</span>
            </a>
            <p className="footer-description">
              Hệ thống quản trị nội dung và bán hàng công nghệ hiện đại. 
              Giải pháp toàn diện cho doanh nghiệp của bạn.
            </p>
            <div className="footer-social">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  className="social-link"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="footer-title">Liên kết nhanh</h4>
            <ul className="link-list">
              <li><a href="/" className="footer-link">Trang chủ</a></li>
              <li><a href="/posts" className="footer-link">Bài viết</a></li>
              <li><a href="/products" className="footer-link">Sản phẩm</a></li>
              <li><a href="/about" className="footer-link">Giới thiệu</a></li>
              <li><a href="/contact" className="footer-link">Liên hệ</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="footer-title">Thông tin liên hệ</h4>
            <div className="footer-contact-item">
              <span className="contact-icon">📧</span>
              <a href="mailto:2123110209@student.edu.vn">
                2123110209@student.edu.vn
              </a>
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon">👨‍🎓</span>
              <span>Sinh viên: Trương Quốc Đạt</span>
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon">📍</span>
              <span>TP. Hồ Chí Minh, Việt Nam</span>
            </div>
            <div className="footer-newsletter">
              <p className="newsletter-text">
                📧 Đăng ký nhận tin để cập nhật thông tin mới nhất!
              </p>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="newsletter-input"
                />
                <button className="newsletter-btn">Đăng ký</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              © {currentYear} CMS Project - Trương Quốc Đạt. 
              All rights reserved.
            </div>
            <div className="footer-legal">
              <a href="/privacy">Chính sách bảo mật</a>
              <a href="/terms">Điều khoản sử dụng</a>
              <a href="/cookies">Cookie</a>
            </div>
            <div className="footer-payment">
              {paymentIcons.map((icon, idx) => (
                <span key={idx} className="payment-icon" title="Phương thức thanh toán">
                  {icon}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}