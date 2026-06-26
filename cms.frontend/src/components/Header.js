import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import categoryApi from '../core_modules/api/categoryApi';
import postApi from '../core_modules/api/postApi';
import { useCart } from '../core_modules/contexts/CartContext';

import '../styles/Header.css';

export default function Header({ username, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [productCategories, setProductCategories] = useState([]);
  const [postCategories, setPostCategories] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart(); // Lấy số lượng từ Context API thay vì localStorage

  // Lấy danh mục SP và Bài viết
  useEffect(() => {
    categoryApi.getAll()
      .then(res => setProductCategories(Array.isArray(res) ? res : res.data || []))
      .catch(err => console.error("Lỗi lấy danh mục SP:", err));

    postApi.getCategories()
      .then(res => setPostCategories(Array.isArray(res) ? res : res.data || []))
      .catch(err => console.error("Lỗi lấy danh mục Bài viết:", err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      {/* Tầng 1: Top Bar (Tài khoản / Hotline) */}
      <div className="header-tier-1">
        <div className="header-container tier-1-content">
          <div className="tier-1-left">
            <span>☎ Hotline: 1900 1234</span>
            <span className="divider">|</span>
            <span>✉ Email: support@techstore.com</span>
          </div>
          <div className="tier-1-right">
            {username ? (
              <div className="user-menu-simple">
                <span>Xin chào, <strong>{username}</strong></span>
                <Link to="/profile">Hồ sơ</Link>
                <Link to="/orders">Đơn hàng</Link>
                <button onClick={onLogout} className="btn-logout-text">Đăng xuất</button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login">Đăng nhập</Link>
                <span className="divider">/</span>
                <Link to="/register">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tầng 2: Middle Bar (Logo, Tìm kiếm, Giỏ hàng) */}
      <div className="header-tier-2">
        <div className="header-container tier-2-content">
          <Link to="/" className="logo">
            <span className="logo-text">TECHSTORE</span>
          </Link>

          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">Tìm kiếm</button>
          </form>

          <button className="cart-btn" onClick={() => navigate('/cart')}>
            Giỏ hàng
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </div>

      {/* Tầng 3: Bottom Bar (Menu chuyển trang chính) */}
      <div className="header-tier-3">
        <div className="header-container tier-3-content">
          <nav className="main-nav">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Trang chủ</Link>
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>Giới thiệu</Link>
            
            <div className="nav-dropdown">
              <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
                Sản phẩm ▾
              </Link>
              <div className="dropdown-menu">
                {productCategories.map(cat => (
                  <Link key={cat.id} to={`/products?categoryId=${cat.id}`} className="dropdown-item">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="nav-dropdown">
              <Link to="/posts" className={`nav-link ${isActive('/posts') ? 'active' : ''}`}>
                Bài viết ▾
              </Link>
              <div className="dropdown-menu">
                {postCategories.map(cat => (
                  <Link key={cat.id} to={`/posts?categoryId=${cat.id}`} className="dropdown-item">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>Liên hệ</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}