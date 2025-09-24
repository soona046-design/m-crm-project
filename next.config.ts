import { type NextConfig } from 'next/types';

const nextConfig: NextConfig = {
  // 개발 서버에서 /api/* 경로의 요청을 Laravel 백엔드로 프록시하도록 설정
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*', // Laravel 백엔드 주소 (포트 8000으로 다시 변경!)
      },
    ];
  },
};

export default nextConfig;