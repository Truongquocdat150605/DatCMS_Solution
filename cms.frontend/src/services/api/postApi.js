import httpClient from '../http/httpClient';  // 👈 đúng đường dẫn

const postApi = {
  getAll: () => httpClient.get('Posts'),  // 👈 BỎ /api/
  getById: (id) => httpClient.get(`Posts/${id}`),
};

export default postApi;