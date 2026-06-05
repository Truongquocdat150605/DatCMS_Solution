import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import postApi from './../services/api/postApi';
import { buildImageUrl } from '../utils/imageUrl';
import '../styles/PostDetailPage.css';

function parseDate(d) {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('vi-VN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatReadTime(content) {
  if (!content) return '1 phút đọc';
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);
  return `${readTime} phút đọc`;
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await postApi.getById(id);
        if (!mounted) return;
        setPost(res);
        
        // Load related posts (cùng danh mục)
        if (res?.category?.id) {
          try {
            const relatedRes = await postApi.getByCategory(res.category.id);
            const related = Array.isArray(relatedRes) ? relatedRes : relatedRes?.data || [];
            // Lọc bài hiện tại và lấy 3 bài liên quan
            const filtered = related.filter(p => p.id !== Number(id)).slice(0, 3);
            setRelatedPosts(filtered);
          } catch (e) {
            console.error('Không thể tải bài viết liên quan:', e);
          }
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Lỗi khi tải bài viết');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép link bài viết!');
    }
  };

  if (loading) {
    return (
      <div className="post-detail-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang tải bài viết...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-error">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Thử lại
        </button>
        <button className="back-button" onClick={() => navigate('/posts')}>
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-notfound">
        <div className="notfound-icon">📄</div>
        <h2>Không tìm thấy bài viết</h2>
        <p>Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <button className="back-button" onClick={() => navigate('/posts')}>
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const readTime = formatReadTime(post.content || post.html);

  return (
    <div className="post-detail-container">
      <article className="post-detail-article">
        {/* Header Section */}
        <header className="post-header">
          <div className="post-header-content">
            <div className="post-breadcrumb">
              <button onClick={() => navigate('/')} className="breadcrumb-link">
                Trang chủ
              </button>
              <span className="breadcrumb-separator">›</span>
              <button onClick={() => navigate('/posts')} className="breadcrumb-link">
                Bài viết
              </button>
              {post.category?.name && (
                <>
                  <span className="breadcrumb-separator">›</span>
                  <button 
                    onClick={() => navigate(`/posts?categoryId=${post.category.id}`)} 
                    className="breadcrumb-link"
                  >
                    {post.category.name}
                  </button>
                </>
              )}
            </div>

            <h1 className="post-title">{post.title}</h1>

            <div className="post-meta">
              {post.category?.name && (
                <span className="post-category">
                  <span className="meta-icon">📂</span>
                  {post.category.name}
                </span>
              )}
              {post.createdAt && (
                <span className="post-date">
                  <span className="meta-icon">📅</span>
                  {parseDate(post.createdAt)}
                </span>
              )}
              <span className="post-readtime">
                <span className="meta-icon">⏱️</span>
                {readTime}
              </span>
              {post.author && (
                <span className="post-author">
                  <span className="meta-icon">✍️</span>
                  {post.author}
                </span>
              )}
            </div>

            {post.excerpt && (
              <div className="post-excerpt">
                {post.excerpt}
              </div>
            )}

            <div className="post-actions">
              <button className="action-btn" onClick={handleShare}>
                <span className="action-icon">📤</span>
                Chia sẻ
              </button>
              <button className="action-btn" onClick={() => window.print()}>
                <span className="action-icon">🖨️</span>
                In bài viết
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="post-featured-image">
            <img
              src={buildImageUrl(post.imageUrl)}
              alt={post.title}
              className="featured-image"
              loading="lazy"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="post-content-wrapper">
          <div className="post-content">
            <div
              className="post-body"
              dangerouslySetInnerHTML={{ __html: post.content || post.html || '' }}
            />
          </div>

          {/* Table of Contents (nếu có heading) */}
          <aside className="post-sidebar">
            <div className="toc-container">
              <h3 className="toc-title">📑 Mục lục</h3>
              <div className="toc-content" id="table-of-contents"></div>
            </div>
          </aside>
        </div>

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            <span className="tags-label">🏷️ Tags:</span>
            <div className="tags-list">
              {post.tags.map((tag, index) => (
                <button key={index} className="tag" onClick={() => navigate(`/posts?tag=${tag}`)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation between posts */}
        <div className="post-navigation">
          {post.prevPost && (
            <button 
              className="nav-prev" 
              onClick={() => navigate(`/posts/${post.prevPost.id}`)}
            >
              ← {post.prevPost.title}
            </button>
          )}
          {post.nextPost && (
            <button 
              className="nav-next" 
              onClick={() => navigate(`/posts/${post.nextPost.id}`)}
            >
              {post.nextPost.title} →
            </button>
          )}
        </div>
      </article>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="related-posts">
          <div className="related-header">
            <h2 className="related-title">📖 Bài viết liên quan</h2>
            <button className="view-all-btn" onClick={() => navigate('/posts')}>
              Xem tất cả →
            </button>
          </div>
          <div className="related-grid">
            {relatedPosts.map((relatedPost) => (
              <div
                key={relatedPost.id}
                className="related-card"
                onClick={() => navigate(`/posts/${relatedPost.id}`)}
              >
                {relatedPost.imageUrl && (
                  <div className="related-card-image">
                    <img
                      src={buildImageUrl(relatedPost.imageUrl)}
                      alt={relatedPost.title}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="related-card-content">
                  <h3 className="related-card-title">{relatedPost.title}</h3>
                  <div className="related-card-footer">
                    <span className="related-card-link">Đọc tiếp →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Back to top button */}
      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        ↑
      </button>
    </div>
  );
}