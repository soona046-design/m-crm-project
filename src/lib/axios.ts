import axios from 'axios';

// 저장된 토큰 가져오기
const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  },
  withCredentials: true,
  timeout: 10000,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('Response Error:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data
      });

      if (error.response.status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('auth_token');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('Network Error:', {
        url: error.config?.url,
        message: error.message
      });
    } else {
      // 요청 설정 중에 오류가 발생한 경우
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
