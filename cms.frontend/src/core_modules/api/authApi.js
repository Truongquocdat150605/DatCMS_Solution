import axiosClient from '../http/axiosClient';

const authApi = {
  me: () => axiosClient.get('Auth/me'),
  login: (username, password) => axiosClient.post('Auth/login', { username, password }),
  logout: () => axiosClient.post('Auth/logout'),
  customerRegister: (data) => axiosClient.post('Auth/CustomerRegister', data),
  customerLogin: (email, password) => axiosClient.post('Auth/CustomerLogin', { email, password }),
  sendOtp: (email) => axiosClient.post('Auth/send-otp', { email }),
  verifyOtp: (email, otp) => axiosClient.post('Auth/verify-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) =>
    axiosClient.post('Auth/reset-password', { email, otp, newPassword }),
  changePassword: (email, currentPassword, newPassword) =>
    axiosClient.post('Auth/change-password', { email, currentPassword, newPassword }),
};

export default authApi;
export { authApi };
