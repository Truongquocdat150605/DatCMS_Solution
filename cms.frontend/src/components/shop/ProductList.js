import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../core_modules/contexts/CartContext';
import productApi from '../../core_modules/api/productApi';
import { buildImageUrl } from '../../utils/imageUrl';

// ProductCard Component
export function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const originalPrice = product.discountPercent 
    ? product.price / (1 - product.discountPercent / 100)
    : null;
  const discountPercent = product.discountPercent || 
    (originalPrice ? Math.round((1 - product.price / originalPrice) * 100) : 0);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div 
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(product.stockQuantity ?? product.quantity) !== undefined && (
              <span className={`product-stock ${(product.stockQuantity ?? product.quantity ?? 0) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {(product.stockQuantity ?? product.quantity ?? 0) > 0 ? `Còn ${product.stockQuantity ?? product.quantity}` : 'Hết hàng'}
              </span>
            )}
            {(product.stockQuantity ?? product.quantity ?? 0) > 0 && (
              <button 
                className="btn-add-cart-icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({ ...product, quantity: product.stockQuantity ?? product.quantity ?? 0 }, 1);
                }}
                title="Thêm vào giỏ"
              >
                🛒
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default function ProductList({ categoryId, searchQuery, priceRange, sortBy, setTotalCount, onResetFilters }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Lấy dữ liệu sản phẩm
  useEffect(() => {
    let mounted = true;
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await productApi.getAll();
        if (!mounted) return;
        setProducts(Array.isArray(res) ? res : res?.data || []);
      } catch (err) {
        if (mounted) setError(err.message || 'Lỗi lấy danh sách sản phẩm');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProducts();
    return () => mounted = false;
  }, []);

  // Lọc sản phẩm
  const filtered = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (categoryId) {
      result = result.filter((p) => {
        const cat = p.CategoryProductId ?? p.categoryProductId ?? p.CategoryId ?? p.categoryId ?? p.category?.Id ?? p.category?.id ?? '';
        return `${cat}` === `${categoryId}`;
      });
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => 
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    // Filter by price
    if (priceRange.min) {
      result = result.filter(p => p.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter(p => p.price <= Number(priceRange.max));
    }

    // Sort
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
        break;
    }

    return result;
  }, [products, categoryId, searchQuery, priceRange, sortBy]);

  // Báo cáo số lượng tổng lên Component Cha
  useEffect(() => {
    if (setTotalCount) {
      setTotalCount(filtered.length);
    }
  }, [filtered.length, setTotalCount]);

  // Reset trang khi đổi filter
  useEffect(() => {
    setPage(1);
  }, [categoryId, searchQuery, priceRange, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

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

  if (current.length === 0) {
    return (
      <div className="no-products">
        <div className="no-products-icon">🔍</div>
        <h3>Không tìm thấy sản phẩm</h3>
        <p>Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
        <button className="reset-btn-large" onClick={onResetFilters}>
          Xóa tất cả bộ lọc
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="products-grid">
        {current.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-summary">
            Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} / {filtered.length} sản phẩm
          </div>
          <div className="pagination-controls">
            <button onClick={() => setPage(1)} disabled={page === 1} className="pagination-btn pagination-edge">«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="pagination-btn">‹ Trước</button>
            <div className="pagination-pages">
              {(() => {
                const pages = [];
                const delta = 2;
                const left = Math.max(2, page - delta);
                const right = Math.min(totalPages - 1, page + delta);
                pages.push(<button key={1} onClick={() => setPage(1)} className={`pagination-page ${page === 1 ? 'active' : ''}`}>1</button>);
                if (left > 2) pages.push(<span key="left-dot" className="pagination-ellipsis">…</span>);
                for (let i = left; i <= right; i++) {
                  pages.push(<button key={i} onClick={() => setPage(i)} className={`pagination-page ${page === i ? 'active' : ''}`}>{i}</button>);
                }
                if (right < totalPages - 1) pages.push(<span key="right-dot" className="pagination-ellipsis">…</span>);
                if (totalPages > 1) {
                  pages.push(<button key={totalPages} onClick={() => setPage(totalPages)} className={`pagination-page ${page === totalPages ? 'active' : ''}`}>{totalPages}</button>);
                }
                return pages;
              })()}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="pagination-btn">Sau ›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="pagination-btn pagination-edge">»</button>
          </div>
        </div>
      )}
    </>
  );
}
