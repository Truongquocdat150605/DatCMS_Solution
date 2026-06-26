/**
 * File: CartContext.js
 * Chức năng: Quản lý trạng thái Giỏ hàng (Cart) toàn cục bằng Context API.
 *           - Đồng bộ với localStorage.
 *           - Kiểm tra số lượng tồn kho (StockQuantity).
 * Được dùng trong: App.js (để bọc toàn ứng dụng), Header.js (hiển thị số lượng), 
 *                  ProductDetailPage.js (thêm vào giỏ), CartPage.js (cập nhật/xoá).
 */
import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        console.error("Lỗi parse giỏ hàng:", e);
        return [];
      }
    }
    return [];
  });
  const [toastMsg, setToastMsg] = useState(null);

  // Lưu vào localStorage mỗi khi cartItems thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const showToast = (msg, isError = false) => {
    setToastMsg({ msg, isError });
    setTimeout(() => setToastMsg(null), 3000);
  };

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {Object} product Đối tượng sản phẩm
   * @param {number} quantity Số lượng cần thêm
   * @returns {boolean} Thành công hay thất bại
   */
  const addToCart = (product, quantity = 1) => {
    // Kiểm tra số lượng tồn kho (backend có thể trả về stockQuantity hoặc quantity)
    const stockQuantity = product.stockQuantity ?? product.quantity ?? 0;
    
    // Đọc giỏ hàng hiện tại đồng bộ
    const existingItem = cartItems.find(item => item.id === product.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const newTotalQty = currentQtyInCart + quantity;
      
    // Chặn nếu vượt quá tồn kho
    if (newTotalQty > stockQuantity) {
      showToast(`❌ Không thể thêm! Sản phẩm "${product.name}" chỉ còn ${stockQuantity} trong kho.`, true);
      return false; // Thất bại
    }

    setCartItems(prev => {
      showToast(`✅ Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: newTotalQty }
            : item
        );
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.imageUrl,
          stockQuantity: stockQuantity,
          quantity: quantity
        }];
      }
    });
    return true; // Thành công
  };

  /**
   * Cập nhật số lượng của một sản phẩm trong giỏ
   * @param {number} productId ID sản phẩm
   * @param {number} newQuantity Số lượng mới
   */
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) return;

    setCartItems(prev => {
      const item = prev.find(i => i.id === productId);
      if (!item) return prev;

      // Kiểm tra tồn kho
      if (newQuantity > item.stockQuantity) {
        showToast(`❌ Không đủ hàng! Chỉ còn ${item.stockQuantity} sản phẩm.`, true);
        return prev;
      }

      return prev.map(i => i.id === productId ? { ...i, quantity: newQuantity } : i);
    });
  };

  /**
   * Xoá một sản phẩm khỏi giỏ
   * @param {number} productId ID sản phẩm
   */
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(i => i.id !== productId));
    showToast(`🗑️ Đã xoá sản phẩm khỏi giỏ.`);
  };

  /**
   * Xoá toàn bộ giỏ hàng
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // Tính tổng số lượng item để hiển thị trên icon giỏ hàng
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems
    }}>
      {children}
      {/* Toast Notification Đơn giản */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
          background: toastMsg.isError ? '#ffebee' : '#e8f5e9',
          color: toastMsg.isError ? '#c62828' : '#2e7d32',
          padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderLeft: `4px solid ${toastMsg.isError ? '#c62828' : '#2e7d32'}`,
          fontWeight: 500, fontSize: '15px'
        }}>
          {toastMsg.msg}
        </div>
      )}
    </CartContext.Provider>
  );
};
