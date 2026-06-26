import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductSection.css';
import ProductGridCard from './ProductGridCard';

export default function ProductGridSection({
  title,
  subtitle,
  badgeText,
  badgeVariant,
  loadProducts,
  mapCardProps,
  footerTo = '/products',
  footerText = 'Xem tất cả sản phẩm →',
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await loadProducts();
        if (!mounted) return;
        setProducts(Array.isArray(data) ? data : data?.data || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [loadProducts]);

  if (loading) return <div className="section-loading">Đang tải...</div>;

  return (
    <section className="product-section">
      <div className="section-header">
        {badgeText ? <span className={`section-badge ${badgeVariant || ''}`}>{badgeText}</span> : null}
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
      </div>

      <div className="product-grid">
        {products.slice(0, 3).map((product, index) => {
          const extra = typeof mapCardProps === 'function' ? mapCardProps(product, index) : {};
          return <ProductGridCard key={product.id} product={product} {...extra} />;
        })}
      </div>

      <div className="section-footer">
        <Link to={footerTo} className="view-all-btn">
          {footerText}
        </Link>
      </div>
    </section>
  );
}

