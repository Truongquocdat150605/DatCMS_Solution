import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../core_modules/api/authApi';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Backend yêu cầu body: { FullName, Email, Password, Phone, Address }
      const payload = {
        FullName: formData.fullName,
        Email: formData.email,
        Password: formData.password,
        Phone: formData.phone,
        Address: formData.address,
      };

      const response = await authApi.customerRegister(payload);

      if (response && response.success) {
        setSuccess('🎉 Đăng ký thành công! Đang chuyển hướng đến trang Đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Đăng ký thất bại: Server trả về dữ liệu không hợp lệ');
      }
    } catch (err) {
      setError(err.message || 'Lỗi đăng ký. Email này có thể đã được sử dụng.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div
      style={{
        maxWidth: '450px',
        margin: '50px auto',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        background: 'white',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Đăng ký Tài khoản</h2>
      <p style={{ textAlign: 'center', marginBottom: '24px', fontSize: '14px', color: '#64748b' }}>
        Trở thành khách hàng của CMS Pro ngay hôm nay
      </p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '16px', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '6px', marginBottom: '16px', textAlign: 'center' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Họ và tên *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            placeholder="Ví dụ: Nguyễn Văn A"
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            placeholder="Ví dụ: email@gmail.com"
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mật khẩu *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            placeholder="Ví dụ: 0901234567"
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Địa chỉ</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            placeholder="Ví dụ: Quận 1, TP.HCM"
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
            fontWeight: '600'
          }}
        >
          {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <span style={{ color: '#64748b' }}>Đã có tài khoản? </span>
        <button
          onClick={() => navigate('/login')}
          style={{ border: 'none', background: 'transparent', color: '#2563eb', cursor: 'pointer', fontWeight: 600, padding: 0 }}
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
