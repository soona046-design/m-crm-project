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
    // TDS: 화이트 캔버스 + 단일 primary CTA — 로그인은 카드 없이 평면 화면으로
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: '24px', // screen gutter
      }}
    >
      <Container component="main" maxWidth="xs" disableGutters>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            pt: { xs: 10, sm: 14 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* 헤드라인 — 해요체, 좌측 정렬 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 0 }}>
              MCRM
            </Typography>
            <Typography variant="h2" component="h1" sx={{ mt: 1, color: 'text.primary' }}>
              다시 만나서 반가워요
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
              아이디와 비밀번호를 입력해 주세요
            </Typography>
          </Box>

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

          {/* XL primary CTA — 화면당 하나, 버튼은 일어날 일을 직접 말한다 */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : '로그인하기'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <LoginForm />
    </Suspense>
  );
}
