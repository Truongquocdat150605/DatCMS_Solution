// pages/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../core_modules/contexts/CartContext';
import { buildImageUrl } from '../../utils/imageUrl';
import '../../styles/CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [formData, setFormData] = useState({
    fullName: localStorage.getItem('fullName') || '',
    phone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      navigate('/cart');
    } else if (cartItems.length > 0) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, navigate]);

  // fallback to avoid stuck on loading if cart is empty on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cartItems.length === 0) navigate('/cart');
    }, 500);
    return () => clearTimeout(timer);
  }, [cartItems, navigate]);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = 30000;
  const grandTotal = totalPrice + shippingFee;

  const clearCartAndRedirect = (path) => {
    clearCart();
    navigate(path);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Chặn bấm liên tục (Spam Click / Network Lag)

    // Validate Nâng Cao (Strict Validation)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    
    if (!formData.fullName.trim()) {
      setError('❌ Họ và tên không được để trống!');
      return;
    }
    if (formData.fullName.trim().length < 2) {
      setError('❌ Họ và tên quá ngắn!');
      return;
    }
    if (!formData.phone.trim()) {
      setError('❌ Số điện thoại không được để trống!');
      return;
    }
    if (!phoneRegex.test(formData.phone)) {
      setError('❌ Số điện thoại không hợp lệ (Phải là số ĐT Việt Nam 10 số)!');
      return;
    }
    if (!formData.address.trim()) {
      setError('❌ Địa chỉ giao hàng không được để trống!');
      return;
    }
    if (formData.address.trim().length < 10) {
      setError('❌ Địa chỉ giao hàng phải có ít nhất 10 ký tự để Shipper dễ tìm!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const customerId = parseInt(localStorage.getItem('customerId') || '1');
    const payload = {
      customerId,
      notes: `${formData.notes} | Giao đến: ${formData.fullName} - SĐT: ${formData.phone} - ĐC: ${formData.address}`,
      paymentMethod,
      orderDetails: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price
      }))
    };

    try {
      // Bước 1: Tạo đơn hàng
      const orderRes = await fetch('https://localhost:7048/api/Orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi khi tạo đơn hàng.');
      }

      const orderData = await orderRes.json();
      const orderId = orderData.orderId;

      // Bước 2: Xử lý theo phương thức thanh toán
      if (paymentMethod === 'COD') {
        clearCartAndRedirect(`/payment-success?orderId=${orderId}&method=COD`);
        return;
      }

      // Với PayOS hoặc Stripe → gọi API lấy link thanh toán
      const endpoint = paymentMethod === 'PayOS'
        ? `https://localhost:7048/api/Payment/create-payos-link/${orderId}`
        : `https://localhost:7048/api/Payment/create-stripe-session/${orderId}`;

      const paymentRes = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include'
      });

      if (!paymentRes.ok) {
        const err = await paymentRes.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi khi tạo link thanh toán.');
      }

      const paymentData = await paymentRes.json();

      // Chuyển sang cổng thanh toán (Giỏ hàng chỉ được xóa khi thanh toán thành công)
      window.location.href = paymentData.paymentUrl;

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="checkout-loading">Đang tải...</div>;

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>🛒 Thanh toán đơn hàng</h1>
        <p>Vui lòng kiểm tra thông tin trước khi xác nhận</p>
      </div>

      <div className="checkout-body">
        {/* Cột trái: Form thông tin */}
        <div className="checkout-form-col">

          {/* Thông tin giao hàng */}
          <div className="checkout-card">
            <h3 className="checkout-card-title">📦 Thông tin giao hàng</h3>
            {error && <div className="checkout-error">⚠️ {error}</div>}
            <form id="checkout-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input type="text" required value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A" />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input type="tel" required value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0901234567" />
                </div>
              </div>
              <div className="form-group">
                <label>Địa chỉ nhận hàng *</label>
                <textarea required rows="2" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
              </div>
              <div className="form-group">
                <label>Ghi chú (Tuỳ chọn)</label>
                <textarea rows="2" value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú thêm cho shipper..." />
              </div>
            </form>
          </div>

          {/* Phương thức thanh toán */}
          <div className="checkout-card">
            <h3 className="checkout-card-title">💳 Phương thức thanh toán</h3>
            <div className="payment-methods">

              {/* COD */}
              <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')} />
                <div className="payment-option-icon">💵</div>
                <div className="payment-option-info">
                  <span className="payment-option-name">Tiền mặt (COD)</span>
                  <span className="payment-option-desc">Thanh toán khi nhận hàng</span>
                </div>
              </label>

              {/* PayOS QR */}
              <label className={`payment-option ${paymentMethod === 'PayOS' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="PayOS"
                  checked={paymentMethod === 'PayOS'}
                  onChange={() => setPaymentMethod('PayOS')} />
                <div className="payment-option-icon">📱</div>
                <div className="payment-option-info">
                  <span className="payment-option-name">Chuyển khoản QR (PayOS)</span>
                  <span className="payment-option-desc">Quét mã VietQR nhanh chóng, an toàn</span>
                </div>
              </label>

              {/* Stripe */}
              <label className={`payment-option ${paymentMethod === 'Stripe' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="Stripe"
                  checked={paymentMethod === 'Stripe'}
                  onChange={() => setPaymentMethod('Stripe')} />
                <div className="payment-option-icon">💳</div>
                <div className="payment-option-info">
                  <span className="payment-option-name">Thẻ tín dụng / Thẻ ghi nợ (Stripe)</span>
                  <span className="payment-option-desc">Visa, Mastercard, JCB...</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Cột phải: Tóm tắt đơn hàng */}
        <div className="checkout-summary-col">
          <div className="checkout-card checkout-summary">
            <h3 className="checkout-card-title">🧾 Đơn hàng của bạn</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="summary-item-left">
                    {item.image && <img src={buildImageUrl(item.image)} alt={item.name} />}
                    <div>
                      <span className="summary-item-name">{item.name}</span>
                      <span className="summary-item-qty">x{item.quantity}</span>
                    </div>
                  </div>
                  <span className="summary-item-price">{(item.price * item.quantity).toLocaleString()}đ</span>
                </div>
              ))}
            </div>
            <div className="summary-line">
              <span>Tạm tính</span>
              <span>{totalPrice.toLocaleString()}đ</span>
            </div>
            <div className="summary-line">
              <span>Phí vận chuyển</span>
              <span>{shippingFee.toLocaleString()}đ</span>
            </div>
            <div className="summary-line total">
              <span>Tổng cộng</span>
              <span>{grandTotal.toLocaleString()}đ</span>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={isSubmitting}
              className={`checkout-submit-btn ${paymentMethod !== 'COD' ? 'online-pay' : ''}`}
            >
              {isSubmitting ? (
                <><span className="spinner"></span> Đang xử lý...</>
              ) : paymentMethod === 'COD' ? (
                '✅ XÁC NHẬN ĐẶT HÀNG (COD)'
              ) : paymentMethod === 'PayOS' ? (
                '📱 THANH TOÁN BẰNG PAYOS'
              ) : (
                '💳 THANH TOÁN BẰNG THẺ'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
