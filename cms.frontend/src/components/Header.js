// Header.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Header.css';

export default function Header({ username, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0); // 👈 THÊM state này
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // Lấy số lượng giỏ hàng từ localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        const cartItems = JSON.parse(cart);
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemCount(totalItems);
      } else {
        setCartItemCount(0);
      }
    };
    
    updateCartCount();
    
    // Lắng nghe sự kiện thay đổi giỏ hàng (nếu có)
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-area">
          <Link to="/" className="logo">
            <span className="logo-icon">🛍️</span>
            <span className="logo-text">CMS Pro</span>
            <span className="logo-badge">Beta</span>
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Tìm kiếm">
            🔍
          </button>
        </form>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Trang chủ</Link>
          <Link to="/posts" className={`nav-link ${isActive('/posts') ? 'active' : ''}`}>Bài viết</Link>
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>Sản phẩm</Link>
        </nav>

        {/* Cart Button */}
        <button className="cart-btn" onClick={() => navigate('/cart')}>
          🛒
          {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
        </button>

        {/* User Area */}
        <div className="user-area">
          {username ? (
            <div className="user-dropdown-container" ref={userMenuRef}>
              <div className="user-trigger" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
                <div className="user-info-text">
                  <span className="user-name">{username}</span>
                  <span className="user-role">Thành viên</span>
                </div>
                <span className={`dropdown-arrow ${isUserMenuOpen ? 'open' : ''}`}>▼</span>
              </div>

              {isUserMenuOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-welcome">Xin chào, {username}!</div>
                    <div className="dropdown-sub">Quản lý tài khoản</div>
                  </div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <span className="item-icon">👤</span> Hồ sơ cá nhân
                  </Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <span className="item-icon">📦</span> Lịch sử đơn hàng
                  </Link>
                  <Link to="/change-password" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <span className="item-icon">🔒</span> Đổi mật khẩu
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={onLogout} className="dropdown-item logout-item">
                    <span className="item-icon">🚪</span> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="guest-info">
              <span className="guest-text">Chưa đăng nhập</span>
              <button onClick={() => navigate('/login')} className="login-btn">Đăng nhập</button>
              <button onClick={() => navigate('/register')} className="register-btn">Đăng ký</button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            <span className="mobile-link-icon">🏠</span> Trang chủ
          </Link>
          <Link to="/posts" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            <span className="mobile-link-icon">📝</span> Bài viết
          </Link>
          <Link to="/products" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            <span className="mobile-link-icon">📦</span> Sản phẩm
          </Link>
          <div className="mobile-link" onClick={() => { setIsMenuOpen(false); navigate('/cart'); }}>
            <span className="mobile-link-icon">🛒</span> Giỏ hàng ({cartItemCount})
          </div>
          {!username && (
            <>
              <div className="mobile-link" onClick={() => { setIsMenuOpen(false); navigate('/login'); }}>
                <span className="mobile-link-icon">🔑</span> Đăng nhập
              </div>
              <div className="mobile-link" onClick={() => { setIsMenuOpen(false); navigate('/register'); }}>
                <span className="mobile-link-icon">📝</span> Đăng ký
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}