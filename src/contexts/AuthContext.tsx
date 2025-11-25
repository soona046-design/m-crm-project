'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

interface User {
  user_id: string;
  login_id: string;
  name: string;
  email: string;
  role: string;
  clinic_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (loginId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => false,
  logout: async () => {},
  checkAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // localStorage에서 사용자 목록을 가져오는 함수
  const getStoredUsers = () => {
    console.log('🗂️ getStoredUsers called');

    if (typeof window === 'undefined') {
      console.log('⚠️ window is undefined (SSR), returning empty array');
      return [];
    }

    // TODO: 백엔드 연동 시 실제 사용자 목록을 localStorage에 캐싱하는 로직 추가
    // 현재는 항상 기본 사용자 목록을 사용 (개발 중)

    // 기본 사용자 목록 (fallback) - 역할 기반 권한 시스템 적용
    const defaultUsers = [
      {
        user_id: 'admin',
        login_id: 'admin',
        name: '슈퍼관리자',
        email: 'admin@example.com',
        role: 'super_admin',
        clinic_id: null,
        password: 'admin123!@#'
      },
      {
        user_id: 'manager_seoul',
        login_id: 'manager_seoul',
        name: '서울지점 관리자',
        email: 'manager.seoul@example.com',
        role: 'branch_manager',
        clinic_id: 'clinic_seoul',
        password: 'manager123!@#'
      },
      {
        user_id: 'manager_busan',
        login_id: 'manager_busan',
        name: '부산지점 관리자',
        email: 'manager.busan@example.com',
        role: 'branch_manager',
        clinic_id: 'clinic_busan',
        password: 'manager123!@#'
      },
      {
        user_id: 'counselor1',
        login_id: 'counselor1',
        name: '김상담',
        email: 'counselor1@example.com',
        role: 'counselor',
        clinic_id: 'clinic_seoul',
        password: 'counselor123!@#'
      },
      {
        user_id: 'counselor2',
        login_id: 'counselor2',
        name: '이상담',
        email: 'counselor2@example.com',
        role: 'counselor',
        clinic_id: 'clinic_seoul',
        password: 'counselor123!@#'
      },
      {
        user_id: 'counselor3',
        login_id: 'counselor3',
        name: '박상담',
        email: 'counselor3@example.com',
        role: 'counselor',
        clinic_id: 'clinic_busan',
        password: 'counselor123!@#'
      },
      {
        user_id: 'marketer1',
        login_id: 'marketer1',
        name: '최마케터',
        email: 'marketer1@example.com',
        role: 'marketer',
        clinic_id: null,
        password: 'marketer123!@#'
      },
      {
        user_id: 'doctor1',
        login_id: 'doctor1',
        name: '홍원장',
        email: 'doctor1@example.com',
        role: 'doctor',
        clinic_id: 'clinic_seoul',
        password: 'doctor123!@#'
      }
    ];

    console.log('🔄 Using default fallback users:', defaultUsers);
    return defaultUsers;
  };

  const checkAuth = async () => {
    console.log('🔍 checkAuth called');
    try {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        console.log('❌ No token found');
        setUser(null);
        setLoading(false);
        return;
      }

      // TODO: 백엔드 DB 연결 후 실제 API 호출로 변경
      const USE_MOCK_AUTH = false; // false로 변경하면 실제 API 사용

      if (USE_MOCK_AUTH) {
        // Mock: token에서 user_id 추출
        if (token.startsWith('mock_token_')) {
          const tokenParts = token.split('_');
          const userId = tokenParts.slice(2, -1).join('_');

          const users = getStoredUsers();
          const user = users.find(u => u.user_id === userId);

          if (user) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const { password: _, ...userData } = user;
            setUser(userData);
            setError(null);
            console.log('✅ Mock auth check successful:', userData);
          } else {
            throw new Error('User not found');
          }
        } else {
          throw new Error('Invalid token format');
        }
      } else {
        // 실제 백엔드 API 호출
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/api/me');
        setUser(response.data.user);
        setError(null);
        console.log('✅ API auth check successful:', response.data.user);
      }
    } catch (err) {
      console.error('💥 Auth check failed:', err);
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginId: string, password: string) => {
    try {
      console.log('🚀 Login attempt with:', { loginId });
      setLoading(true);
      setError(null);

      // TODO: 백엔드 DB 연결 후 실제 API 호출로 변경
      // 현재는 Mock 방식으로 로그인 처리
      const USE_MOCK_LOGIN = false; // false로 변경하면 실제 API 사용

      if (USE_MOCK_LOGIN) {
        // Mock implementation for development
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

        const users = getStoredUsers();
        const user = users.find(u => u.login_id === loginId);

        if (!user) {
          throw new Error('사용자를 찾을 수 없습니다.');
        }

        if (user.password !== password) {
          throw new Error('비밀번호가 틀렸습니다.');
        }

        // Mock token
        const token = `mock_token_${user.user_id}_${Date.now()}`;
        localStorage.setItem('auth_token', token);

        // 쿠키에도 토큰 저장 (미들웨어가 서버 사이드에서 체크하기 위함)
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7일

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Set user data (without password)
        const { password: _, ...userData } = user;
        setUser(userData);
        setError(null);
        setLoading(false);

        console.log('✅ Mock login successful:', userData);
        return true;
      } else {
        // 실제 백엔드 API 호출
        const response = await api.post('/api/login', {
          login_id: loginId,
          password: password,
          device_name: 'web_browser',
        });

        const { token, user: userData } = response.data;
        localStorage.setItem('auth_token', token);

        // 쿠키에도 토큰 저장 (미들웨어가 서버 사이드에서 체크하기 위함)
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7일

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(userData);
        setError(null);
        setLoading(false);

        console.log('✅ API login successful:', userData);
        return true;
      }
    } catch (err: any) {
      console.error('💥 Login failed:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.login_id?.[0] || err.message || '로그인에 실패했습니다.';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
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
    console.log('🌟 AuthProvider useEffect triggered - calling checkAuth');
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
