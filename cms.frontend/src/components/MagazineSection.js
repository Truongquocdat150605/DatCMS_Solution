import React from 'react';
import { useNavigate } from 'react-router-dom';
import { buildImageUrl } from '../utils/imageUrl';

const MagazineSection = ({ latestPosts }) => {
  const navigate = useNavigate();

  if (!latestPosts || latestPosts.length === 0) return null;

  return (
    <section className="premium-section magazine-section">
      <div className="section-header center">
        <span className="section-badge tech">📰 TECH NEWS</span>
        <h2 className="section-title">Tin Tức & Đánh Giá</h2>
        <div className="section-subtitle">Cập nhật xu hướng công nghệ mới nhất mỗi ngày</div>
      </div>

      <div className="magazine-layout">
        {/* Cột trái: Bài viết nổi bật (Bài mới nhất) */}
        {latestPosts[0] && (
          <div
            className="magazine-hero"
            onClick={() => navigate(`/posts/${latestPosts[0].id}`)}
            style={{ backgroundImage: `url(${buildImageUrl(latestPosts[0].imageUrl) || 'https://placehold.co/800x600/1a1a2e/64ffda?text=Tech+News'})` }}
          >
            <div className="magazine-hero-overlay">
              <span className="magazine-tag hot-tag">Tin Hot</span>
              <h3 className="magazine-hero-title">{latestPosts[0].title}</h3>
              <p className="magazine-hero-excerpt">
                {latestPosts[0].excerpt || "Nhấp để đọc bài viết chi tiết và khám phá những thông tin công nghệ mới nhất trong hôm nay..."}
              </p>
              <div className="magazine-hero-meta">
                <span>🕒 {new Date(latestPosts[0].createdDate || Date.now()).toLocaleDateString('vi-VN')}</span>
                <span>• Đọc tiếp ➔</span>
              </div>
            </div>
          </div>
        )}

        {/* Cột phải: Grid các bài viết còn lại */}
        <div className="magazine-sidebar">
          {latestPosts.slice(1, 5).map((post) => (
            <div key={post.id} className="magazine-side-card" onClick={() => navigate(`/posts/${post.id}`)}>
              <div className="side-card-img-wrapper">
                <img
                  src={buildImageUrl(post.imageUrl) || `https://placehold.co/300x200/1e293b/00d4ff?text=News`}
                  alt={post.title}
                  className="side-card-img"
                />
              </div>
              <div className="side-card-content">
                <span className="magazine-tag normal-tag">{post.category?.name || 'Công nghệ'}</span>
                <h4 className="side-card-title">{post.title}</h4>
                <span className="side-card-date">{new Date(post.createdDate || Date.now()).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-footer center" style={{ marginTop: '30px' }}>
        <button className="view-all-btn outline" onClick={() => navigate('/posts')}>
          Xem tất cả bài viết
        </button>
      </div>
    </section>
  );
};

export default MagazineSection;
