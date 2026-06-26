// pages/CartPage.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../core_modules/contexts/CartContext';
import { buildImageUrl } from '../../utils/imageUrl';

function formatVND(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = totalPrice > 2000000 ? 0 : 30000;

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>🛒</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
          Giỏ hàng của bạn đang trống
        </h2>
        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px' }}>
          Hãy khám phá các sản phẩm linh kiện PC tuyệt vời của chúng tôi!
        </p>
        <Link
          to="/products"
          style={{
            display: 'inline-block', padding: '14px 32px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white', textDecoration: 'none',
            borderRadius: '40px', fontWeight: '600', fontSize: '16px',
            boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
          }}
        >
          Tiếp tục mua sắm →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b' }}>
        <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Trang chủ</Link>
        {' › '}
        <span style={{ color: '#1e293b', fontWeight: '600' }}>Giỏ hàng ({cartItems.length} sản phẩm)</span>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '32px' }}>
        🛒 Giỏ hàng của bạn
      </h1>

      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Danh sách sản phẩm */}
        <div style={{ flex: 2, minWidth: '300px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', padding: '16px' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>Sản phẩm</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Đơn giá</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Số lượng</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Thành tiền</th>
                  <th style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: idx < cartItems.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                          {item.image
                            ? <img src={buildImageUrl(item.image)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🛍️</div>
                          }
                        </div>
                        <Link to={`/products/${item.id}`} style={{ textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '14px', lineHeight: '1.4' }}>
                          {item.name}
                        </Link>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: '#ef4444', fontWeight: '700', fontSize: '14px' }}>
                      {formatVND(item.price)}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}>
                          −
                        </button>
                        <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}>
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>
                      {formatVND(item.price * item.quantity)}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <button onClick={() => removeFromCart(item.id)}
                        style={{ 
                          background: '#fee2e2', border: 'none', cursor: 'pointer', 
                          fontSize: '14px', fontWeight: '600', color: '#ef4444', 
                          padding: '6px 12px', borderRadius: '6px', transition: 'all 0.2s',
                          display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.color = '#dc2626'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                        title="Xóa sản phẩm"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/products"
              style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← Tiếp tục mua sắm
            </Link>
            <button onClick={() => {
                if(window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
                  clearCart();
                }
              }}
              style={{
                background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1',
                padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            >
              🗑️ Xóa tất cả
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div style={{ flex: '0 0 340px', minWidth: '280px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              Tóm tắt đơn hàng
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: '#64748b' }}>Tạm tính ({cartItems.length} sản phẩm)</span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatVND(totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: '#64748b' }}>Phí vận chuyển</span>
              <span style={{ fontWeight: '600', color: shippingFee === 0 ? '#16a34a' : '#1e293b' }}>
                {shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}
              </span>
            </div>
            {shippingFee === 0 && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                🎉 Bạn được miễn phí vận chuyển!
              </div>
            )}
            {shippingFee > 0 && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#2563eb' }}>
                💡 Mua thêm {formatVND(2000000 - totalPrice)} để được miễn phí vận chuyển
              </div>
            )}

            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '16px', marginTop: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Tổng cộng</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>{formatVND(totalPrice + shippingFee)}</span>
            </div>

            <button onClick={() => navigate('/checkout')}
              style={{
                width: '100%', padding: '16px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '16px', fontWeight: '700', cursor: 'pointer',
                transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(59,130,246,0.3)'; }}
            >
              Tiến hành thanh toán →
            </button>

            {/* Security badges */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '16px', color: '#94a3b8', fontSize: '12px' }}>
              <span>🔒 Thanh toán an toàn</span>
              <span>🛡️ Bảo hành chính hãng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}