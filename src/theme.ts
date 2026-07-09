import { createTheme } from '@mui/material/styles';

/**
 * Insight Design System — MUI 테마
 * 출처: Insight-Design-System.md (Figma "대시보드 - 네이버 광고" 프레임 추출)
 *
 * 핵심 원칙:
 * - 화이트 캔버스(#F7F7F7 페이지) + 뉴트럴 + 단일 강조색 오렌지 #FF5B2C
 * - primary 계열은 화면 시각 비중 30% 이내 — CTA 1개/활성 상태/핵심 KPI에만
 * - 흰 텍스트 + #FF5B2C 배경은 대비 3.1:1 → 버튼 텍스트는 SemiBold 16px 이상,
 *   hover/pressed는 #B2401F(600, 대비 5.76:1)
 * - 평면 표면 + rgba(0,0,0,0.08) 헤어라인 보더, 그림자는 floating 전용
 * - 라운드: 버튼/인풋/KPI 카드 8, 대형 카드 12, pill 999
 * - 본문/테이블 15px, 섹션 타이틀 18px Bold, 버튼 16px SemiBold
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

// Insight 컬러 토큰
const c = {
  primary50: '#FFF5F2',   // 보조 버튼(tint) 배경, 강조 카드 배경
  primary500: '#FF5B2C',  // 주요 버튼, 링크, 활성 탭/메뉴 텍스트
  primary600: '#B2401F',  // hover/pressed
  primary700: '#8C3218',  // 옅은 배경 위 강조 텍스트/뱃지
  textStrong: '#000000',  // 기본 본문
  textHeading: '#2E2E2E', // 헤더/메뉴 텍스트
  textMuted: '#737373',   // 보조 설명, 비활성 탭, placeholder
  borderDefault: 'rgba(0,0,0,0.08)',
  borderSubtle: 'rgba(0,0,0,0.10)',
  borderTable: '#E5E5E5',
  bgPage: '#F7F7F7',
  bgSubtle: '#F8F9FA',
  white: '#FFFFFF',
  dataRed: '#F4361E',
  dataOrange: '#FD9A06',
  dataBlue: '#2196F3',
  green500: '#00A05B',
  greyDisabled: '#B5B5B5',
};

const theme = createTheme({
  palette: {
    primary: {
      main: c.primary500,     // Insight Orange — 화면당 하나의 primary CTA
      dark: c.primary600,     // hover/pressed
      light: c.primary50,
      contrastText: c.white,
    },
    secondary: {
      main: c.primary50,      // Secondary(Tint) 버튼 표면
      dark: '#FFE9E2',
      contrastText: c.primary700,
    },
    info: {
      main: c.dataBlue,
      contrastText: c.white,
    },
    warning: {
      main: c.dataOrange,
      contrastText: c.white,
    },
    error: {
      main: c.dataRed,
      contrastText: c.white,
    },
    success: {
      main: c.green500,
      contrastText: c.white,
    },
    background: {
      default: c.bgPage,      // 페이지 캔버스 — 흰 카드가 얹히는 배경
      paper: c.white,
    },
    text: {
      primary: c.textStrong,
      secondary: c.textMuted,
      disabled: c.greyDisabled,
    },
    divider: c.borderDefault,
    action: {
      active: c.textHeading,
      hover: c.bgSubtle,
      selected: c.primary50,
      disabled: c.greyDisabled,
      disabledBackground: c.borderTable,
    },
  },

  typography: {
    fontFamily: FONT_BASE,
    // Insight type ramp 매핑
    h1: { fontSize: '24px', lineHeight: 1.3, fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '22px', lineHeight: 1.3, fontWeight: 500, letterSpacing: '-0.015em' },  // KPI 숫자
    h3: { fontSize: '20px', lineHeight: 1.3, fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontSize: '18px', lineHeight: 1.35, fontWeight: 700, letterSpacing: '-0.017em' }, // 섹션 타이틀
    h5: { fontSize: '18px', lineHeight: 1.45, fontWeight: 700, letterSpacing: '-0.017em' }, // 섹션 타이틀
    h6: { fontSize: '16px', lineHeight: 1.45, fontWeight: 600, letterSpacing: '-0.019em' },
    subtitle1: { fontSize: '16px', lineHeight: 1.45, fontWeight: 600, letterSpacing: '-0.019em' },
    subtitle2: { fontSize: '14px', lineHeight: 1.25, fontWeight: 600 },                     // 탭/보조 버튼 라벨
    body1: { fontSize: '15px', lineHeight: 1.5, fontWeight: 400, letterSpacing: '-0.02em' }, // 본문, 테이블 셀
    body2: { fontSize: '13px', lineHeight: 1.5, fontWeight: 400, letterSpacing: '-0.023em' },
    caption: { fontSize: '12px', lineHeight: 1.4, fontWeight: 400 },
    button: { fontSize: '16px', lineHeight: 1.25, fontWeight: 600, letterSpacing: '-0.019em', textTransform: 'none' },
    overline: { fontSize: '11px', lineHeight: 1.4, fontWeight: 600, textTransform: 'none' },
  },

  shape: {
    borderRadius: 8, // radius-md 기본 (버튼/인풋/KPI 카드)
  },

  transitions: {
    duration: {
      shortest: 120,
      shorter: 200,
      short: 200,
      standard: 200,
      complex: 320,
      enteringScreen: 320,
      leavingScreen: 200,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeIn: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      sharp: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: c.bgPage,
          letterSpacing: '-0.02em',
        },
      },
    },

    // ---- 버튼: radius 8(기본)/6(S)/10(L), 높이 40/32/48 ----
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 40,
          paddingLeft: 16,
          paddingRight: 16,
          transition: 'background-color 120ms cubic-bezier(0.22,0.61,0.36,1), color 120ms, border-color 120ms',
          '&.Mui-disabled': {
            opacity: 0.4,
          },
        },
        containedPrimary: {
          backgroundColor: c.primary500,
          color: c.white, // 16px SemiBold 기본 — 대비 보완 (작은 텍스트 금지)
          '&:hover': { backgroundColor: c.primary600 },
          '&:active': { backgroundColor: c.primary700 },
          '&.Mui-disabled': {
            backgroundColor: c.primary500,
            color: c.white,
          },
        },
        // Secondary(Tint): 배경 #FFF5F2 + 텍스트 #8C3218 (예: 다운로드, 전체 캠페인 보기)
        containedSecondary: {
          backgroundColor: c.primary50,
          color: c.primary700,
          '&:hover': { backgroundColor: '#FFE9E2' },
        },
        containedError: {
          backgroundColor: c.dataRed,
          '&:hover': { backgroundColor: '#C92B17' },
        },
        outlined: {
          borderRadius: 6, // radius-sm — 보조/아웃라인 버튼
          borderColor: c.borderSubtle,
          color: c.textStrong,
          '&:hover': {
            borderColor: 'rgba(0,0,0,0.2)',
            backgroundColor: c.bgSubtle,
          },
        },
        text: {
          color: c.textStrong, // ghost — 배경/보더 없는 약한 위계 (예: 충전하기, 전체보기)
          '&:hover': { backgroundColor: c.bgSubtle },
        },
        textPrimary: {
          color: c.primary500, // 링크성 텍스트 버튼
          '&:hover': { backgroundColor: c.primary50 },
        },
        sizeSmall: {
          minHeight: 32,
          borderRadius: 6,
          fontSize: '14px',
          paddingLeft: 13,
          paddingRight: 13,
        },
        sizeLarge: {
          minHeight: 48,
          borderRadius: 10,
          fontSize: '16px',
          fontWeight: 600,
        },
      },
    },

    // ---- 카드: 대형 패널 radius 12, 평면 + 헤어라인 ----
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          border: `1px solid ${c.borderDefault}`,
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
          borderRadius: 12,
        },
        outlined: {
          border: `1px solid ${c.borderDefault}`,
          boxShadow: 'none',
        },
        // 그림자는 floating 전용
        elevation1: { boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.04)' },
        elevation2: { boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' },
        elevation3: { boxShadow: '0 12px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)' },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 16, // 카드 padding 16~20
          '&:last-child': { paddingBottom: 16 },
        },
      },
    },

    // ---- 칩: pill, brand는 tint(#FFF5F2 + #8C3218) ----
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontSize: '13px',
          fontWeight: 600,
          height: 34,
        },
        sizeSmall: { height: 24, fontSize: '11px' },
        filled: {
          backgroundColor: c.bgSubtle,
          color: c.textMuted,
        },
        colorPrimary: {
          backgroundColor: c.primary50,
          color: c.primary700,
        },
        colorSecondary: {
          backgroundColor: c.textHeading,
          color: c.white,
        },
        colorError: {
          backgroundColor: '#FEECEA',
          color: c.dataRed,
        },
        colorSuccess: {
          backgroundColor: '#E5F5EE',
          color: c.green500,
        },
        colorInfo: {
          backgroundColor: c.white,
          color: '#0958D9', // "필수" 뱃지
          border: '1px solid #91CAFF',
        },
        outlined: {
          borderColor: c.borderDefault,
          backgroundColor: c.white,
        },
      },
    },

    // ---- 입력 필드: radius 8, #F7F7F7 resting → focus 흰 배경 + 1.5px 오렌지 ----
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: c.bgPage,
          transition: 'background-color 200ms cubic-bezier(0.22,0.61,0.36,1)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: c.borderDefault,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,0,0,0.2)',
          },
          '&.Mui-focused': {
            backgroundColor: c.white,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: c.primary500,
            borderWidth: 1.5,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: c.dataRed,
            borderWidth: 1.5,
          },
        },
        input: {
          '&::placeholder': {
            color: c.textMuted,
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: c.textMuted,
          '&.Mui-focused': { color: c.primary500 },
        },
      },
    },

    // ---- 테이블: #E5E5E5 보더, 헤더 #F8F9FA, 15px, tabular 숫자 ----
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${c.borderTable}`,
          fontSize: '15px',
          padding: '9px 14px', // 밀도 우선 — 컴팩트 행 유지
          fontVariantNumeric: 'tabular-nums',
        },
        head: {
          fontWeight: 500,
          fontSize: '15px',
          color: c.textHeading,
          backgroundColor: c.bgSubtle,
          whiteSpace: 'nowrap',
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '13px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: c.bgSubtle },
        },
      },
    },

    // ---- 앱바(헤더 56px): 흰 배경 + 헤어라인 ----
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'inherit',
      },
      styleOverrides: {
        root: {
          backgroundColor: c.white,
          color: c.textHeading,
          borderBottom: `1px solid ${c.borderDefault}`,
        },
      },
    },

    // ---- 드로어(사이드 내비): 메뉴 아이템 44px, active는 텍스트 컬러로만 구분 ----
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: c.white,
          borderRight: `1px solid ${c.borderDefault}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          minHeight: 44,
          color: c.textHeading,
          // Active: 텍스트 #FF5B2C + SemiBold (배경 하이라이트 없음 — 전체 메뉴 중 1개만 active)
          '&.Mui-selected': {
            backgroundColor: 'transparent',
            color: c.primary500,
            '&:hover': { backgroundColor: c.bgSubtle },
            '& .MuiListItemIcon-root': { color: c.primary500 },
            '& .MuiListItemText-primary': { fontWeight: 600 },
          },
          '&:hover': { backgroundColor: c.bgSubtle },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: c.textHeading,
          minWidth: 40,
        },
      },
    },

    // ---- 다이얼로그: radius 16 ----
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 12px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
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
        colorError: { backgroundColor: c.dataRed, color: c.white },
        colorPrimary: { backgroundColor: c.primary500, color: c.white },
      },
    },

    // ---- 탭: 활성 = 오렌지 텍스트 + 오렌지 언더라인, 비활성 = #737373 ----
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: c.primary500,
          height: 2.5,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '14px',
          color: c.textMuted,
          minHeight: 48,
          '&.Mui-selected': {
            color: c.primary500,
          },
        },
      },
    },

    // ---- 기타 ----
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: c.textHeading,
          fontSize: '13px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: c.borderDefault },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          backgroundColor: c.borderTable,
          height: 6,
        },
        bar: {
          borderRadius: 999,
          backgroundColor: c.primary500,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: { color: c.primary500 },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: c.white,
            '& + .MuiSwitch-track': {
              backgroundColor: c.primary500,
              opacity: 1,
            },
          },
        },
        track: {
          backgroundColor: '#D6D6D6',
          opacity: 1,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#D6D6D6',
          '&.Mui-checked': { color: c.primary500 },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
        standardError: { backgroundColor: '#FEECEA', color: c.dataRed },
        standardSuccess: { backgroundColor: '#E5F5EE', color: c.green500 },
        standardInfo: { backgroundColor: '#E6F4FF', color: '#0958D9' },
        standardWarning: { backgroundColor: '#FFF4E0', color: '#B26A00' },
      },
    },

    // ---- 페이지네이션: 원형 아웃라인, 현재 페이지 오렌지 ----
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          border: `1px solid ${c.borderSubtle}`,
          '&.Mui-selected': {
            backgroundColor: 'transparent',
            color: c.primary500,
            fontWeight: 600,
            border: `1px solid ${c.borderSubtle}`,
          },
        },
      },
    },
  },
});

export default theme;
