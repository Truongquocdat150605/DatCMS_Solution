import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../core_modules/api/authApi';
import '../../styles/ProfilePage.css';
import ProfileSidebar from './components/ProfileSidebar';
import ProfileInfoView from './components/ProfileInfoView';
import ProfileEditForm from './components/ProfileEditForm';

export default function ProfilePage({ onLogout }) {
  const navigate = useNavigate();

  // Lưu ý:
  // - Backend `AuthApiController.me` chỉ trả về Users: { id, username, fullName, role }
  // - Frontend login "Customer" (email/pass) dùng endpoint Auth/CustomerLogin nên KHÔNG tạo cookie để /api/Auth/me hoạt động.
  // Vì vậy: nếu `authApi.me()` thất bại thì fallback sang dữ liệu customer từ localStorage.


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
    setLoading(true);
    setError('');

    const role = localStorage.getItem('role');
    const customerId = localStorage.getItem('customerId');
    const isCustomer = role === 'Customer';

    if (isCustomer && customerId) {
      // Customer: gọi API customer-profile và API orders để lấy số lượng đơn hàng
      try {
        console.log('👤 Customer mode: gọi API customer-profile...');
        const [profileRes, ordersRes] = await Promise.all([
          fetch(`https://localhost:7048/api/Auth/customer-profile?customerId=${customerId}`),
          fetch(`https://localhost:7048/api/Orders/customer/${customerId}`)
        ]);
        
        const data = await profileRes.json();
        const ordersData = await ordersRes.json().catch(() => []);
        const orderCount = Array.isArray(ordersData) ? ordersData.length : 0;

        if (profileRes.ok && data) {
          setUser({
            id: data.id,
            username: data.email?.split('@')[0] || '',
            fullName: data.fullName || '',
            role: 'Customer',
            email: data.email || '',
            phone: data.phone || 'Chưa cập nhật',
            address: data.address || 'Chưa cập nhật',
            createdAt: data.createdAt,
            orderCount: orderCount,
          });
          setEditForm({
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
          });
        } else {
          throw new Error('API trả về lỗi');
        }
      } catch (err) {
        console.error('❌ Lỗi customer-profile:', err);
        // Fallback localStorage
        const storedFullName = localStorage.getItem('fullName');
        const storedEmail = localStorage.getItem('email');
        setUser({
          id: customerId,
          username: storedEmail?.split('@')[0] || '',
          fullName: storedFullName || 'Khách hàng',
          role: 'Customer',
          email: storedEmail || '---',
          phone: localStorage.getItem('phone') || '---',
          address: localStorage.getItem('address') || '---',
          orderCount: 0,
        });
      } finally {
        if (mounted) setLoading(false);
      }
      return;
    }

    // Admin: gọi API /me
    try {
      const data = await authApi.me();
      if (mounted && data) {
        setUser(data);
        setEditForm({
          fullName: data?.fullName || '',
          email: data?.email || '',
          phone: data?.phone || '',
          address: data?.address || '',
        });
      }
    } catch (err) {
      setError('Không thể tải thông tin');
    } finally {
      if (mounted) setLoading(false);
    }
  }

  loadUser();
  return () => { mounted = false; };
}, []);


const handleLogout = async () => {
    try {
      if (typeof onLogout === 'function') {
        await onLogout('/login');
        return;
      }

      await authApi.logout();
      localStorage.removeItem('username');
      localStorage.removeItem('fullName');
      localStorage.removeItem('email');
      localStorage.removeItem('customerId');
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('username');
      localStorage.removeItem('fullName');
      localStorage.removeItem('email');
      localStorage.removeItem('customerId');
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'https://localhost:7048/Account/Logout';
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateSuccess('');
    setError('');

    try {
      const nextFullName = editForm?.fullName?.trim();
      if (!nextFullName) {
        setError('Vui lòng nhập họ và tên.');
        setUpdateLoading(false);
        return;
      }

      let url = '';
      let body = {};

      if (user.role === 'Customer') {
        url = 'https://localhost:7048/api/Auth/update-customer-profile';
        body = {
          customerId: user.id,
          fullName: nextFullName,
          email: editForm?.email?.trim(),
          phone: editForm?.phone?.trim(),
          address: editForm?.address?.trim(),
        };
      } else {
        url = 'https://localhost:7048/api/Auth/update-user-profile';
        body = {
          userId: user.id,
          fullName: nextFullName,
          email: editForm?.email?.trim(),
        };
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Cập nhật thất bại');
      }

      // Cập nhật UI ngay (client-side).
      setUser(prev => ({
        ...(prev || {}),
        fullName: nextFullName,
        email: editForm?.email?.trim(),
        phone: editForm?.phone?.trim(),
        address: editForm?.address?.trim(),
      }));

      // Cập nhật localStorage
      localStorage.setItem('fullName', nextFullName);
      localStorage.setItem('email', editForm?.email?.trim());
      if (user.role === 'Customer') {
        localStorage.setItem('phone', editForm?.phone?.trim());
        localStorage.setItem('address', editForm?.address?.trim());
      }

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
        {updateSuccess && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {updateSuccess}
          </div>
        )}

        <div className="profile-layout">
          <ProfileSidebar 
            user={user}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleViewOrders={handleViewOrders}
            handleChangePassword={handleChangePassword}
            handleLogout={handleLogout}
          />

          {/* MAIN CONTENT */}
          <div className="profile-main">
            <div className="profile-info-section">
              <h3 className="info-title">
                {isEditing ? '✏️ Cập nhật thông tin' : '📋 Thông tin cá nhân'}
              </h3>
              
              {!isEditing ? (
                <ProfileInfoView user={user} />
              ) : (
                <ProfileEditForm 
                  editForm={editForm}
                  setEditForm={setEditForm}
                  handleEditSubmit={handleEditSubmit}
                  setIsEditing={setIsEditing}
                  updateLoading={updateLoading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
