import React from 'react';

export default function ShopHeader({ title, totalCount, sortBy, onSortChange }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
      borderRadius: '1.5rem',
      padding: '2rem',
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
      border: '1px solid #bfdbfe'
    }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: '0 0 0.5rem 0' }}>
          {title}
        </h1>
        <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem' }}>
          Khám phá các linh kiện máy tính chính hãng giá tốt nhất
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{
          background: 'rgba(59,130,246,0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '2rem',
          fontSize: '0.85rem',
          color: '#2563eb',
          fontWeight: '600',
          border: '1px solid rgba(59,130,246,0.2)'
        }}>
          📦 Tổng: {totalCount} sản phẩm
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>Sắp xếp:</label>
          <select 
            value={sortBy} 
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              outline: 'none',
              cursor: 'pointer',
              color: '#1e293b',
              fontWeight: '500'
            }}
          >
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="name-asc">Tên: A-Z</option>
            <option value="name-desc">Tên: Z-A</option>
            <option value="latest">Mới nhất</option>
          </select>
        </div>
      </div>
    </div>
  );
}
