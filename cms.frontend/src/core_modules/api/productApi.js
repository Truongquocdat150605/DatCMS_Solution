/**
 * File: productApi.js
 * Chức năng: Định nghĩa các service gọi API liên quan đến quản lý Sản phẩm (lấy danh sách, chi tiết, nổi bật).
 * Được dùng trong: HomePage.js, ProductListPage.js, ProductDetailPage.js, và các Component hiển thị sản phẩm.
 */
import axiosClient from '../http/axiosClient';  // 👈 đúng đường dẫn

const productApi = {
  getAll: () => axiosClient.get('Products'),  // 👈 BỎ /api/
  getById: (id) => axiosClient.get(`Products/${id}`),
  getByCategory: (categoryId) => axiosClient.get(`Products/category/${categoryId}`),
  getLatest: () => axiosClient.get('Products/latest'),
  getBestSelling: () => axiosClient.get('Products/best-selling')
};

export default productApi;
