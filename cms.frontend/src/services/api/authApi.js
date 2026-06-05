import httpClient from '../http/httpClient';

const authApi = {
  me: () => httpClient.get('Auth/me'),
  login: (username, password) => httpClient.post('Auth/login', { username, password }),
  logout: () => httpClient.post('Auth/logout'),
  customerRegister: (data) => httpClient.post('Auth/CustomerRegister', data),
  customerLogin: (email, password) => httpClient.post('Auth/CustomerLogin', { email, password }),
};

export default authApi;
export { authApi };
