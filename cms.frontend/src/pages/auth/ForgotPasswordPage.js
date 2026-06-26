import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../core_modules/api/authApi';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }

    setSendingOtp(true);
    try {
      await authApi.sendOtp(email);
      setOtpSent(true);
      setSuccess('Đã gửi mã OTP đến email của bạn.');
    } catch (err) {
      setError(err.message || 'Không gửi được OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpSent) {
      setError('Vui lòng gửi OTP trước.');
      return;
    }

    if (!otp.trim() || !newPassword.trim()) {
      setError('Vui lòng nhập OTP và mật khẩu mới.');
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

    setResetting(true);
    try {
      await authApi.resetPassword(email, otp, newPassword);
      setSuccess('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '48px auto', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 18px 60px rgba(15, 23, 42, 0.12)' }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Quên mật khẩu</h2>
        <p style={{ marginTop: 0, marginBottom: 24, color: '#64748b' }}>
          Dành cho khách hàng, xác thực bằng OTP qua email.
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

        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Email</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #cbd5e1' }}
                placeholder="name@email.com"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: 10,
                  background: sendingOtp ? '#94a3b8' : '#0f766e',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: sendingOtp ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {sendingOtp ? 'Đang gửi...' : 'Gửi OTP'}
              </button>
            </div>
          </div>

          <form onSubmit={handleReset}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Mã OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1' }}
                placeholder="Nhập mã OTP"
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
              disabled={resetting}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderRadius: 10,
                background: resetting ? '#94a3b8' : '#2563eb',
                color: '#fff',
                fontWeight: 700,
                cursor: resetting ? 'not-allowed' : 'pointer',
              }}
            >
              {resetting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ border: 'none', background: 'transparent', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
          >
            Quay về đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
