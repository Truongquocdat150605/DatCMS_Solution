import httpClient from '../http/httpClient';  // 👈 đúng đường dẫn

const productApi = {
  getAll: () => httpClient.get('Products'),  // 👈 BỎ /api/
  getById: (id) => httpClient.get(`Products/${id}`),
  getByCategory: (categoryId) => httpClient.get(`Products/category/${categoryId}`)
};

export default productApi;