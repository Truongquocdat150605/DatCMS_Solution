import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productApi from '../../core_modules/api/productApi';
import { useCart } from '../../core_modules/contexts/CartContext';
import { buildImageUrl } from '../../utils/imageUrl';
import Breadcrumb from '../../components/Breadcrumb';
import '../../styles/ProductDetailPage.css';

function formatVND(price) {
  const num = typeof price === 'string' ? Number(price) : price;
  if (Number.isNaN(num)) return `${price || 0} ₫`;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

function parseDate(d) {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Sử dụng CartContext
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await productApi.getById(id);
        if (!mounted) return;
        setProduct(res);

        // Load related products cùng danh mục
        if (res?.categoryId || res?.category?.id) {
          const catId = res.categoryId || res.category?.id;
          try {
            const relatedRes = await productApi.getByCategory(catId);
            const related = Array.isArray(relatedRes) ? relatedRes : relatedRes?.data || [];
            const filtered = related.filter(p => p.id !== Number(id)).slice(0, 4);
            setRelatedProducts(filtered);
          } catch (e) {
            console.error('Không thể tải sản phẩm liên quan:', e);
          }
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Lỗi khi tải sản phẩm');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity); // CartContext đã lo việc check tồn kho và hiện toast
  };

  // Xử lý mua ngay
  const handleBuyNow = () => {
    if (!product) return;
    const success = addToCart(product, quantity);
    if (success) {
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="product-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-error">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-notfound">
        <div className="notfound-icon">🛍️</div>
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <button className="back-button" onClick={() => navigate('/products')}>
          ← Quay lại cửa hàng
        </button>
      </div>
    );
  }

  const categoryName = product.categoryProduct?.name || product.category?.name || '';
  const originalPrice = product.discountPercent  
    ? product.price / (1 - product.discountPercent / 100)
    : null;
  const discountPercent = product.discountPercent ||  
    (originalPrice ? Math.round((1 - product.price / originalPrice) * 100) : 0);

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <Breadcrumb items={[
          { label: 'Trang chủ', path: '/' },
          { label: 'Sản phẩm', path: categoryName ? '/products' : null },
          categoryName && { label: categoryName, path: `/products?categoryId=${product.categoryId || product.category?.id}` },
          { label: product.name }
        ].filter(Boolean)} />

        {/* Product Main Info */}
        <div className="product-main">
          <div className="product-gallery">
            <div className="product-main-image">
              {product.imageUrl ? (
                <img src={buildImageUrl(product.imageUrl)} alt={product.name} />
              ) : (
                <div className="product-no-image">🛍️</div>
              )}
              {discountPercent > 0 && (
                <div className="product-discount-badge">-{discountPercent}%</div>
              )}
            </div>
          </div>

          <div className="product-info">
            {categoryName && (
              <div className="product-category">{categoryName}</div>
            )}
                        
            <h1 className="product-name">{product.name}</h1>
                        
            <div className="product-price-wrapper">
              <span className="product-current-price">{formatVND(product.price)}</span>
              {originalPrice && (
                <span className="product-original-price">{formatVND(originalPrice)}</span>
              )}
            </div>

            <div className="product-meta">
              <div className="product-stock-info">
                <span className="stock-label">Tình trạng:</span>
                {(product.stockQuantity ?? product.quantity) !== undefined ? (
                  <span className={`stock-value ${(product.stockQuantity ?? product.quantity ?? 0) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {(product.stockQuantity ?? product.quantity ?? 0) > 0 ? `✅ Còn ${product.stockQuantity ?? product.quantity} sản phẩm` : '❌ Hết hàng'}
                  </span>
                ) : (
                  <span className="stock-value">Liên hệ</span>
                )}
              </div>
                            
              {product.sku && (
                <div className="product-sku">
                  <span className="sku-label">Mã SP:</span>
                  <span className="sku-value">{product.sku}</span>
                </div>
              )}
                            
              {product.createdAt && (
                <div className="product-date">
                  <span className="date-label">Ngày đăng:</span>
                  <span className="date-value">{parseDate(product.createdAt)}</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {(product.stockQuantity ?? product.quantity ?? 0) > 0 && (
              <div className="product-quantity">
                <span className="quantity-label">Số lượng:</span>
                <div className="quantity-selector">
                  <button  
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <input  
                    type="number"  
                    value={quantity}  
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity ?? product.quantity ?? 0, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={product.stockQuantity ?? product.quantity ?? 0}
                    className="quantity-input"
                  />
                  <button  
                    onClick={() => setQuantity(q => Math.min(product.stockQuantity ?? product.quantity ?? 0, q + 1))}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="product-actions">
              {(product.stockQuantity ?? product.quantity ?? 0) > 0 ? (
                <>
                  <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    🛒 Thêm vào giỏ
                  </button>
                  <button className="buy-now-btn" onClick={handleBuyNow}>
                    ⚡ Mua ngay
                  </button>
                </>
              ) : (
                <button className="sold-out-btn" disabled>
                  ❌ Hết hàng
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Description */}
        {(product.description || product.content || product.detail) && (
          <div className="product-description">
            <h2 className="section-title">📖 Mô tả sản phẩm</h2>
            <div 
              className="description-content"
              dangerouslySetInnerHTML={{ __html: product.description || product.content || product.detail }}
            />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <div className="related-header">
              <h2 className="section-title">🔗 Sản phẩm liên quan</h2>
              <button className="view-all-btn" onClick={() => navigate('/products')}>
                Xem tất cả →
              </button>
            </div>
            <div className="related-grid">
              {relatedProducts.map((related) => (
                <div 
                  key={related.id} 
                  className="related-card"
                  onClick={() => navigate(`/products/${related.id}`)}
                >
                  <div className="related-card-image">
                    {related.imageUrl ? (
                      <img src={buildImageUrl(related.imageUrl)} alt={related.name} />
                    ) : (
                      <div className="related-no-image">🛍️</div>
                    )}
                  </div>
                  <div className="related-card-content">
                    <h3 className="related-card-title">{related.name}</h3>
                    <div className="related-card-price">{formatVND(related.price)}</div>
                    <span className="related-card-link">Xem chi tiết →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
