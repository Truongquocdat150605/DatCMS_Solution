import React, { useCallback } from 'react';
import productApi from '../core_modules/api/productApi';
import ProductGridSection from './ProductGridSection';

export default function BestSellingProductsGrid() {
  const loadProducts = useCallback(() => productApi.getBestSelling(), []);

  return (
    <ProductGridSection
      title="Sản Phẩm Bán Chạy Nhất"
      subtitle="Được khách hàng tin tưởng và lựa chọn nhiều nhất"
      badgeText="🔥 BÁN CHẠY"
      badgeVariant="hot"
      loadProducts={loadProducts}
      mapCardProps={(product, index) => ({
        badge: index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : '🥉 #3',
        badgeColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
        extraLine: typeof product.totalSold === 'number' && product.totalSold > 0 ? `✅ Đã bán: ${product.totalSold} sản phẩm` : '',
      })}
    />
  );
}

