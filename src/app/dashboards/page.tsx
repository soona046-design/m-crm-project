import React from 'react';
import { Box, Card, CardContent, Typography, Link as MuiLink } from '@mui/material';
import Link from 'next/link';

const dashboards = [
  { name: '에이전트 성과', description: '에이전트별 성과 지표를 확인합니다.', path: '/dashboards/agent-performance' },
  { name: '채널 피벗', description: '채널별 데이터 분석 및 성과를 확인합니다.', path: '/dashboards/channel-pivot' },
  { name: '퍼널 분석', description: '고객 유입 퍼널 및 전환율을 분석합니다.', path: '/dashboards/funnel' },
];

const DashboardsPage = () => {
  return (
    // TDS: 좌측 정렬 헤딩 + 평면 카드 목록 (hover는 그림자 대신 표면 변화)
    <Box sx={{ py: { xs: 0, md: 1 }, display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 720, mx: 'auto' }}>
      <Typography component="h1" sx={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', mb: 1 }}>
        대시보드
      </Typography>
      {dashboards.map((dashboard) => (
        <MuiLink component={Link} href={dashboard.path} key={dashboard.path} sx={{ textDecoration: 'none', width: '100%' }}>
          <Card
            sx={{
              transition: 'background-color 200ms cubic-bezier(0.22,0.61,0.36,1)',
              '&:hover': { backgroundColor: 'var(--grey-50)' },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>
                  {dashboard.name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
                  {dashboard.description}
                </Typography>
              </Box>
              <Typography sx={{ color: 'var(--grey-400)', fontSize: 20, lineHeight: 1 }}>›</Typography>
            </CardContent>
          </Card>
        </MuiLink>
      ))}
    </Box>
  );
};

export default DashboardsPage;
