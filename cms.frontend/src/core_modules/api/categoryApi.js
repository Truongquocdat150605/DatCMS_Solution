import axiosClient from '../http/axiosClient';  // 👈 đúng đường dẫn

const categoryApi = {
  getAll: () => axiosClient.get('CategoriesProducts'),  // 👈 BỎ /api/
  getById: (id) => axiosClient.get(`CategoriesProducts/${id}`),
  getCategories: function() {
    return this.getAll();
  }
};

export default categoryApi;