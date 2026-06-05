// pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../services/api/authApi';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(username, password);

      if (response && response.user) {
        const { fullName, role } = response.user;

        // Lưu thông tin user (cho React user pages) - KHÔNG lưu token nữa
        localStorage.setItem('username', username);
        localStorage.setItem('fullName', fullName || '');
        localStorage.setItem('role', role || 'User');

        if (onLoginSuccess) {
          await onLoginSuccess();
        }

        // Theo redirectUrl server trả về
        const redirectUrl = response.redirectUrl || '/';

        // Nếu redirectUrl là đường dẫn MVC admin (cùng origin backend), dùng window.location
        // Còn nếu là "/" thì điều hướng React
        if (redirectUrl.startsWith('/Home') || redirectUrl.startsWith('/Account')) {
          // chạy trên React SPA -> cần full URL backend
          const ADMIN_BASE_URL = 'https://localhost:7048';
          window.location.href = `${ADMIN_BASE_URL}${redirectUrl}`;
        } else {
          navigate(redirectUrl === '/' ? '/' : redirectUrl);
        }
      } else {
        setError('Đăng nhập thất bại: Server trả về dữ liệu không hợp lệ');
      }
    } catch (err) {
      setError(err.message || 'Sai tên đăng nhập hoặc mật khẩu');
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
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Đăng nhập CMS Pro</h2>

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
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Tên đăng nhập</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          }}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
