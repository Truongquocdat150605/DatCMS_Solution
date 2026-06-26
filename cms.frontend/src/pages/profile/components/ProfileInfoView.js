import React from 'react';

export default function ProfileInfoView({ user }) {
  return (
    <div className="info-grid">
      <div className="info-item">
        <span className="info-label">Tên đăng nhập</span>
        <span className="info-value">{user?.username || '---'}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Họ và tên</span>
        <span className="info-value">{user?.fullName || '---'}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Email</span>
        <span className="info-value">{user?.email || '---'}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Số điện thoại</span>
        <span className="info-value">{user?.phone || '---'}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Địa chỉ</span>
        <span className="info-value">{user?.address || '---'}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Ngày tham gia</span>
        <span className="info-value">
          {user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString('vi-VN')
            : '---'}
        </span>
      </div>
    </div>
  );
}
