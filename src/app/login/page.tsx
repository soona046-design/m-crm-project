'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, user } = useAuth();
  const router = useRouter();

  // 이미 로그인된 상태면 대시보드로 리다이렉션
  React.useEffect(() => {
    if (user) {
      router.replace('/dashboards/agent-performance');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting login form...');
      await login(loginId, password);
      console.log('Login successful, redirecting...');
      
      // 이전 페이지 정보 확인
      const previousPage = document.cookie
        .split('; ')
        .find(row => row.startsWith('previousPage='))
        ?.split('=')[1] || '/dashboards/agent-performance';
      
      // 쿠키에서 이전 페이지 정보 삭제
      document.cookie = 'previousPage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // 페이지 이동
      window.location.href = decodeURIComponent(previousPage);
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
