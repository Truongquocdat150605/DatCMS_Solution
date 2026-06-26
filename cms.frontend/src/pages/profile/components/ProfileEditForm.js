import React from 'react';

export default function ProfileEditForm({
  editForm,
  setEditForm,
  handleEditSubmit,
  setIsEditing,
  updateLoading,
}) {
  return (
    <form onSubmit={handleEditSubmit} className="edit-form">
      <div className="form-group">
        <label className="form-label">Họ và tên</label>
        <input
          type="text"
          className="form-input"
          value={editForm.fullName}
          onChange={(e) =>
            setEditForm({ ...editForm, fullName: e.target.value })
          }
          placeholder="Nhập họ và tên"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          value={editForm.email}
          onChange={(e) =>
            setEditForm({ ...editForm, email: e.target.value })
          }
          placeholder="example@email.com"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Số điện thoại</label>
        <input
          type="tel"
          className="form-input"
          value={editForm.phone}
          onChange={(e) =>
            setEditForm({ ...editForm, phone: e.target.value })
          }
          placeholder="0123456789"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Địa chỉ</label>
        <textarea
          className="form-textarea"
          value={editForm.address}
          onChange={(e) =>
            setEditForm({ ...editForm, address: e.target.value })
          }
          placeholder="Nhập địa chỉ giao hàng"
          rows="3"
        />
      </div>
      <div className="form-actions">
        <button
          type="button"
          className="action-btn cancel-btn"
          onClick={() => setIsEditing(false)}
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          className="action-btn save-btn"
          disabled={updateLoading}
        >
          {updateLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
}
