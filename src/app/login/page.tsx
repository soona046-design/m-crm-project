'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';

function LoginForm() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, user} = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mock 토큰 제거 (실제 API로 전환 시 필요)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      // Mock 토큰인 경우 삭제
      if (token && token.startsWith('mock_token_')) {
        console.log('🧹 Mock 토큰 감지, 삭제합니다...');
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
  }, []);

  // 이미 로그인된 상태면 대시보드로 리다이렉션
  React.useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect') || '/dashboards';
      router.replace(redirect);
    }
  }, [user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting login form...');
      await login(loginId, password);
      console.log('Login successful, redirecting...');

      // URL 쿼리 파라미터 또는 쿠키에서 이전 페이지 정보 확인
      const redirectParam = searchParams.get('redirect');
      const cookiePage = document.cookie
        .split('; ')
        .find(row => row.startsWith('previousPage='))
        ?.split('=')[1];

      const redirectTo = redirectParam || cookiePage || '/dashboards';

      // 쿠키에서 이전 페이지 정보 삭제
      document.cookie = 'previousPage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // 페이지 이동
      window.location.href = decodeURIComponent(redirectTo);
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', err.response?.data);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          MCRM Admin
        </Typography>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            p: 3,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            required
            fullWidth
            id="login_id"
            label="아이디"
            name="login_id"
            autoComplete="username"
            autoFocus
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            disabled={loading}
          />
          <TextField
            required
            fullWidth
            name="password"
            label="비밀번호"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : '로그인'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <LoginForm />
    </Suspense>
  );
}
