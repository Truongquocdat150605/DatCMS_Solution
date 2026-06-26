import React from 'react';

export default function ProfileSidebar({
  user,
  isEditing,
  setIsEditing,
  handleViewOrders,
  handleChangePassword,
  handleLogout,
}) {
  return (
    <div className="profile-sidebar">
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

      <div className="profile-menu">
        <button
          className={`menu-btn ${!isEditing ? 'active' : ''}`}
          onClick={() => setIsEditing(false)}
        >
          👤 Thông tin chung
        </button>
        <button
          className={`menu-btn ${isEditing ? 'active' : ''}`}
          onClick={() => setIsEditing(true)}
        >
          ✏️ Chỉnh sửa hồ sơ
        </button>
        <button className="menu-btn" onClick={handleViewOrders}>
          📦 Đơn hàng của tôi
        </button>
        <button className="menu-btn" onClick={handleChangePassword}>
          🔒 Đổi mật khẩu
        </button>
        <button className="menu-btn logout-btn" onClick={handleLogout}>
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  );
}
