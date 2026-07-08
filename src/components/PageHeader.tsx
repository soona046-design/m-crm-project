'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  /** 우측 정렬 액션 영역 (버튼 등) */
  actions?: React.ReactNode;
  /** 타이틀 좌측 요소 (뒤로가기 등) */
  leading?: React.ReactNode;
}

/**
 * TDS 컴팩트 페이지 헤더 — 관리자 화면 밀도에 맞춰 타이틀은 18px/700로 작게,
 * 설명형 서브타이틀 없이 한 줄. 우측에 액션 슬롯.
 */
export default function PageHeader({ title, actions, leading }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        flexWrap: 'wrap',
        mb: 2,
        minHeight: 36,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {leading}
        <Typography
          component="h1"
          sx={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', color: 'text.primary' }}
        >
          {title}
        </Typography>
      </Box>
      {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{actions}</Box>}
    </Box>
  );
}
