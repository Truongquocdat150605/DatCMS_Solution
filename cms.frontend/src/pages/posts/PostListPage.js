import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import postApi from '../../core_modules/api/postApi';
import { buildImageUrl } from '../../utils/imageUrl';
import '../../styles/PostListPage.css'; 
function extractText(html) {
  if (!html) return '';
  return html.toString().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function formatExcerpt(value, maxLen = 170) {
  const text = extractText(value);
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

function parseDate(d) {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('vi-VN');
}

export default function PostListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await postApi.getAll();
        if (!mounted) return;
        setPosts(Array.isArray(res) ? res : res?.data || []);
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
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => 
      extractText(p.title || '').toLowerCase().includes(q) ||
      extractText(p.excerpt || p.description || '').toLowerCase().includes(q)
    );
  }, [posts, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  if (loading) {
    return (
      <div className="posts-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang tải bài viết...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="posts-error">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="posts-page">
      <div className="posts-container">
        {/* Header */}
        <div className="posts-header">
          <div className="posts-header-content">
            <h1 className="posts-title">📝 Bài viết</h1>
            <p className="posts-subtitle">
              Cập nhật kiến thức công nghệ mới nhất mỗi ngày
            </p>
          </div>
          <div className="posts-stats">
            <div className="posts-stat">📄 Tổng số: {filtered.length} bài viết</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="posts-search-section">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết theo tiêu đề hoặc nội dung..."
              className="search-input"
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery('')}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        {current.length === 0 ? (
          <div className="no-posts">
            <div className="no-posts-icon">🔍</div>
            <h3>Không tìm thấy bài viết</h3>
            <p>Hãy thử tìm kiếm với từ khóa khác</p>
            <button className="reset-btn" onClick={() => setQuery('')}>
              Xóa tìm kiếm
            </button>
          </div>
        ) : (
          <>
            <div className="posts-grid">
              {current.map((post) => (
                <div 
                  key={post.id} 
                  className="post-card"
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  <div className="post-card-image">
                    {post.imageUrl ? (
                      <img 
                        src={buildImageUrl(post.imageUrl)} 
                        alt={post.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.parentElement) {
                            const fallback = e.target.parentElement.querySelector('.image-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="image-fallback" style={{ display: post.imageUrl ? 'none' : 'flex' }}>
                      📷
                    </div>
                    {post.category?.name && (
                      <span className="post-card-category">{post.category.name}</span>
                    )}
                  </div>
                  <div className="post-card-content">
                    <h3 className="post-card-title">{post.title}</h3>
                    <p className="post-card-excerpt">
                      {formatExcerpt(post.excerpt || post.description || post.content)}
                    </p>
                    <div className="post-card-footer">
                      <span className="post-card-date">
                        📅 {parseDate(post.createdAt)}
                      </span>
                      <span className="post-card-link">Đọc tiếp →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="posts-pagination">
                {/* Thông tin kết quả */}
                <div className="pagination-summary">
                  Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} / {filtered.length} bài viết
                </div>

                <div className="pagination-controls">
                  {/* Nút về trang đầu */}
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="pagination-btn pagination-edge"
                    title="Trang đầu"
                  >«</button>

                  {/* Nút Trước */}
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="pagination-btn"
                  >‹ Trước</button>

                  {/* Nút số trang */}
                  <div className="pagination-pages">
                    {(() => {
                      const pages = [];
                      const delta = 2;
                      const left = Math.max(2, page - delta);
                      const right = Math.min(totalPages - 1, page + delta);

                      // Trang đầu luôn hiển thị
                      pages.push(
                        <button key={1} onClick={() => setPage(1)}
                          className={`pagination-page ${page === 1 ? 'active' : ''}`}>1</button>
                      );

                      // Dấu ... bên trái
                      if (left > 2) pages.push(<span key="left-ellipsis" className="pagination-ellipsis">…</span>);

                      // Các trang giữa
                      for (let i = left; i <= right; i++) {
                        pages.push(
                          <button key={i} onClick={() => setPage(i)}
                            className={`pagination-page ${page === i ? 'active' : ''}`}>{i}</button>
                        );
                      }

                      // Dấu ... bên phải
                      if (right < totalPages - 1) pages.push(<span key="right-ellipsis" className="pagination-ellipsis">…</span>);

                      // Trang cuối luôn hiển thị (nếu totalPages > 1)
                      if (totalPages > 1) {
                        pages.push(
                          <button key={totalPages} onClick={() => setPage(totalPages)}
                            className={`pagination-page ${page === totalPages ? 'active' : ''}`}>{totalPages}</button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  {/* Nút Sau */}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="pagination-btn"
                  >Sau ›</button>

                  {/* Nút về trang cuối */}
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="pagination-btn pagination-edge"
                    title="Trang cuối"
                  >»</button>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}