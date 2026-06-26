import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import categoryApi from '../../core_modules/api/categoryApi';
import productApi from '../../core_modules/api/productApi';
import { buildImageUrl } from '../../utils/imageUrl';
import '../../styles/CategoriesPage.css';

function formatVND(price) {
  const num = typeof price === 'string' ? Number(price) : price;
  if (Number.isNaN(num)) return `${price || 0} ₫`;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Filter states
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Icon cho từng danh mục
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

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        setLoading(true);
        setError('');
        const categoriesRes = await categoryApi.getAll();
        
        if (!mounted) return;
        
        const categoriesData = Array.isArray(categoriesRes) ? categoriesRes : categoriesRes?.data || [];
        setCategories(categoriesData);
        
        // Nếu có categoryId từ URL, tự động chọn danh mục đó
        if (categoryId) {
          const found = categoriesData.find(c => c.id === Number(categoryId) || c.id === categoryId);
          if (found) {
            setSelectedCategory(found);
            await loadProductsByCategory(found.id);
          } else {
            await loadAllProducts();
          }
        } else {
          await loadAllProducts();
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Lỗi khi tải danh mục');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function loadAllProducts() {
      try {
        const productsRes = await productApi.getAll();
        if (mounted) {
          const productsData = Array.isArray(productsRes) ? productsRes : productsRes?.data || [];
          setProducts(productsData);
          setFilteredProducts(productsData);
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Lỗi khi tải sản phẩm');
      }
    }

    async function loadProductsByCategory(catId) {
      try {
        const productsRes = await productApi.getByCategory(catId);
        if (mounted) {
          const productsData = Array.isArray(productsRes) ? productsRes : productsRes?.data || [];
          setProducts(productsData);
          setFilteredProducts(productsData);
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Lỗi khi tải sản phẩm theo danh mục');
      }
    }

    loadCategories();
    return () => {
      mounted = false;
    };
  }, [categoryId]);

  // Filter products khi sortBy, priceRange, searchTerm thay đổi
  useEffect(() => {
    let result = [...products];

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm.trim()) {
      result = result.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo khoảng giá
    if (priceRange.min) {
      result = result.filter(p => p.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter(p => p.price <= Number(priceRange.max));
    }

    // Sắp xếp
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
        // Giữ nguyên thứ tự mặc định
        break;
    }

    setFilteredProducts(result);
  }, [products, sortBy, priceRange, searchTerm]);

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const productsRes = await productApi.getByCategory(category.id);
      const productsData = Array.isArray(productsRes) ? productsRes : productsRes?.data || [];
      setProducts(productsData);
      setFilteredProducts(productsData);
      // Reset filters
      setSortBy('default');
      setPriceRange({ min: '', max: '' });
      setSearchTerm('');
      // Update URL
      navigate(`/categories?categoryId=${category.id}`);
    } catch (e) {
      setError(e.message || 'Lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCategory = async () => {
    setSelectedCategory(null);
    setLoading(true);
    try {
      const productsRes = await productApi.getAll();
      const productsData = Array.isArray(productsRes) ? productsRes : productsRes?.data || [];
      setProducts(productsData);
      setFilteredProducts(productsData);
      setSortBy('default');
      setPriceRange({ min: '', max: '' });
      setSearchTerm('');
      navigate('/categories');
    } catch (e) {
      setError(e.message || 'Lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSortBy('default');
    setPriceRange({ min: '', max: '' });
    setSearchTerm('');
  };

  if (loading && categories.length === 0) {
    return (
      <div className="categories-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang tải danh mục...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-error">
        <div className="error-message">⚠️ {error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="categories-page-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">
            {selectedCategory ? selectedCategory.name : 'Tất cả danh mục'}
          </h1>
          <p className="page-subtitle">
            {selectedCategory 
              ? `Khám phá các sản phẩm ${selectedCategory.name} chính hãng, giá tốt`
              : 'Khám phá tất cả danh mục linh kiện máy tính chính hãng'}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="categories-grid-wrapper">
          <div className="categories-grid">
            <div 
              className={`category-chip ${!selectedCategory ? 'active' : ''}`}
              onClick={handleClearCategory}
            >
              <span className="category-chip-icon">🎯</span>
              <span>Tất cả</span>
            </div>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`category-chip ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                <span className="category-chip-icon">{getCategoryIcon(cat.name)}</span>
                <span>{cat.name}</span>
                {cat.productCount > 0 && (
                  <span className="category-chip-count">{cat.productCount}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-left">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="filter-right">
            <div className="price-filters">
              <input
                type="number"
                placeholder="Giá từ"
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

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="default">Sắp xếp mặc định</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="name-asc">Tên A → Z</option>
              <option value="name-desc">Tên Z → A</option>
            </select>

            <button className="reset-filters-btn" onClick={handleResetFilters}>
              🔄 Đặt lại
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          <span className="results-count">
            Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
          </span>
          {selectedCategory && (
            <span className="results-category">
              trong danh mục <strong>{selectedCategory.name}</strong>
            </span>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="products-loading">
            <div className="loading-spinner"></div>
            <div>Đang tải sản phẩm...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <div className="no-products-icon">🔍</div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
            <button className="reset-filters-btn" onClick={handleResetFilters}>
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
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
                      className="product-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.querySelector('.product-image-fallback').style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="product-image-fallback" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                    🛍️
                  </div>
                  {product.discountPercent > 0 && (
                    <div className="product-discount">-{product.discountPercent}%</div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price-wrapper">
                    <span className="product-price">{formatVND(product.price)}</span>
                    {product.originalPrice && (
                      <span className="product-original-price">{formatVND(product.originalPrice)}</span>
                    )}
                  </div>
                  <div className="product-meta">
                    {typeof product.quantity === 'number' && (
                      <span className={`product-stock ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng'}
                      </span>
                    )}
                    {product.soldCount > 0 && (
                      <span className="product-sold">Đã bán {product.soldCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}