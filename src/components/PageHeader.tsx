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
 * Insight 컴팩트 페이지 헤더 — 섹션 타이틀 18px Bold(-0.3px), 관리자 밀도에 맞춰
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
          sx={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.017em', color: 'text.primary' }}
        >
          {title}
        </Typography>
      </Box>
      {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{actions}</Box>}
    </Box>
  );
}
