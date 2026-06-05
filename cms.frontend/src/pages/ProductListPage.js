import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import categoryApi from '../services/api/categoryApi';
import productApi from '../services/api/productApi';
import { buildImageUrl } from '../utils/imageUrl';
import '../styles/ProductListPage.css';

function formatVND(price) {
  const num = typeof price === 'string' ? Number(price) : price;
  if (Number.isNaN(num)) return `${price || 0} ₫`;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

export default function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter states
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const [catRes, prodRes] = await Promise.all([
          categoryApi.getCategories(), 
          productApi.getAll()
        ]);
        
        if (!mounted) return;

        setCategories(Array.isArray(catRes) ? catRes : catRes?.data || []);
        setProducts(Array.isArray(prodRes) ? prodRes : prodRes?.data || []);
      } catch (e) {
        if (mounted) setError(e.message || 'Lỗi khi tải dữ liệu');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, categoryId, sortBy, priceRange]);

  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    if (query) params.set('search', query);
    navigate(`/products?${params.toString()}`, { replace: true });
  }, [categoryId, query, navigate]);

  const filtered = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (categoryId) {
      result = result.filter((p) => {
        const cat = p.categoryProductId ?? p.categoryId ?? p.category?.id ?? '';
        return `${cat}` === `${categoryId}`;
      });
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((p) => 
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    // Filter by price range
    if (priceRange.min) {
      result = result.filter(p => p.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter(p => p.price <= Number(priceRange.max));
    }

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        // Keep original order
        break;
    }

    return result;
  }, [products, categoryId, query, sortBy, priceRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleResetFilters = () => {
    setCategoryId('');
    setQuery('');
    setSortBy('default');
    setPriceRange({ min: '', max: '' });
    setPage(1);
  };

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-error">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-container">
        {/* Header */}
        <div className="products-header">
          <div className="products-header-content">
            <h1 className="products-title">🛒 Sản phẩm</h1>
            <p className="products-subtitle">
              Khám phá các linh kiện máy tính chính hãng giá tốt nhất
            </p>
          </div>
          <div className="products-stats">
            <div className="products-stat">📦 Tổng: {filtered.length} sản phẩm</div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-row">
            {/* Search */}
            <div className="filter-group search-group">
              <label className="filter-label">🔍 Tìm kiếm</label>
              <div className="search-wrapper">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className="search-input"
                />
                {query && (
                  <button className="search-clear" onClick={() => setQuery('')}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="filter-group">
              <label className="filter-label">📂 Danh mục</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="filter-select"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="filter-group">
              <label className="filter-label">⚡ Sắp xếp</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A → Z</option>
                <option value="name-desc">Tên Z → A</option>
              </select>
            </div>
          </div>

          <div className="filter-row">
            {/* Price Range */}
            <div className="filter-group price-group">
              <label className="filter-label">💰 Khoảng giá</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Từ"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Đến"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="price-input"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="filter-group reset-group">
              <label className="filter-label">&nbsp;</label>
              <button className="reset-btn" onClick={handleResetFilters}>
                🔄 Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(categoryId || query || priceRange.min || priceRange.max || sortBy !== 'default') && (
          <div className="active-filters">
            <span className="active-filters-label">Bộ lọc đang áp dụng:</span>
            {categoryId && (
              <span className="filter-tag">
                Danh mục: {categories.find(c => `${c.id}` === `${categoryId}`)?.name}
                <button onClick={() => setCategoryId('')}>✕</button>
              </span>
            )}
            {query && (
              <span className="filter-tag">
                Tìm kiếm: {query}
                <button onClick={() => setQuery('')}>✕</button>
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span className="filter-tag">
                Giá: {priceRange.min ? formatVND(priceRange.min) : '0'} - {priceRange.max ? formatVND(priceRange.max) : '∞'}
                <button onClick={() => setPriceRange({ min: '', max: '' })}>✕</button>
              </span>
            )}
            {sortBy !== 'default' && (
              <span className="filter-tag">
                Sắp xếp: {sortBy === 'price-asc' ? 'Giá tăng dần' : sortBy === 'price-desc' ? 'Giá giảm dần' : sortBy === 'name-asc' ? 'Tên A-Z' : 'Tên Z-A'}
                <button onClick={() => setSortBy('default')}>✕</button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid */}
        {current.length === 0 ? (
          <div className="no-products">
            <div className="no-products-icon">🔍</div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
            <button className="reset-btn-large" onClick={handleResetFilters}>
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {current.map((product) => {
                const originalPrice = product.discountPercent 
                  ? product.price / (1 - product.discountPercent / 100)
                  : null;
                const discountPercent = product.discountPercent || 
                  (originalPrice ? Math.round((1 - product.price / originalPrice) * 100) : 0);

                return (
                  <div 
                    key={product.id} 
                    className="product-card"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="product-image-wrapper">
                      {product.imageUrl ? (
                        <img 
                          src={buildImageUrl(product.imageUrl)} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.parentElement) {
                              const fallback = e.target.parentElement.querySelector('.image-fallback');
                              if (fallback) fallback.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="image-fallback" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                        🛍️
                      </div>
                      {discountPercent > 0 && (
                        <div className="product-discount">-{discountPercent}%</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price-wrapper">
                        <span className="product-price">{formatVND(product.price)}</span>
                        {originalPrice && (
                          <span className="product-original-price">{formatVND(originalPrice)}</span>
                        )}
                      </div>
                      <div className="product-footer">
                        <span className="product-link">Xem chi tiết →</span>
                        {typeof product.quantity === 'number' && (
                          <span className={`product-stock ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  ← Trước
                </button>
                
                <div className="pagination-pages">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`pagination-page ${page === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}