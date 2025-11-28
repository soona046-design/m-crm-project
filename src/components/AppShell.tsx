'use client';

import React from 'react';
import Box from '@mui/material/Box';
import TopBar from './TopBar'; // 우리가 만든 TopBar 컴포넌트
import SideNav from './SideNav'; // 우리가 만든 SideNav 컴포넌트
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CircularProgress } from '@mui/material';

const drawerWidth = 240;
const collapsedDrawerWidth = 72; // GNB 접힘 너비

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(false); // 데스크톱에서 GNB 접기 상태
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 768-1279px
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <768px
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopToggle = () => {
    setDesktopCollapsed(!desktopCollapsed);
  };

  const currentDrawerWidth = (isTablet || desktopCollapsed) ? collapsedDrawerWidth : drawerWidth;

  // 로그인 페이지는 AppShell 없이 렌더링
  const isLoginPage = pathname === '/login';

  // 로그인 페이지가 아닌데 로딩 중이면 로딩 표시
  if (!isLoginPage && loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 로그인 페이지는 AppShell 없이 렌더링
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <TopBar
        onMenuClick={isMobile ? handleDrawerToggle : handleDesktopToggle}
        isMobile={isMobile}
      />
      <SideNav
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        currentDrawerWidth={currentDrawerWidth}
        isMobile={isMobile}
        isTablet={isTablet}
        desktopCollapsed={desktopCollapsed}
        onDesktopToggle={handleDesktopToggle}
      />
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
          maxWidth: (isTablet || desktopCollapsed) ? '100%' : {
            xs: '100%',
            md: '1280px', // 기본 컨테이너 1280px
            lg: '1440px' // 대시보드 1440px
          },
          mx: 'auto', // 가운데 정렬
          transition: theme.transitions.create(['margin', 'width', 'max-width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* <Toolbar /> 주석 처리: TopBar 컴포넌트 내부에 Toolbar를 포함 */}
        {children}
      </Box>
    </Box>
  );
}