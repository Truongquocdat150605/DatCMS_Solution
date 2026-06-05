import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import postApi from '../services/api/postApi';
import productApi from '../services/api/productApi';
import categoryApi from '../services/api/categoryApi';
import { buildImageUrl } from '../utils/imageUrl';
import HeroCarousel from '../components/HeroCarousel';
import '../styles/HomePage.css';

function formatVND(price) {
  const num = typeof price === 'string' ? Number(price) : price;
  if (Number.isNaN(num)) return `${price || 0} ₫`;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

// 👉 THÊM HÀM THÊM VÀO GIỎ HÀNG
const addToCart = (product, quantity = 1) => {
  // Lấy giỏ hàng hiện tại từ localStorage
  const existingCart = localStorage.getItem('cart');
  let cart = existingCart ? JSON.parse(existingCart) : [];
  
  // Kiểm tra sản phẩm đã có trong giỏ chưa
  const existingIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingIndex !== -1) {
    // Nếu có rồi thì tăng số lượng
    cart[existingIndex].quantity += quantity;
  } else {
    // Nếu chưa có thì thêm mới
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity: quantity
    });
  }
  
  // Lưu lại vào localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Hiển thị thông báo (tùy chọn)
  alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  
  // Dispatch event để Header cập nhật số lượng
  window.dispatchEvent(new Event('storage'));
};

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('cpu')) return '🖥️';
    if (name.includes('vga') || name.includes('graphic')) return '🎮';
    if (name.includes('ram')) return '💾';
    if (name.includes('mainboard') || name.includes('main')) return '🔧';
    if (name.includes('ssd') || name.includes('hdd') || name.includes('storage')) return '📀';
    if (name.includes('nguồn') || name.includes('psu') || name.includes('power')) return '⚡';
    if (name.includes('tản') || name.includes('cooler') || name.includes('fan')) return '❄️';
    if (name.includes('phím') || name.includes('chuột') || name.includes('keyboard') || name.includes('mouse')) return '🖱️';
    return '📦';
  };

  const getCategoryColor = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('cpu')) return '#3b82f6';
    if (name.includes('vga')) return '#ef4444';
    if (name.includes('ram')) return '#10b981';
    if (name.includes('mainboard')) return '#f59e0b';
    if (name.includes('ssd')) return '#8b5cf6';
    if (name.includes('nguồn')) return '#ec489a';
    if (name.includes('tản')) return '#06b6d4';
    if (name.includes('phím')) return '#84cc16';
    return '#64748b';
  };

  const flashSaleProducts = useMemo(() => {
    const saleProducts = products.filter(p => p.discountPercent > 0 || p.isSale === true);
    if (saleProducts.length >= 4) return saleProducts.slice(0, 4);
    return products.slice(0, 4);
  }, [products]);

  const latestPosts = useMemo(() => (posts || []).slice(0, 6), [posts]);
  
  const featuredProducts = useMemo(() => {
    const featured = products.filter(p => p.isFeatured === true);
    if (featured.length >= 6) return featured.slice(0, 6);
    return (products || []).slice(0, 6);
  }, [products]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        
        const [postsRes, productsRes, categoriesRes] = await Promise.all([
          postApi.getAll(),
          productApi.getAll(),
          categoryApi.getAll(),
        ]);
        
        if (!mounted) return;

        setPosts(Array.isArray(postsRes) ? postsRes : postsRes?.data || []);
        setProducts(Array.isArray(productsRes) ? productsRes : productsRes?.data || []);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes?.data || []);
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

  // Hàm xử lý thêm vào giỏ, chặn sự kiện nổi bọt để không bị navigate
  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Ngăn không cho click vào card
    addToCart(product, 1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">⚠️ {error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );
  }

  const displayCategories = categories.length > 0 ? categories : [];

  return (
    <div className="home-container">
      <div className="carousel-wrapper">
        <HeroCarousel />
      </div>

      <div className="content-wrapper">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              🔥 FLASH SALE - GIẢM ĐẾN 50%
            </div>
            <h1 className="hero-title">
              CMS Pro - Chuyên Linh Kiện PC Chính Hãng
            </h1>
            <p className="hero-subtitle">
              CPU | Mainboard | RAM | VGA | SSD | Nguồn | Tản Nhiệt | Phụ kiện
            </p>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">🖥️ {products.length}+ Linh kiện</div>
            <div className="hero-stat">🏪 {categories.length}+ Danh mục</div>
            <div className="hero-stat">🚚 Freeship đơn 500k+</div>
          </div>
        </div>

        {/* Danh mục sản phẩm */}
        {displayCategories.length > 0 && (
          <section className="section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Danh mục linh kiện</h2>
                <div className="section-subtitle">Chọn theo nhu cầu của bạn</div>
              </div>
            </div>
            <div className="categories-grid">
              {displayCategories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="category-card"
                  style={{ borderBottomColor: getCategoryColor(cat.name) }}
                  onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                >
                  <div className="category-icon">{getCategoryIcon(cat.name)}</div>
                  <h3 className="category-name">{cat.name}</h3>
                  <span className="category-arrow">→</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Flash Sale */}
        {flashSaleProducts.length > 0 && (
          <section className="section flash-sale-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">⚡ FLASH SALE</h2>
                <div className="section-subtitle">Siêu giảm giá - Số lượng có hạn</div>
              </div>
              <button className="view-all-btn" onClick={() => navigate('/products?flashSale=true')}>
                Xem tất cả →
              </button>
            </div>
            <div className="products-grid">
              {flashSaleProducts.map((product) => {
                const originalPrice = product.discountPercent 
                  ? product.price / (1 - product.discountPercent / 100)
                  : product.price * 1.3;
                const discountPercent = product.discountPercent || Math.round((1 - product.price / originalPrice) * 100);
                
                return (
                  <div key={product.id} className="card flash-sale-card" onClick={() => navigate(`/products/${product.id}`)}>
                    <div className="sale-badge">-{discountPercent}%</div>
                    <div className="card-image-wrapper">
                      {product.imageUrl ? (
                        <img src={buildImageUrl(product.imageUrl)} alt={product.name} className="card-image" />
                      ) : (
                        <div className="card-image-placeholder">🛍️</div>
                      )}
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{product.name}</h3>
                      <div className="price-wrapper">
                        <span className="sale-price">{formatVND(product.price)}</span>
                        <span className="original-price">{formatVND(originalPrice)}</span>
                      </div>
                      {/* 👉 THÊM NÚT THÊM VÀO GIỎ */}
                      <button 
                        className="add-to-cart-btn"
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        🛒 Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Sản phẩm nổi bật */}
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Sản phẩm nổi bật</h2>
              <div className="section-subtitle">Chọn lọc những sản phẩm tốt nhất</div>
            </div>
            <button className="view-all-btn" onClick={() => navigate('/products')}>
              Xem tất cả →
            </button>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="card" onClick={() => navigate(`/products/${product.id}`)}>
                <div className="card-image-wrapper">
                  {product.imageUrl ? (
                    <img src={buildImageUrl(product.imageUrl)} alt={product.name} className="card-image" />
                  ) : (
                    <div className="card-image-placeholder">🛍️</div>
                  )}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{product.name}</h3>
                  <div className="card-price">{formatVND(product.price)}</div>
                  <div className="card-footer">
                    <span className="card-link">Xem chi tiết →</span>
                    {typeof product.quantity === 'number' && (
                      <span className={`card-stock ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng'}
                      </span>
                    )}
                  </div>
                  {/* 👉 THÊM NÚT THÊM VÀO GIỎ */}
                  <button 
                    className="add-to-cart-btn"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    🛒 Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bài viết mới nhất */}
        {latestPosts.length > 0 && (
          <section className="section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Bài viết mới nhất</h2>
                <div className="section-subtitle">Cập nhật kiến thức công nghệ mỗi ngày</div>
              </div>
              <button className="view-all-btn" onClick={() => navigate('/posts')}>
                Xem tất cả →
              </button>
            </div>
            <div className="posts-grid">
              {latestPosts.map((post) => (
                <div key={post.id} className="card post-card" onClick={() => navigate(`/posts/${post.id}`)}>
                  <div className="card-image-wrapper">
                    {post.imageUrl ? (
                      <img src={buildImageUrl(post.imageUrl)} alt={post.title} className="card-image" />
                    ) : (
                      <div className="card-image-placeholder">📷</div>
                    )}
                    {post.category?.name && <span className="card-category">{post.category.name}</span>}
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{post.title}</h3>
                    <p className="card-excerpt">{post.excerpt || post.description || 'Nhấp để đọc thêm...'}</p>
                    <div className="card-footer">
                      <span className="card-link">Đọc tiếp →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Chính sách */}
        <section className="policy-section">
          <div className="policy-grid">
            <div className="policy-card">
              <div className="policy-icon">🚚</div>
              <h4>Freeship đơn 500k+</h4>
              <p>Miễn phí vận chuyển toàn quốc</p>
            </div>
            <div className="policy-card">
              <div className="policy-icon">🔧</div>
              <h4>Bảo hành 36 tháng</h4>
              <p>Chính hãng, đổi trả dễ dàng</p>
            </div>
            <div className="policy-card">
              <div className="policy-icon">✅</div>
              <h4>Hàng chính hãng 100%</h4>
              <p>Cam kết nguồn gốc rõ ràng</p>
            </div>
            <div className="policy-card">
              <div className="policy-icon">💰</div>
              <h4>Hoàn tiền 200%</h4>
              <p>Nếu phát hiện hàng giả</p>
            </div>
          </div>
        </section>

        {/* CTA cuối trang */}
        <div className="cta-section">
          <h3 className="cta-title">🛒 GIỎ HÀNG CỦA BẠN ĐANG CHỜ</h3>
          <p className="cta-subtitle">Hơn {products.length} linh kiện chính hãng, giá tốt mỗi ngày</p>
          <button className="cta-button" onClick={() => navigate('/products')}>
            🚀 MUA NGAY HÔM NAY
          </button>
        </div>
      </div>
    </div>
  );
}