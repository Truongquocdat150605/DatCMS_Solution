// pages/PaymentSuccessPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');

  const [status, setStatus] = useState('loading'); // loading | success | pending

  useEffect(() => {
    // Nếu là COD thì không cần check gì thêm
    if (method === 'COD') {
      setStatus('success');
      return;
    }
    // Với PayOS/Stripe, check trạng thái thanh toán từ backend
    if (orderId) {
      fetch(`https://localhost:7048/api/Orders/${orderId}`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          if (data?.paymentStatus === 'Paid') {
            setStatus('success');
          } else {
            setStatus('pending');
          }
        })
        .catch(() => setStatus('pending'));
    }
  }, [orderId, method]);

  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '20px' }}>
      {status === 'loading' && (
        <>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⏳</div>
          <h2>Đang xác nhận thanh toán...</h2>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ color: '#22c55e', fontSize: '28px', marginBottom: '10px' }}>Đặt hàng thành công!</h2>
          <p style={{ color: '#555', marginBottom: '8px' }}>
            {method === 'COD'
              ? 'Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ xác nhận và giao hàng sớm nhất có thể.'
              : 'Thanh toán đã được xác nhận. Đơn hàng của bạn đang được xử lý!'}
          </p>
          {orderId && (
            <p style={{ background: '#f0fdf4', padding: '10px', borderRadius: '8px', fontWeight: 'bold', color: '#16a34a' }}>
              Mã đơn hàng: #{orderId}
            </p>
          )}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <Link to="/products" style={{
              padding: '12px 24px', background: '#3b82f6', color: 'white',
              borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
            }}>
              Tiếp tục mua sắm
            </Link>
            <Link to="/" style={{
              padding: '12px 24px', background: '#f3f4f6', color: '#333',
              borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
            }}>
              Về trang chủ
            </Link>
          </div>
        </>
      )}

      {status === 'pending' && (
        <>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ color: '#f59e0b' }}>Đang chờ xác nhận thanh toán</h2>
          <p style={{ color: '#555' }}>
            Nếu bạn đã thanh toán, hệ thống sẽ tự động cập nhật trạng thái đơn hàng trong vài giây.
          </p>
          {orderId && (
            <p style={{ background: '#fffbeb', padding: '10px', borderRadius: '8px', fontWeight: 'bold', color: '#d97706' }}>
              Mã đơn hàng: #{orderId}
            </p>
          )}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button onClick={() => window.location.reload()} style={{
              padding: '12px 24px', background: '#f59e0b', color: 'white',
              borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer'
            }}>
              Kiểm tra lại
            </button>
            <Link to="/" style={{
              padding: '12px 24px', background: '#f3f4f6', color: '#333',
              borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
            }}>
              Về trang chủ
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
