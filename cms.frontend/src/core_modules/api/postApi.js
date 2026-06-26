import axiosClient from '../http/axiosClient';  // 👈 đúng đường dẫn

const postApi = {
  getAll: () => axiosClient.get('Posts'),  // 👈 BỎ /api/
  getCategories: () => axiosClient.get('Categories'), // 👈 API danh mục bài viết
  getById: (id) => axiosClient.get(`Posts/${id}`),
  getByCategory: (categoryId) => axiosClient.get(`Posts/category/${categoryId}`),
  getLatest: (count = 3) => axiosClient.get(`Posts/latest?count=${count}`),
};

export default postApi;