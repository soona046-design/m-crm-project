'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  clinic_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      // 토큰이 없으면 바로 리턴
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // 토큰이 있으면 API 호출
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/api/me');
      
      if (response.data.user) {
        setUser(response.data.user);
        setError(null);
      } else {
        throw new Error('No user data received');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      // 토큰 삭제 및 헤더 초기화
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setError(null); // 로그인 페이지에서는 에러 메시지를 표시하지 않음
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginId: string, password: string) => {
    try {
      console.log('Login attempt with:', { loginId });
      setLoading(true);
      setError(null);

      // CSRF 토큰 가져오기
      await api.get('/sanctum/csrf-cookie');

      const response = await api.post('/api/login', {
        login_id: loginId,
        password,
        device_name: navigator.userAgent,
      });
      
      console.log('Login response:', response.data);
      
      // 토큰 저장
      const token = response.data.token;
      if (token) {
        console.log('Setting auth token...');
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // 쿠키에 토큰 저장
        document.cookie = `auth_token=${token}; path=/; secure; sameSite=strict`;
        localStorage.setItem('auth_token', token);
      } else {
        console.error('No token received in login response');
        throw new Error('No authentication token received');
      }

      const userData = response.data.user;
      if (!userData) {
        console.error('No user data received in login response');
        throw new Error('No user data received');
      }

      console.log('Setting user data:', userData);
      setUser(userData);
      setError(null);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 토큰이 있으면 서버에 로그아웃 요청
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await api.post('/api/logout');
        } catch (err) {
          console.warn('Server logout failed, but continuing with local logout');
        }
      }
      
      // 로컬 상태 및 쿠키 초기화
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('auth_token');
      
      // 쿠키 삭제
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      console.log('Logout successful');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.response?.data?.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
