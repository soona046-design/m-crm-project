'use client';

import React from 'react';
import Box from '@mui/material/Box';
import TopBar from './TopBar'; // 우리가 만든 TopBar 컴포넌트
import SideNav from './SideNav'; // 우리가 만든 SideNav 컴포넌트
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const drawerWidth = 240;
const collapsedDrawerWidth = 72; // 태블릿 모드에서 GNB 접힘 너비

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 768-1279px
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <768px

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentDrawerWidth = isTablet ? collapsedDrawerWidth : drawerWidth;

  return (
    <Box sx={{ display: 'flex' }}>
      <TopBar onMenuClick={handleDrawerToggle} />
      <SideNav mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} currentDrawerWidth={currentDrawerWidth} isMobile={isMobile} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            xs: '100%',
            sm: `calc(100% - ${currentDrawerWidth}px)`
          },
          ml: {
            xs: 0,
            sm: `${currentDrawerWidth}px`
          },
          mt: { xs: '56px', sm: '64px' },
          backgroundColor: (theme) => theme.palette.background.default,
          minHeight: '100vh',
          maxWidth: {
            xs: '100%',
            md: '1280px', // 기본 컨테이너 1280px
            lg: isTablet ? `calc(100% - ${collapsedDrawerWidth}px)` : '1440px' // 대시보드 1440px, 태블릿 모드에서 max-width 조정
          },
          mx: 'auto', // 가운데 정렬
        }}
      >
        {/* <Toolbar /> 주석 처리: TopBar 컴포넌트 내부에 Toolbar를 포함 */}
        {children}
      </Box>
    </Box>
  );
}