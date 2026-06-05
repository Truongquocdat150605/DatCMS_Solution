// pages/CartPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy giỏ hàng từ localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  // Lưu giỏ hàng vào localStorage
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Cập nhật số lượng
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    saveCart(newCart);
  };

  // Xóa sản phẩm khỏi giỏ
  const removeItem = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    saveCart(newCart);
  };

  // Tính tổng tiền
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải...</div>;
  }

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>🛒 Giỏ hàng của bạn đang trống</h2>
        <p>Hãy tiếp tục mua sắm nào!</p>
        <Link to="/products" style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '12px 24px',
          background: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px'
        }}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>🛒 Giỏ hàng của bạn</h1>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Danh sách sản phẩm */}
        <div style={{ flex: 2 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Sản phẩm</th>
                <th style={{ padding: '12px' }}>Giá</th>
                <th style={{ padding: '12px' }}>Số lượng</th>
                <th style={{ padding: '12px' }}>Thành tiền</th>
                <th style={{ padding: '12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {item.image && (
                        <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                      )}
                      <div>
                        <Link to={`/products/${item.id}`} style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>
                          {item.name}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{item.price.toLocaleString()}đ</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '40px', textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#d32f2f' }}>
                    {(item.price * item.quantity).toLocaleString()}đ
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '18px' }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tổng kết đơn hàng */}
        <div style={{ flex: 1, background: '#f8f9fa', padding: '20px', borderRadius: '12px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '20px' }}>Tổng kết đơn hàng</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span>Tạm tính:</span>
            <span>{totalPrice.toLocaleString()}đ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span>Phí vận chuyển:</span>
            <span>30,000đ</span>
          </div>
          <hr style={{ margin: '15px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
            <span>Tổng cộng:</span>
            <span style={{ color: '#d32f2f' }}>{(totalPrice + 30000).toLocaleString()}đ</span>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            style={{
            width: '100%',
            padding: '15px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Tiến hành thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}