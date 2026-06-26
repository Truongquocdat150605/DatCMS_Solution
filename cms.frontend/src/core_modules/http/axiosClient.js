/**
 * File: axiosClient.js
 * Chức năng: Cấu hình trung tâm cho thư viện Axios (BaseURL, Header, Interceptors). 
 * Được dùng trong: Tất cả các file gọi API trong thư mục core_modules/api/
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7048';

const axiosClient = axios.create({
  baseURL: API_BASE_URL + '/api/', // Base path
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Gửi cookie (quan trọng cho xác thực)
});

// Interceptor cho Request: Cấu hình URL đầy đủ nếu cần, hoặc log request
axiosClient.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }
    console.log('🚀 Request URL:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Chỉ trả về data thay vì toàn bộ object Axios, và bắt lỗi chung
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
    console.error('HTTP error', error.response?.status, error.config?.url, error.response?.data);
    const data = error.response?.data;
    const isJson = error.response?.headers?.['content-type']?.includes('application/json');
    
    let message = 'Request failed';
    if (data) {
        message = (isJson && (data.message || data.title || data.error)) || 
                  (typeof data === 'string' ? data : JSON.stringify(data));
    } else {
        message = error.message;
    }
    
    throw new Error(message);
  }
);

export default axiosClient;
