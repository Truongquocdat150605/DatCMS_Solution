/**
 * Tên file: App.js
 * Dự án: CMS_Project - Frontend
 * Mô tả: Thành phần chính của giao diện.
 * Chức năng: Hiển thị giao diện chào mừng và danh mục chức năng.
 */
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>HỆ THỐNG QUẢN TRỊ NỘI DUNG - CMS</h1>
        <p>Chào mừng bạn đến với giao diện ReactJS</p>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <button className="btn">Quản lý Tin tức</button>
          <button className="btn">Quản lý Sản phẩm</button>
          <button className="btn">Quản lý Đơn hàng</button>
        </div>
      </header>
    </div>
  );
}

export default App;