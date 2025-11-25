import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  timeout: 30000, // 30초로 증가
});

// 요청 인터셉터 - 매 요청마다 최신 토큰을 읽어서 설정
api.interceptors.request.use(
  (config) => {
    // 매 요청마다 localStorage에서 토큰을 읽어옴
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
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

        // 쿠키도 삭제 (Mock 토큰이 남아있을 수 있음)
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // 현재 URL을 redirect 파라미터로 저장
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
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
