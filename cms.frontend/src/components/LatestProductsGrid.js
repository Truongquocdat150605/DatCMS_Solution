import React, { useCallback } from 'react';
import productApi from '../core_modules/api/productApi';
import ProductGridSection from './ProductGridSection';

export default function LatestProductsGrid() {
  const loadProducts = useCallback(() => productApi.getLatest(), []);

  return (
    <ProductGridSection
      title="Sản Phẩm Mới Nhất"
      subtitle="Những sản phẩm mới nhất vừa về kho"
      badgeText="🆕 MỚI RA MẮT"
      badgeVariant="new"
      loadProducts={loadProducts}
      mapCardProps={() => ({ badge: 'NEW', badgeColor: '#00d4ff' })}
    />
  );
}

