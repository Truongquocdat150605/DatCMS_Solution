import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    console.log('🔍 customerId từ localStorage:', customerId);
    
    if (!customerId) {
      console.log('❌ Không có customerId');
      setError('Vui lòng đăng nhập lại');
      setLoading(false);
      return;
    }

    const url = `https://localhost:7048/api/Orders/customer/${customerId}`;
    console.log('🌐 Gọi API:', url);

    fetch(url)
      .then(res => {
        console.log('📡 Response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('✅ Dữ liệu nhận được:', data);
        console.log('📦 Là mảng không?', Array.isArray(data));
        const ordersList = Array.isArray(data) ? data : [];
        console.log('📋 Số đơn hàng:', ordersList.length);
        setOrders(ordersList);
        setError('');
      })
      .catch(err => {
        console.error('❌ Lỗi chi tiết:', err);
        setError(err.message);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{textAlign: 'center', padding: 50}}>Đang tải...</div>;
  if (error) return <div style={{textAlign: 'center', padding: 50, color: 'red'}}>Lỗi: {error}</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: 20 }}>
      <h2>📦 Lịch sử đơn hàng</h2>
      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: 12 }}>Mã đơn</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const total = order.orderDetails?.reduce((sum, d) => sum + (d.quantity * d.unitPrice), 0) || 0;
              return (
                <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: 12 }}>#{order.id}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                  <td>{total.toLocaleString()}đ</td>
                  <td>
                    {order.status === 0 ? '⏳ Chờ duyệt' : order.status === 1 ? '🚚 Đang giao' : '✅ Hoàn thành'}
                  </td>
                  <td>
                    <Link to={`/orders/${order.id}`} style={{ color: '#3b82f6' }}>Chi tiết</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}