'use client';

import React from 'react';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'; // Tickets
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // Appointments
import ShareIcon from '@mui/icons-material/Share'; // Channels
import PersonIcon from '@mui/icons-material/Person'; // Profiles
import SettingsIcon from '@mui/icons-material/Settings';
import EventNoteIcon from '@mui/icons-material/EventNote'; // Audit
import DeleteIcon from '@mui/icons-material/Delete'; // Trash
import AssessmentIcon from '@mui/icons-material/Assessment'; // Analytics
import TimelineIcon from '@mui/icons-material/Timeline'; // Funnel
import CampaignIcon from '@mui/icons-material/Campaign'; // Ad performance
import GroupsIcon from '@mui/icons-material/Groups'; // Agent performance
import CategoryIcon from '@mui/icons-material/Category'; // Channel Management
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { Box, Tooltip, Typography } from '@mui/material';

const drawerWidth = 240;

interface SideNavProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  currentDrawerWidth: number; // AppShell에서 계산된 드로어 너비
  isMobile: boolean; // AppShell에서 계산된 모바일 여부
  isTablet: boolean; // AppShell에서 계산된 태블릿 여부
  desktopCollapsed: boolean; // 데스크톱에서 GNB 접기 상태
  onDesktopToggle: () => void; // 데스크톱에서 GNB 접기/펼치기
}

// TDS GNB — 섹션 그룹핑 + list-header 캡션
const navSections: { header: string | null; items: { text: string; icon: React.ReactNode; href: string }[] }[] = [
  {
    header: null,
    items: [
      { text: '홈', icon: <HomeIcon />, href: '/' },
    ],
  },
  {
    header: '업무',
    items: [
      { text: '문의', icon: <PeopleIcon />, href: '/leads' },
      { text: '상담', icon: <ConfirmationNumberIcon />, href: '/tickets' },
      { text: '예약', icon: <CalendarMonthIcon />, href: '/appointments' },
    ],
  },
  {
    header: '분석',
    items: [
      { text: '채널 피벗', icon: <AssessmentIcon />, href: '/channel-pivot' },
      { text: '에이전트 성과', icon: <GroupsIcon />, href: '/agent-performance' },
      { text: '퍼널 분석', icon: <TimelineIcon />, href: '/funnel' },
      { text: '광고 실적', icon: <CampaignIcon />, href: '/ad-performance' },
    ],
  },
  {
    header: '관리',
    items: [
      { text: '채널', icon: <ShareIcon />, href: '/channels' },
      { text: '채널 관리', icon: <CategoryIcon />, href: '/settings/channels' },
      { text: '휴지통', icon: <DeleteIcon />, href: '/trash' },
      { text: '프로필', icon: <PersonIcon />, href: '/profiles' },
      { text: '설정', icon: <SettingsIcon />, href: '/settings' },
      { text: '활동기록', icon: <EventNoteIcon />, href: '/audit' },
    ],
  },
];

export default function SideNav({ mobileOpen, onDrawerToggle, currentDrawerWidth, isMobile, isTablet, desktopCollapsed, onDesktopToggle }: SideNavProps) {
  const pathname = usePathname();
  const theme = useTheme();

  const isCollapsed = isTablet || desktopCollapsed;

  const renderItem = (item: { text: string; icon: React.ReactNode; href: string }) => {
    const selected = pathname === item.href;
    return (
      <Tooltip title={isCollapsed ? item.text : ''} placement="right" key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href={item.href}
            selected={selected}
            aria-current={selected ? 'page' : undefined}
            sx={{
              // TDS: radius 12 필 형태, 선택 = blue-50 표면 + Toss Blue (보더/레일 없음)
              borderRadius: '12px',
              mx: '10px',
              my: '2px',
              minHeight: 44,
              px: isCollapsed ? 0 : '12px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              transition: 'background-color 120ms cubic-bezier(0.22,0.61,0.36,1)',
              '&.Mui-selected': {
                backgroundColor: 'var(--blue-50)',
                color: 'var(--blue-500)',
                '&:hover': { backgroundColor: 'var(--blue-50)' },
                '& .MuiListItemIcon-root': { color: 'var(--blue-500)' },
                '& .MuiListItemText-primary': { fontWeight: 600, color: 'var(--blue-500)' },
              },
              '&:hover': { backgroundColor: 'var(--grey-50)' },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: isCollapsed ? 'auto' : '36px',
                justifyContent: 'center',
                color: selected ? 'var(--blue-500)' : 'var(--grey-500)',
                '& .MuiSvgIcon-root': { fontSize: 22 },
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '15px',
                  fontWeight: selected ? 600 : 500,
                  letterSpacing: '-0.005em',
                  color: selected ? 'var(--blue-500)' : 'var(--grey-700)',
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </Tooltip>
    );
  };

  const drawerContent = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'auto',
      width: currentDrawerWidth,
      flexShrink: 0,
      backgroundColor: '#FFFFFF',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      // 스크롤바 절제 표시
      '&::-webkit-scrollbar': { width: 4 },
      '&::-webkit-scrollbar-thumb': { backgroundColor: 'var(--grey-200)', borderRadius: 999 },
    }}>
      <Toolbar /> {/* TopBar 높이만큼 여백 */}
      <List sx={{ flexGrow: 1, pt: '12px', pb: '20px' }}>
        {navSections.map((section, i) => (
          <React.Fragment key={section.header ?? `section-${i}`}>
            {/* TDS list-header: 12px 캡션, grey-500 — 접힘 모드에선 헤어라인으로 대체 */}
            {section.header && !isCollapsed && (
              <Typography
                sx={{
                  px: '24px',
                  pt: '20px',
                  pb: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--grey-500)',
                  letterSpacing: 0,
                }}
              >
                {section.header}
              </Typography>
            )}
            {section.header && isCollapsed && (
              <Box sx={{ mx: '16px', my: '10px', borderTop: '1px solid var(--grey-150)' }} />
            )}
            {section.items.map(renderItem)}
          </React.Fragment>
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
          // TDS sheet: 우측 큰 라운드 + floating 그림자
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            borderRadius: '0 20px 20px 0',
            boxShadow: '0 12px 32px rgba(6,14,35,0.10), 0 2px 6px rgba(6,14,35,0.06)',
          },
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
            borderRight: '1px solid var(--grey-200)',
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
