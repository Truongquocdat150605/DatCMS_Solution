import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildImageUrl } from '../utils/imageUrl';

export default function ProductGridCard({ product, badge, badgeColor, extraLine }) {
  const [imgOk, setImgOk] = useState(true);

  const imgSrc = useMemo(() => {
    return product?.imageUrl ? buildImageUrl(product.imageUrl) : '';
  }, [product?.imageUrl]);

  return (
    <div className="product-card">
      {badge ? (
        <div className="product-badge" style={{ background: badgeColor || '#00d4ff' }}>
          {badge}
        </div>
      ) : null}

      <Link to={`/products/${product.id}`} className="product-img-link">
        {imgOk && imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="product-img"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="product-img-placeholder">🛍️</div>
        )}
      </Link>

      <div className="product-info">
        <span className="product-category">{product.categoryName || ''}</span>
        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="product-name">{product.name}</h3>
        </Link>

        <div className="product-meta">
          <span className="product-price">{Number(product.price || 0).toLocaleString('vi-VN')}₫</span>
          <span className={`product-stock ${product.stockQuantity < 5 ? 'low' : ''}`}>
            {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : '⚠️ Hết hàng'}
          </span>
        </div>

        {extraLine ? <div className="product-sold">{extraLine}</div> : null}
      </div>
    </div>
  );
}
