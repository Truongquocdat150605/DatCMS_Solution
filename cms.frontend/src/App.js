// App.js
import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/home/HomePage';
import PostListPage from './pages/posts/PostListPage';
import PostDetailPage from './pages/posts/PostDetailPage';
import ProductListPage from './pages/shop/ProductListPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import PaymentSuccessPage from './pages/checkout/PaymentSuccessPage';
import PaymentCancelPage from './pages/checkout/PaymentCancelPage';
import OrdersPage from './pages/profile/OrdersPage';
import ContactPage from './pages/info/ContactPage';
import AboutPage from './pages/info/AboutPage';
// KHÔNG import LoginRedirect nữa
import ChatBot from './components/ChatBot';

import { authApi } from './core_modules/api/authApi';
import { CartProvider } from './core_modules/contexts/CartContext';

const AUTH_STORAGE_KEYS = ['username', 'fullName', 'email', 'customerId', 'role', 'token', 'user'];

const clearAuthStorage = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

function App() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      // Frontend khách hàng lưu thông tin trong localStorage.
      // Admin/Editor vẫn dùng Cookie Auth nên sẽ fallback sang /api/Auth/me.
      const savedRole = localStorage.getItem('role');
      const savedFullName = localStorage.getItem('fullName');
      const savedEmail = localStorage.getItem('email');
      const savedUsername = localStorage.getItem('username');

      if (savedRole === 'Customer') {
        setUsername(savedFullName || savedEmail || savedUsername || '');
      } else if (savedUsername || savedFullName || savedEmail) {
        setUsername(savedUsername || savedFullName || savedEmail || '');
      } else {
        // Thử lấy me() nếu lỡ là admin đăng nhập.
        try {
          const me = await authApi.me();
          if (me && me.username) {
            setUsername(me.username);
            localStorage.setItem('username', me.username);
          }
        } catch (e) {
          setUsername('');
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const handleLogout = async (redirectPath = '/') => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthStorage();
      setUsername('');
      window.location.href = redirectPath;
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60 }}>Đang tải...</div>;
  }

  return (
    <CartProvider>
      <BrowserRouter>
        <MainLayout username={username} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<ProfilePage onLogout={handleLogout} />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={loadMe} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/cart" element={<CartPage />} />
            {/* Protected Route cho Checkout */}
            <Route path="/checkout" element={username ? <CheckoutPage /> : <Navigate to="/login" />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-cancel" element={<PaymentCancelPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainLayout>
        <ChatBot />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
