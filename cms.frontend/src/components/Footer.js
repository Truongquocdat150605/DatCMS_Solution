// Footer.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryApi from '../core_modules/api/categoryApi';
import '../styles/Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: 'Fb', url: '#', label: 'Facebook' },
    { icon: 'Ig', url: '#', label: 'Instagram' },
    { icon: 'Tw', url: '#', label: 'Twitter' },
    { icon: 'Yt', url: '#', label: 'YouTube' },
  ];

  const paymentIcons = ['Visa', 'Mastercard', 'MoMo', 'VNPAY'];

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryApi.getCategories()
      .then(res => {
        const data = Array.isArray(res) ? res : (res?.data || []);
        // Lấy 5 danh mục đầu tiên để hiển thị ở footer
        setCategories(data.slice(0, 5));
      })
      .catch(err => console.error("Lỗi lấy danh mục ở Footer:", err));
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-text">TECHSTORE</span>
            </Link>
            <p className="footer-description">
              Hệ thống bán lẻ Laptop, PC Gaming, và linh kiện công nghệ hàng đầu. 
              Cam kết chính hãng 100%, giá tốt nhất thị trường.
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
            <h4 className="footer-title">Chính sách mua hàng</h4>
            <ul className="link-list">
              <li><Link to="/products" className="footer-link">Bảo hành 24 tháng</Link></li>
              <li><Link to="/products" className="footer-link">Hướng dẫn trả góp 0%</Link></li>
              <li><Link to="/products" className="footer-link">Chính sách giao hàng</Link></li>
              <li><Link to="/products" className="footer-link">Chính sách đổi trả 30 ngày</Link></li>
              <li><Link to="/products" className="footer-link">Bảo mật thông tin</Link></li>
            </ul>
          </div>
          
          {/* Categories Column */}
          <div>
            <h4 className="footer-title">Danh mục nổi bật</h4>
            <ul className="link-list">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/products?categoryId=${cat.id}`} className="footer-link">
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <>
                  <li><span className="footer-link" style={{ opacity: 0.6 }}>Đang tải danh mục...</span></li>
                  <li><span className="footer-link" style={{ visibility: 'hidden' }}>-</span></li>
                  <li><span className="footer-link" style={{ visibility: 'hidden' }}>-</span></li>
                  <li><span className="footer-link" style={{ visibility: 'hidden' }}>-</span></li>
                  <li><span className="footer-link" style={{ visibility: 'hidden' }}>-</span></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="footer-title">Hỗ trợ khách hàng</h4>
            <div className="footer-contact-item">
              <span className="contact-label">Hotline tư vấn:</span>
              <strong className="contact-highlight">1800.6969</strong>
            </div>
            <div className="footer-contact-item">
              <span className="contact-label">Hỗ trợ kỹ thuật:</span>
              <strong>1800.8888</strong>
            </div>
            <div className="footer-contact-item">
              <span className="contact-label">Email:</span>
              <a href="mailto:support@techstore.vn">support@techstore.vn</a>
            </div>
            <div className="footer-contact-item">
              <span className="contact-label">Địa chỉ:</span>
              <span>123 Đường Công Nghệ, Quận 1, TP. HCM</span>
            </div>
            <div className="footer-newsletter">
              <p className="newsletter-text">
                Đăng ký nhận mã giảm giá và tin khuyến mãi!
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
              © {currentYear} TechStore - Hệ thống bán lẻ công nghệ. 
              All rights reserved.
            </div>
            <div className="footer-legal">
              <Link to="/privacy">Chính sách bảo mật</Link>
              <Link to="/terms">Điều khoản sử dụng</Link>
              <Link to="/cookies">Cookie</Link>
            </div>
            <div className="footer-payment">
              {paymentIcons.map((icon, idx) => (
                <span key={idx} className="payment-text" title="Phương thức thanh toán">
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