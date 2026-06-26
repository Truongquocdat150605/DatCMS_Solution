import React from 'react';
import '../../styles/AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>Giới thiệu về chúng tôi</h1>
        <p>CMS Pro - Nền tảng quản trị nội dung & bán hàng công nghệ hiện đại.</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Chúng tôi làm gì?</h2>
          <p>
            Giúp doanh nghiệp/đội nhóm quản lý nội dung, danh mục sản phẩm và vận hành bán hàng.
            Hệ thống tối ưu trải nghiệm quản trị và hiển thị trực quan cho khách hàng.
          </p>
        </section>

        <section className="about-section">
          <h2>Tại sao chọn CMS Pro?</h2>
          <ul>
            <li>Giao diện quản trị rõ ràng, dễ sử dụng</li>
            <li>Tích hợp danh mục, sản phẩm, bài viết</li>
            <li>Hỗ trợ upload hình ảnh và hiển thị trực quan</li>
            <li>Thiết kế hướng tới tính mở rộng</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Liên hệ</h2>
          <p>
            Nếu bạn cần hỗ trợ hoặc muốn mở rộng tính năng, hãy liên hệ qua trang <b>Liên hệ</b>.
          </p>
        </section>
      </div>
    </div>
  );
}

