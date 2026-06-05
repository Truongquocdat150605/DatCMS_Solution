// App.js
import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';  // 👈 Import LoginPage
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

// KHÔNG import LoginRedirect nữa

import { authApi } from './services/api/authApi';

function App() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const me = await authApi.me();
      console.log('me() response', me);
      
      if (me && me.username && me.username.trim() !== '') {
        setUsername(me.username);
        localStorage.setItem('username', me.username);
        if (me.fullName) localStorage.setItem('fullName', me.fullName);
        if (me.role) localStorage.setItem('role', me.role);
      } else {
        // Fallback từ localStorage
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
          setUsername(savedUsername);
        } else {
          setUsername('');
        }
      }
    } catch (e) {
      console.error("Lỗi lấy thông tin user:", e);
      const savedUsername = localStorage.getItem('username');
      if (savedUsername) setUsername(savedUsername);
      else setUsername('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('username');
      localStorage.removeItem('fullName');
      localStorage.removeItem('role');
      setUsername('');
      window.location.href = '/';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60 }}>Đang tải...</div>;
  }

  return (
    <BrowserRouter>
      <MainLayout username={username} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts" element={<PostListPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={loadMe} />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;