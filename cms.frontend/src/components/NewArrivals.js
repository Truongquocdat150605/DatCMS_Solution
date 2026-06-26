// components/NewArrivals.js
// Component hiển thị 3 sản phẩm mới nhất trên Homepage

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../core_modules/contexts/CartContext';
import productApi from '../core_modules/api/productApi';
import { buildImageUrl } from '../utils/imageUrl';
import './ProductSection.css';


export default function NewArrivals() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Gọi API lấy 3 sản phẩm mới nhất
        const fetchProducts = async () => {
            try {
                const res = await productApi.getLatest();
                // XỬ LÝ LINH HOẠT: kiểm tra cấu trúc response thực tế
                let productData = [];
                if (Array.isArray(res)) {
                    productData = res;
                } else if (res && Array.isArray(res.data)) {
                    productData = res.data;
                } else if (res && res.$values && Array.isArray(res.$values)) {
                    productData = res.$values;
                }
                setProducts(productData);
            } catch (err) {
                console.error('Lỗi tải sản phẩm mới:', err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <div className="section-loading">Đang tải sản phẩm mới...</div>;

    if (!products || products.length === 0) {
        return (
            <section className="product-section">
                <div className="section-header">
                    <span className="section-badge new">🆕 MỚI RA MẮT</span>
                    <h2 className="section-title">Sản Phẩm Mới Nhất</h2>
                    <p className="section-subtitle">Chưa có sản phẩm nào</p>
                </div>
            </section>
        );
    }

    return (
        <section className="product-section">
            <div className="section-header">
                <span className="section-badge new">🆕 MỚI RA MẮT</span>
                <h2 className="section-title">Sản Phẩm Mới Nhất</h2>
                <p className="section-subtitle">Những sản phẩm công nghệ mới nhất vừa về kho</p>
            </div>

            <div className="product-grid">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} badge="NEW" badgeColor="#00d4ff" />
                ))}
            </div>

            <div className="section-footer">
                <Link to="/products" className="view-all-btn">Xem tất cả sản phẩm →</Link>
            </div>
        </section>
    );
}

// components/BestSellers.js
export function BestSellers() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productApi.getBestSelling();
                let productData = [];
                if (Array.isArray(res)) {
                    productData = res;
                } else if (res && Array.isArray(res.data)) {
                    productData = res.data;
                } else if (res && res.$values && Array.isArray(res.$values)) {
                    productData = res.$values;
                }
                setProducts(productData);
            } catch (err) {
                console.error('Lỗi tải sản phẩm bán chạy:', err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <div className="section-loading">Đang tải sản phẩm bán chạy...</div>;

    if (!products || products.length === 0) {
        return (
            <section className="product-section">
                <div className="section-header">
                    <span className="section-badge hot">🔥 BÁN CHẠY</span>
                    <h2 className="section-title">Sản Phẩm Bán Chạy Nhất</h2>
                    <p className="section-subtitle">Chưa có dữ liệu đơn hàng</p>
                </div>
            </section>
        );
    }

    return (
        <section className="product-section">
            <div className="section-header">
                <span className="section-badge hot">🔥 BÁN CHẠY</span>
                <h2 className="section-title">Sản Phẩm Bán Chạy Nhất</h2>
                <p className="section-subtitle">Được khách hàng tin tưởng và lựa chọn nhiều nhất</p>
            </div>

            <div className="product-grid">
                {products.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        badge={index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : '🥉 #3'}
                        badgeColor={index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32'}
                        totalSold={product.totalSold}
                    />
                ))}
            </div>

            <div className="section-footer">
                <Link to="/products" className="view-all-btn">Xem tất cả sản phẩm →</Link>
            </div>
        </section>
    );
}

function ProductCard({ product, badge, badgeColor, totalSold }) {
    const { addToCart } = useCart();
    return (
        <div className="product-card">
            <div className="product-badge" style={{ background: badgeColor }}>
                {badge}
            </div>

            <Link to={`/products/${product.id}`} className="product-img-link">
                <img
                    src={product.imageUrl ? buildImageUrl(product.imageUrl) : `https://placehold.co/400x300/1a1a2e/64ffda?text=${encodeURIComponent(product.name)}`}
                    alt={product.name}
                    className="product-img"
                    onError={e => {
                        e.target.src = `https://placehold.co/400x300/1a1a2e/64ffda?text=${encodeURIComponent(product.name)}`;
                    }}
                />
            </Link>


            <div className="product-info">
                <span className="product-category">{product.categoryName}</span>
                <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="product-name">{product.name}</h3>
                </Link>

                <div className="product-meta">
                    <span className="product-price">
                        {Number(product.price).toLocaleString('vi-VN')}₫
                    </span>
                    <span className={`product-stock ${product.stockQuantity < 5 ? 'low' : ''}`}>
                        {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : '⚠️ Hết hàng'}
                    </span>
                </div>

                {totalSold > 0 && (
                    <div className="product-sold">✅ Đã bán: {totalSold} sản phẩm</div>
                )}

                <button
                    className="add-to-cart-btn"
                    disabled={product.stockQuantity === 0}
                    onClick={() => {
                        addToCart({ ...product, quantity: product.stockQuantity }, 1);
                    }}
                >
                    {product.stockQuantity > 0 ? '🛒 Thêm vào giỏ' : 'Hết hàng'}
                </button>
            </div>
        </div>
    );
}