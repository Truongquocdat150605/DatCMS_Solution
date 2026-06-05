import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api/authApi';
import '../styles/ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        setLoading(true);
        const data = await authApi.me();
        if (mounted) {
          setUser(data);
          setEditForm({
            fullName: data?.fullName || '',
            email: data?.email || '',
            phone: data?.phone || '',
            address: data?.address || ''
          });
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Không thể tải thông tin');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadUser();
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = 'https://localhost:7048/Account/Logout';
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateSuccess('');
    setError('');
    
    try {
      const updated = await authApi.updateProfile(editForm);
      setUser({ ...user, ...updated });
      setIsEditing(false);
      setUpdateSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => setUpdateSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Chuyển đến trang đổi mật khẩu hoặc mở modal
    navigate('/change-password');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang tải thông tin...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-error">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Thử lại
        </button>
        <button className="back-button" onClick={() => navigate('/')}>
          ← Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Success Message */}
        {updateSuccess && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {updateSuccess}
          </div>
        )}

        <div className="profile-card">
          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.fullName || user?.username} />
              ) : (
                <div className="avatar-initial">
                  {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <h2 className="profile-name">{user?.fullName || user?.username}</h2>
            <p className="profile-username">@{user?.username}</p>
            <div className="profile-role">
              <span className={`role-badge ${user?.role === 'Administrator' ? 'role-admin' : 'role-user'}`}>
                {user?.role === 'Administrator' ? '👑 Quản trị viên' : '👤 Thành viên'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            {!isEditing ? (
              <>
                <button className="action-btn edit-btn" onClick={() => setIsEditing(true)}>
                  ✏️ Chỉnh sửa hồ sơ
                </button>
                <button className="action-btn orders-btn" onClick={handleViewOrders}>
                  📦 Đơn hàng của tôi
                </button>
                <button className="action-btn password-btn" onClick={handleChangePassword}>
                  🔒 Đổi mật khẩu
                </button>
                <button className="action-btn logout-btn" onClick={handleLogout}>
                  🚪 Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button className="action-btn cancel-btn" onClick={() => setIsEditing(false)}>
                  ❌ Hủy
                </button>
                <button 
                  className="action-btn save-btn" 
                  onClick={handleEditSubmit}
                  disabled={updateLoading}
                >
                  {updateLoading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </>
            )}
          </div>

          {/* Information Section */}
          <div className="profile-info-section">
            <h3 className="info-title">📋 Thông tin cá nhân</h3>
            
            {!isEditing ? (
              // View Mode
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Tên đăng nhập:</span>
                  <span className="info-value">{user?.username || '---'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Họ và tên:</span>
                  <span className="info-value">{user?.fullName || '---'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user?.email || '---'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Số điện thoại:</span>
                  <span className="info-value">{user?.phone || '---'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Địa chỉ:</span>
                  <span className="info-value">{user?.address || '---'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày tham gia:</span>
                  <span className="info-value">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '---'}
                  </span>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="0123456789"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Địa chỉ</label>
                  <textarea
                    className="form-textarea"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Nhập địa chỉ giao hàng"
                    rows="3"
                  />
                </div>
              </form>
            )}
          </div>

          {/* Stats Section */}
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-number">{user?.orderCount || 0}</div>
              <div className="stat-label">Đơn hàng</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user?.reviewCount || 0}</div>
              <div className="stat-label">Đánh giá</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user?.wishlistCount || 0}</div>
              <div className="stat-label">Yêu thích</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}