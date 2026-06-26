import React from 'react';

export default function ShopSidebar({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  priceRange, 
  onPriceChange,
  searchQuery,
  onSearchChange,
  onReset 
}) {
  return (
    <div className="shop-sidebar" style={{
      background: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      height: 'fit-content'
    }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
        Bộ lọc sản phẩm
      </h3>

      {/* Tìm kiếm */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
          Tìm kiếm
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nhập tên sản phẩm..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Danh mục */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
          Danh mục
        </label>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li 
            onClick={() => onCategoryChange('')}
            style={{ 
              padding: '0.5rem', 
              cursor: 'pointer', 
              borderRadius: '0.5rem',
              marginBottom: '0.25rem',
              background: activeCategory === '' ? '#eff6ff' : 'transparent',
              color: activeCategory === '' ? '#2563eb' : '#475569',
              fontWeight: activeCategory === '' ? 'bold' : 'normal'
            }}
          >
            Tất cả sản phẩm
          </li>
          {categories.map(cat => (
            <li 
              key={cat.id}
              onClick={() => onCategoryChange(cat.id.toString())}
              style={{ 
                padding: '0.5rem', 
                cursor: 'pointer', 
                borderRadius: '0.5rem',
                marginBottom: '0.25rem',
                background: activeCategory === cat.id.toString() ? '#eff6ff' : 'transparent',
                color: activeCategory === cat.id.toString() ? '#2563eb' : '#475569',
                fontWeight: activeCategory === cat.id.toString() ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {cat.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Khoảng giá */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
          Khoảng giá (VNĐ)
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Từ"
            value={priceRange.min}
            onChange={(e) => onPriceChange({ ...priceRange, min: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              outline: 'none'
            }}
          />
          <span style={{ color: '#94a3b8' }}>-</span>
          <input
            type="number"
            placeholder="Đến"
            value={priceRange.max}
            onChange={(e) => onPriceChange({ ...priceRange, max: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Reset */}
      <button 
        onClick={onReset}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#f1f5f9',
          color: '#475569',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
      >
        Xoá bộ lọc
      </button>
    </div>
  );
}
