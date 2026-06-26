// pages/PaymentCancelPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [status, setStatus] = useState('canceling');
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      navigate('/cart');
      return;
    }

    // Gọi API hủy đơn và trả lại tồn kho
    fetch(`https://localhost:7048/api/Orders/${orderId}/cancel-unpaid`, {
      method: 'POST',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setStatus('canceled');
      })
      .catch(err => {
        console.error('Lỗi khi hủy đơn:', err);
        setStatus('canceled'); // Dù lỗi mạng thì cũng coi như là đã ở trang hủy
      });
  }, [orderId, navigate]);

  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '20px' }}>
      {status === 'canceling' ? (
        <>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⏳</div>
          <h2>Đang hủy giao dịch...</h2>
        </>
      ) : (
        <>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🚫</div>
          <h2 style={{ color: '#ef4444', fontSize: '28px', marginBottom: '10px' }}>Thanh toán đã bị hủy</h2>
          <p style={{ color: '#555', marginBottom: '20px' }}>
            Bạn đã hủy quá trình thanh toán trực tuyến. Đơn hàng tạm thời này đã được hệ thống xóa bỏ và sản phẩm vẫn nằm an toàn trong giỏ hàng của bạn.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <Link to="/checkout" style={{
              padding: '12px 24px', background: '#3b82f6', color: 'white',
              borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
            }}>
              Thanh toán lại
            </Link>
            <Link to="/cart" style={{
              padding: '12px 24px', background: '#f3f4f6', color: '#333',
              borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
            }}>
              Về giỏ hàng
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
