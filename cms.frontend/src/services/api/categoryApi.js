import httpClient from '../http/httpClient';  // 👈 đúng đường dẫn

const categoryApi = {
  getAll: () => httpClient.get('CategoriesProducts'),  // 👈 BỎ /api/
  getById: (id) => httpClient.get(`CategoriesProducts/${id}`),
  getCategories: function() {
    return this.getAll();
  }
};

export default categoryApi;