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
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        대시보드 목록
      </Typography>
      {dashboards.map((dashboard) => (
        <MuiLink component={Link} href={dashboard.path} key={dashboard.path} sx={{ textDecoration: 'none', width: '100%', maxWidth: 600 }}>
          <Card raised sx={{ '&:hover': { boxShadow: 6 } }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {dashboard.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboard.description}
              </Typography>
            </CardContent>
          </Card>
        </MuiLink>
      ))}
    </Box>
  );
};

export default DashboardsPage;
