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

    try {
      const storedUsers = localStorage.getItem('mcrm_users');
      console.log('📦 Raw data from localStorage:', storedUsers);

      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        console.log('📋 Parsed users from localStorage:', parsedUsers);
        return parsedUsers;
      }
    } catch (error) {
      console.error('💥 Error loading users from localStorage:', error);
    }

    // 기본 사용자 목록 (fallback)
    const defaultUsers = [
      {
        user_id: '1',
        login_id: 'kim_agent',
        name: '김상담',
        email: 'kim.agent@clinic.com',
        role: '상담매니저',
        clinic_id: 'clinic1',
        password: 'password123'
      },
      {
        user_id: '2',
        login_id: 'lee_agent',
        name: '이상담',
        email: 'lee.agent@clinic.com',
        role: '상담매니저',
        clinic_id: 'clinic1',
        password: 'password123'
      },
      {
        user_id: '3',
        login_id: 'park_agent',
        name: '박상담',
        email: 'park.agent@clinic.com',
        role: '상담매니저',
        clinic_id: 'clinic2',
        password: 'password123'
      },
      {
        user_id: '4',
        login_id: 'choi_admin',
        name: '최관리자',
        email: 'choi.admin@clinic.com',
        role: '지점관리자',
        clinic_id: 'clinic1',
        password: 'admin123'
      }
    ];

    console.log('🔄 Using default fallback users:', defaultUsers);
    return defaultUsers;
  };

  const checkAuth = async () => {
    console.log('🔍 checkAuth called');
    try {
      // 토큰이 없으면 바로 리턴
      const token = localStorage.getItem('auth_token');
      console.log('🔑 Token from localStorage:', token);

      if (!token) {
        console.log('❌ No token found, setting user to null');
        setUser(null);
        setLoading(false);
        return;
      }

      // Mock implementation - token이 있으면 유효한 것으로 간주
      if (token.startsWith('mock_token_')) {
        const tokenParts = token.split('_');
        const userId = tokenParts.slice(2, -1).join('_'); // 마지막 timestamp 제외하고 userId 추출
        console.log('👤 Token parts:', tokenParts);
        console.log('👤 Extracted userId:', userId);

        // localStorage에서 동적으로 사용자 목록 가져오기
        const users = getStoredUsers();
        console.log('👥 Users from localStorage:', users);

        // 기본 사용자들의 비밀번호 설정 (localStorage의 사용자에 password가 없을 수 있음)
        const usersWithPasswords = users.map(user => ({
          ...user,
          password: user.password || (user.role === '지점관리자' ? 'admin123' : 'password123')
        }));

        const user = usersWithPasswords.find(u => u.user_id === userId);
        console.log('🎯 Found user:', user);

        if (user) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // password 제외한 사용자 데이터 설정
          const { password: _, ...userData } = user;
          setUser(userData);
          setError(null);
          console.log('✅ Auth check successful, user set:', userData.name);
        } else {
          console.log('❌ User not found in stored users');
          throw new Error('User not found');
        }
      } else {
        console.log('❌ Invalid token format');
        throw new Error('Invalid token format');
      }
    } catch (err) {
      console.error('💥 Auth check failed:', err);
      console.log('🗑️ Removing token due to auth failure');
      // 토큰 삭제 및 헤더 초기화
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setError(null); // 로그인 페이지에서는 에러 메시지를 표시하지 않음
    } finally {
      console.log('🏁 checkAuth finished, setting loading to false');
      setLoading(false);
    }
  };

  const login = async (loginId: string, password: string) => {
    try {
      console.log('🚀 Login attempt with:', { loginId });
      setLoading(true);
      setError(null);

      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      // localStorage에서 동적으로 사용자 목록 가져오기
      const users = getStoredUsers();
      console.log('📋 Users available for login:', users);

      // 기본 사용자들의 비밀번호 설정 (localStorage에 저장된 사용자는 이미 password가 있을 것)
      const usersWithPasswords = users.map(user => ({
        ...user,
        password: user.password || (user.role === '지점관리자' ? 'admin123' : 'password123')
      }));

      // Find user by login_id
      const user = usersWithPasswords.find(u => u.login_id === loginId);
      console.log('🔍 Found user for login:', user);

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      if (user.password !== password) {
        throw new Error('비밀번호가 틀렸습니다.');
      }

      // Mock token
      const token = `mock_token_${user.user_id}_${Date.now()}`;
      console.log('🎫 Generated token:', token);

      // Store token
      localStorage.setItem('auth_token', token);
      console.log('💾 Token stored in localStorage');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user data (without password)
      const { password: _, ...userData } = user;
      setUser(userData);
      setError(null);
      setLoading(false);

      console.log('✅ Login successful, user data set:', userData);

      // localStorage에 사용자 목록이 제대로 저장되어 있는지 확인
      const storedUsersAfterLogin = getStoredUsers();
      console.log('📝 Users in localStorage after login:', storedUsersAfterLogin);

      return true;
    } catch (err: any) {
      console.error('💥 Login failed:', err);
      setError(err.message || 'Login failed');
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
