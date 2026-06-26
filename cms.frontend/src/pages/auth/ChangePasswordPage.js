import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../core_modules/api/authApi';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('email') || '';
    const savedRole = localStorage.getItem('role');

    if (savedRole === 'Customer' && savedEmail) {
      setEmail(savedEmail);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Vui lòng đăng nhập lại để đổi mật khẩu.');
      return;
    }

    if (!currentPassword.trim() || !newPassword.trim()) {
      setError('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(email, currentPassword, newPassword);
      setSuccess('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      localStorage.removeItem('username');
      localStorage.removeItem('fullName');
      localStorage.removeItem('email');
      localStorage.removeItem('customerId');
      localStorage.removeItem('role');

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '48px auto', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 18px 60px rgba(15, 23, 42, 0.12)' }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Đổi mật khẩu</h2>
        <p style={{ marginTop: 0, marginBottom: 24, color: '#64748b' }}>
          Dành cho khách hàng đang đăng nhập trên website.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 10, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: 12, borderRadius: 10, marginBottom: 16 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Email</label>
            <input
              type="email"
              value={email}
              readOnly
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              borderRadius: 10,
              background: loading ? '#94a3b8' : '#2563eb',
              color: '#fff',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ border: 'none', background: 'transparent', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
