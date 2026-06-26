// pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../core_modules/api/authApi';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState(''); // Chỉ dành cho Khách hàng
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Form trên Frontend chỉ phục vụ cho Khách Hàng (Customer)
      const response = await authApi.customerLogin(email, password);


      if (response && response.success) {
        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password);
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
        }

        localStorage.setItem('email', response.email || email);
        localStorage.setItem('fullName', response.fullName || 'Khách hàng');
        localStorage.setItem('customerId', response.customerId || '');
        localStorage.setItem('role', 'Customer');
        
        if (onLoginSuccess) await onLoginSuccess();
        navigate('/');
      } else {
        setError('Đăng nhập thất bại: Dữ liệu không hợp lệ');
      }
    } catch (err) {
      setError(err.message || 'Sai email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '50px auto',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        background: 'white',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Đăng nhập Khách hàng</h2>
      <p style={{ textAlign: 'center', marginBottom: '24px', fontSize: '14px', color: '#64748b' }}>
        Dành cho khách hàng mua sắm trên CMS Pro
      </p>

      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email đăng nhập</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
            }}
            placeholder="Ví dụ: khachhang@email.com"
            required
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="rememberMe" style={{ cursor: 'pointer', fontSize: '14px', color: '#334155', userSelect: 'none' }}>
            Lưu mật khẩu cho lần đăng nhập sau
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            fontWeight: '600'
          }}
        >
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#2563eb',
            cursor: 'pointer',
            padding: 0,
            fontWeight: 600,
          }}
        >
          Quên mật khẩu?
        </button>
        <button
          type="button"
          onClick={() => navigate('/change-password')}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#0f766e',
            cursor: 'pointer',
            padding: 0,
            fontWeight: 600,
          }}
        >
          Đổi mật khẩu
        </button>
      </div>


    </div>
  );
}
