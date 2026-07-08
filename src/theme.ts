import { createTheme } from '@mui/material/styles';

/**
 * Toss Design System (TDS) — MUI 테마
 *
 * 핵심 원칙:
 * - 화이트 캔버스 + cool-grey 뉴트럴 + 단일 강조색 Toss Blue #3182F6
 * - 화면당 하나의 primary CTA — 보조 액션은 grey-100 secondary 또는 ghost
 * - 평면 표면 + 1px grey-200 헤어라인 보더, 그림자는 floating/modal 전용
 * - 공격적 라운드: 카드 16~20, 버튼 사이즈별 10~16, 칩은 full pill
 * - 본문 15px / line-height 1.5 (한글 가독성 표준), 헤딩 Bold 700 타이트 트래킹
 * - pressed = 검정 26% overlay, disabled = 노드 전체 opacity 0.30
 */

const FONT_BASE = [
  '"Pretendard Variable"',
  'Pretendard',
  '-apple-system',
  'BlinkMacSystemFont',
  '"SF Pro Text"',
  '"Apple SD Gothic Neo"',
  '"Noto Sans KR"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

// TDS 컬러 토큰
const c = {
  blue50: '#E8F3FF',
  blue500: '#3182F6',
  blue600: '#1B64DA',
  blue700: '#1957C2',
  grey900: '#191F28',
  grey800: '#333D4B',
  grey700: '#4E5968',
  grey600: '#6B7684',
  grey500: '#8B95A1',
  grey400: '#B0B8C1',
  grey300: '#D1D6DB',
  grey200: '#E5E8EB',
  grey150: '#EBEEF1',
  grey100: '#F2F4F6',
  grey50: '#F9FAFB',
  white: '#FFFFFF',
  red500: '#F04452',
  green500: '#00A05B',
  orange500: '#FE9800',
};

const theme = createTheme({
  palette: {
    primary: {
      main: c.blue500,        // Toss Blue — 화면당 하나의 primary CTA
      dark: c.blue600,        // pressed
      light: c.blue50,
      contrastText: c.white,
    },
    secondary: {
      main: c.grey100,        // 보조 액션 표면
      dark: c.grey200,
      contrastText: c.grey900,
    },
    info: {
      main: c.blue500,
      contrastText: c.white,
    },
    warning: {
      main: c.orange500,
      contrastText: c.white,
    },
    error: {
      main: c.red500,
      contrastText: c.white,
    },
    success: {
      main: c.green500,
      contrastText: c.white,
    },
    background: {
      default: c.grey100,     // 관리자 캔버스 — 흰 카드가 얹히는 secondary surface
      paper: c.white,
    },
    text: {
      primary: c.grey900,     // 순수 검정 없음 — cool navy 틴트
      secondary: c.grey700,
      disabled: c.grey400,
    },
    divider: c.grey200,
    action: {
      active: c.grey700,
      hover: c.grey50,
      selected: c.blue50,
      disabled: c.grey400,
      disabledBackground: c.grey200,
    },
  },

  typography: {
    fontFamily: FONT_BASE,
    // TDS type ramp 매핑
    h1: { fontSize: '28px', lineHeight: 1.3, fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '24px', lineHeight: 1.3, fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontSize: '22px', lineHeight: 1.3, fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontSize: '20px', lineHeight: 1.35, fontWeight: 700, letterSpacing: '-0.015em' },
    h5: { fontSize: '18px', lineHeight: 1.45, fontWeight: 600, letterSpacing: '-0.01em' },   // title-1
    h6: { fontSize: '17px', lineHeight: 1.45, fontWeight: 600, letterSpacing: '-0.01em' },   // title-2
    subtitle1: { fontSize: '17px', lineHeight: 1.45, fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle2: { fontSize: '15px', lineHeight: 1.25, fontWeight: 600, letterSpacing: '-0.005em' }, // label-m
    body1: { fontSize: '15px', lineHeight: 1.5, fontWeight: 400, letterSpacing: '-0.005em' },      // body-2
    body2: { fontSize: '13px', lineHeight: 1.5, fontWeight: 400 },                                  // body-3
    caption: { fontSize: '12px', lineHeight: 1.4, fontWeight: 500 },
    button: { fontSize: '15px', lineHeight: 1.25, fontWeight: 600, letterSpacing: '-0.005em', textTransform: 'none' },
    overline: { fontSize: '11px', lineHeight: 1.4, fontWeight: 500, textTransform: 'none' },
  },

  shape: {
    borderRadius: 12, // radius-m 기본
  },

  transitions: {
    duration: {
      shortest: 120,  // dur-fast: button press
      shorter: 200,   // dur-base: toggle, hover
      short: 200,
      standard: 200,
      complex: 320,   // dur-slow: sheet, dialog
      enteringScreen: 320,
      leavingScreen: 200,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.22, 0.61, 0.36, 1)', // 기본 ease
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',        // sheet 진입
      easeIn: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      sharp: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: c.grey100,
          letterSpacing: '-0.005em',
        },
      },
    },

    // ---- 버튼: 사이즈별 height·radius 페어 (M 40/12, L 48/14, S 32/10) ----
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 40,
          paddingLeft: 16,
          paddingRight: 16,
          transition: 'background-color 120ms cubic-bezier(0.22,0.61,0.36,1), color 120ms, border-color 120ms',
          '&.Mui-disabled': {
            opacity: 0.4,
          },
        },
        containedPrimary: {
          backgroundColor: c.blue500,
          color: c.white,
          '&:hover': { backgroundColor: c.blue600 },
          '&:active': { backgroundColor: c.blue700 },
          '&.Mui-disabled': {
            backgroundColor: c.blue500,
            color: c.white,
          },
        },
        containedSecondary: {
          backgroundColor: c.grey100,
          color: c.grey900,
          '&:hover': { backgroundColor: c.grey150 },
        },
        containedError: {
          backgroundColor: c.red500,
          '&:hover': { backgroundColor: '#D93A47' },
        },
        outlined: {
          borderColor: c.grey200,
          color: c.grey900,
          '&:hover': {
            borderColor: c.grey300,
            backgroundColor: c.grey50,
          },
        },
        text: {
          color: c.blue500, // ghost — 텍스트 링크에 가까운 약한 위계
          '&:hover': { backgroundColor: c.blue50 },
        },
        sizeSmall: {
          minHeight: 32,
          borderRadius: 10,
          fontSize: '13px',
          paddingLeft: 12,
          paddingRight: 12,
        },
        sizeLarge: {
          minHeight: 56, // XL
          borderRadius: 16,
          fontSize: '17px',
          fontWeight: 700,
        },
      },
    },

    // ---- 카드: radius 16~20, 평면 + 헤어라인 (그림자 없음) ----
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          border: `1px solid ${c.grey200}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
        outlined: {
          border: `1px solid ${c.grey200}`,
          boxShadow: 'none',
        },
        // 그림자는 floating/modal 전용 — 시트/다이얼로그 수준만 유지
        elevation1: { boxShadow: '0 1px 2px rgba(6,14,35,0.04), 0 1px 1px rgba(6,14,35,0.04)' },
        elevation2: { boxShadow: '0 4px 12px rgba(6,14,35,0.06), 0 1px 2px rgba(6,14,35,0.04)' },
        elevation3: { boxShadow: '0 12px 32px rgba(6,14,35,0.10), 0 2px 6px rgba(6,14,35,0.06)' },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 16, // 밀도 우선 — 컴팩트 관리자 UI
          '&:last-child': { paddingBottom: 16 },
        },
      },
    },

    // ---- 칩: full pill, active는 grey-900 flip, brand는 blue-50 ----
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontSize: '13px',
          fontWeight: 600,
          height: 34,
        },
        sizeSmall: { height: 24, fontSize: '12px' },
        filled: {
          backgroundColor: c.grey100,
          color: c.grey700,
        },
        colorPrimary: {
          backgroundColor: c.blue50,
          color: c.blue500,
        },
        colorSecondary: {
          backgroundColor: c.grey900,
          color: c.white,
        },
        colorError: {
          backgroundColor: '#FDEBEC',
          color: c.red500,
        },
        colorSuccess: {
          backgroundColor: '#E5F5EE',
          color: c.green500,
        },
        outlined: {
          borderColor: c.grey200,
          backgroundColor: c.white,
        },
      },
    },

    // ---- 입력 필드: 48px, radius 12, grey-100 resting → focus 흰 배경 + 1.5px blue ----
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: c.grey100,
          transition: 'background-color 200ms cubic-bezier(0.22,0.61,0.36,1)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: c.grey200,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: c.grey300,
          },
          '&.Mui-focused': {
            backgroundColor: c.white,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: c.blue500,
            borderWidth: 1.5,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: c.red500,
            borderWidth: 1.5,
          },
        },
        input: {
          '&::placeholder': {
            color: 'rgba(6,14,35,0.28)',
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: c.grey500,
          '&.Mui-focused': { color: c.blue500 },
        },
      },
    },

    // ---- 테이블: 1px grey-200 헤어라인, tabular 숫자 ----
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${c.grey200}`,
          fontSize: '13px',
          padding: '9px 14px', // 밀도 우선 — 컴팩트 행
          fontVariantNumeric: 'tabular-nums',
        },
        head: {
          fontWeight: 600,
          fontSize: '12px',
          color: c.grey600,
          backgroundColor: c.grey50,
          whiteSpace: 'nowrap',
        },
        sizeSmall: {
          padding: '6px 12px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: c.grey50 },
        },
      },
    },

    // ---- 앱바: 흰 배경 + 헤어라인 ----
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'inherit',
      },
      styleOverrides: {
        root: {
          backgroundColor: c.white,
          color: c.grey900,
          borderBottom: `1px solid ${c.grey200}`,
        },
      },
    },

    // ---- 드로어(사이드 내비) ----
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: c.white,
          borderRight: `1px solid ${c.grey200}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 8px',
          minHeight: 44,
          '&.Mui-selected': {
            backgroundColor: c.blue50,
            color: c.blue500,
            '&:hover': { backgroundColor: c.blue50 },
            '& .MuiListItemIcon-root': { color: c.blue500 },
            '& .MuiListItemText-primary': { fontWeight: 600 },
          },
          '&:hover': { backgroundColor: c.grey50 },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: c.grey600,
          minWidth: 40,
        },
      },
    },

    // ---- 다이얼로그: radius 20, shadow-3 ----
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 12px 32px rgba(6,14,35,0.10), 0 2px 6px rgba(6,14,35,0.06)',
          padding: 4,
        },
      },
    },

    // ---- 배지 ----
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
          fontSize: '11px',
        },
        colorError: { backgroundColor: c.red500, color: c.white },
        colorPrimary: { backgroundColor: c.blue500, color: c.white },
      },
    },

    // ---- 탭: 2.5px blue 언더라인 ----
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: c.blue500,
          height: 2.5,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '15px',
          letterSpacing: '-0.005em',
          color: c.grey500,
          minHeight: 48,
          '&.Mui-selected': {
            color: c.grey900,
          },
        },
      },
    },

    // ---- 기타 ----
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: c.grey900,
          fontSize: '13px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(6,14,35,0.06), 0 1px 2px rgba(6,14,35,0.04)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: c.grey200 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          backgroundColor: c.grey200,
          height: 6,
        },
        bar: {
          borderRadius: 999,
          backgroundColor: c.blue500,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: { color: c.blue500 },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: c.white,
            '& + .MuiSwitch-track': {
              backgroundColor: c.blue500,
              opacity: 1,
            },
          },
        },
        track: {
          backgroundColor: c.grey300,
          opacity: 1,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: c.grey300,
          '&.Mui-checked': { color: c.blue500 },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
        standardError: { backgroundColor: '#FDEBEC', color: c.red500 },
        standardSuccess: { backgroundColor: '#E5F5EE', color: c.green500 },
        standardInfo: { backgroundColor: c.blue50, color: c.blue600 },
        standardWarning: { backgroundColor: '#FFF4E0', color: '#B26A00' },
      },
    },
  },
});

export default theme;
