/**
 * File: ProductListPage.js
 * Chức năng: Component Trang danh sách sản phẩm (Shop). 
 * Sử dụng kiến trúc module với ShopSidebar, ShopHeader, ProductList.
 */
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import categoryApi from '../../core_modules/api/categoryApi';
import ShopSidebar from '../../components/shop/ShopSidebar';
import ShopHeader from '../../components/shop/ShopHeader';
import ProductList from '../../components/shop/ProductList';
import LoadingOverlay from '../../components/shop/LoadingOverlay';
import Breadcrumb from '../../components/Breadcrumb';
import '../../styles/ProductListPage.css';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State từ URL
  const categoryId = searchParams.get('categoryId') || '';
  const searchQuery = searchParams.get('search') || '';

  const setCategoryId = (id) => {
    const params = new URLSearchParams(searchParams);
    if (id) params.set('categoryId', id);
    else params.delete('categoryId');
    setSearchParams(params, { replace: true });
  };

  const setSearchQuery = (q) => {
    const params = new URLSearchParams(searchParams);
    if (q) params.set('search', q);
    else params.delete('search');
    setSearchParams(params, { replace: true });
  };
  
  // Các state filter khác (không nằm trên URL)
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // Dữ liệu danh mục
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  
  // Số lượng sản phẩm hiển thị (nhận từ ProductList)
  const [totalCount, setTotalCount] = useState(0);

  // Lấy danh mục
  useEffect(() => {
    categoryApi.getCategories()
      .then(res => {
        setCategories(Array.isArray(res) ? res : res?.data || []);
        setLoadingCats(false);
      })
      .catch(err => {
        console.error("Lỗi lấy danh mục", err);
        setLoadingCats(false);
      });
  }, []);

  const handleResetFilters = () => {
    setCategoryId('');
    setSearchQuery('');
    setSortBy('default');
    setPriceRange({ min: '', max: '' });
  };

  const activeCategoryObj = categories.find(c => `${c.id}` === categoryId);
  const categoryName = activeCategoryObj ? activeCategoryObj.name : '';

  const breadcrumbItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Sản phẩm', path: categoryName ? '/products' : null },
    categoryName && { label: categoryName }
  ].filter(Boolean);

  return (
    <div className="products-page">
      <LoadingOverlay isLoading={loadingCats} text="Đang chuẩn bị cửa hàng..." />
      
      <div className="products-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ width: '100%' }}>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Sidebar */}
        <div style={{ flex: '0 0 280px', minWidth: '250px' }}>
          <ShopSidebar 
            categories={categories}
            activeCategory={categoryId}
            onCategoryChange={setCategoryId}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onReset={handleResetFilters}
          />
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <ShopHeader 
            title="🛒 Sản phẩm"
            totalCount={totalCount}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <ProductList 
            categoryId={categoryId}
            searchQuery={searchQuery}
            priceRange={priceRange}
            sortBy={sortBy}
            setTotalCount={setTotalCount}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>
    </div>
  );
}