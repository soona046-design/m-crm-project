'use client';

import React from 'react';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'; // Tickets
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // Appointments
import ShareIcon from '@mui/icons-material/Share'; // Channels
import PersonIcon from '@mui/icons-material/Person'; // Profiles
import SettingsIcon from '@mui/icons-material/Settings';
import EventNoteIcon from '@mui/icons-material/EventNote'; // Audit
import DeleteIcon from '@mui/icons-material/Delete'; // Trash
import AssessmentIcon from '@mui/icons-material/Assessment'; // Channel Pivot Analytics
import CategoryIcon from '@mui/icons-material/Category'; // Channel Management
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles'; // alpha 함수를 명시적으로 import

const drawerWidth = 240;
const collapsedDrawerWidth = 72; // GNB 접힘 너비

interface SideNavProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  currentDrawerWidth: number; // AppShell에서 계산된 드로어 너비
  isMobile: boolean; // AppShell에서 계산된 모바일 여부
  isTablet: boolean; // AppShell에서 계산된 태블릿 여부
  desktopCollapsed: boolean; // 데스크톱에서 GNB 접기 상태
  onDesktopToggle: () => void; // 데스크톱에서 GNB 접기/펼치기
}

export default function SideNav({ mobileOpen, onDrawerToggle, currentDrawerWidth, isMobile, isTablet, desktopCollapsed, onDesktopToggle }: SideNavProps) {
  const pathname = usePathname();
  const theme = useTheme();

  const isCollapsed = isTablet || desktopCollapsed;

  const navItems = [
    { text: '홈', icon: <HomeIcon />, href: '/' }, // 홈 대시보드
    { text: '문의', icon: <PeopleIcon />, href: '/leads' },
    { text: '상담', icon: <ConfirmationNumberIcon />, href: '/tickets' },
    { text: '예약', icon: <CalendarMonthIcon />, href: '/appointments' },
    { text: '채널 피벗', icon: <AssessmentIcon />, href: '/channel-pivot' },
    { text: '에이전트 성과', icon: <PeopleIcon />, href: '/agent-performance' },
    { text: '퍼널 분석', icon: <AssessmentIcon />, href: '/funnel' },
    { text: '광고 실적', icon: <AssessmentIcon />, href: '/ad-performance' },
    { text: '채널', icon: <ShareIcon />, href: '/channels' },
    { text: '채널 관리', icon: <CategoryIcon />, href: '/settings/channels' },
    { text: '휴지통', icon: <DeleteIcon />, href: '/trash' },
    { text: '프로필', icon: <PersonIcon />, href: '/profiles' },
    { text: '설정', icon: <SettingsIcon />, href: '/settings' },
    { text: '활동기록', icon: <EventNoteIcon />, href: '/audit' },
  ];

  const drawerContent = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'auto',
      width: currentDrawerWidth,
      flexShrink: 0, // 너비가 줄어드는 것을 방지
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      })
    }}>
      <Toolbar /> {/* TopBar 높이만큼 여백 */}
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <Tooltip title={isCollapsed ? item.text : ''} placement="right" key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                aria-current={pathname === item.href ? 'page' : undefined} // 현재 라우트 활성화 시 aria-current 적용
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  },
                  minHeight: '48px', // 최소 높이 설정
                  justifyContent: isCollapsed ? 'center' : 'flex-start', // 접힘 모드에서 중앙 정렬
                }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? 'auto' : '40px', justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={item.text} sx={{ ml: 1 }} />}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Box>
  );

  return (
    <nav>
      {/* 모바일용 드로어 */}
      <Drawer
        variant="temporary"
        open={mobileOpen && isMobile}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
          'aria-modal': true, // 접근성 개선
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* 데스크톱/태블릿용 드로어 */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: currentDrawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </nav>
  );
}