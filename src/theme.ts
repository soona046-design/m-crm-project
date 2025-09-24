import { createTheme } from '@mui/material/styles';
import { Noto_Sans_KR, Lato } from 'next/font/google'; // Pretendard 대신 Noto Sans KR 사용 예시

// Pretendard 폰트 대신 Google Fonts의 Noto Sans KR을 사용합니다.
// 로컬 폰트 설정이 복잡하므로, 일단 Google Fonts로 대체합니다.
const notoSansKR = Noto_Sans_KR({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Lato 폰트 설정
const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
});


// Material UI 테마 정의
const theme = createTheme({
  palette: {
    primary: {
      main: '#1E88E5', // Blue 600
      light: '#E3F2FD', // Primary Container: Blue 50 (대략적인 값, Material 3 컨테이너와 일치시킬 경우 추가 조정 필요)
    },
    secondary: {
      main: '#00897B', // Teal 600
    },
    error: {
      main: '#D32F2F', // Red 600
    },
    background: {
      default: '#F8FAFC', // Background
      paper: '#FFFFFF', // Surface
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)', // 기본 텍스트 색상
      secondary: 'rgba(0, 0, 0, 0.6)', // 보조 텍스트 색상
    },
    divider: '#E0E3E7', // Outline
  },
  typography: {
    fontFamily: [notoSansKR.style.fontFamily, lato.style.fontFamily, 'sans-serif'].join(','),
    h1: { // Display (대시보드 KPI)
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: 700,
    },
    h2: { // Headline (Material 3 기준, 24px에 맞춤)
      fontSize: '24px',
      fontWeight: 500,
    },
    body1: { // Body Large (16px)
      fontSize: '16px',
    },
    body2: { // Label Medium (14px)
      fontSize: '14px',
    },
    button: {
      fontSize: '14px',
      fontWeight: 500,
    },
    // 숫자 데이터에 tabular-nums 적용 (글로벌 CSS에서 적용하거나, 특정 컴포넌트에서 재정의 필요)
    // 예시: `<Typography sx={{ fontVariantNumeric: 'tabular-nums' }}>123,456</Typography>`
  },
  shape: {
    borderRadius: 12, // Rounded 12dp (카드, 버튼, 필드)
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)', // Elevation 1 → Shadow subtle (대략적인 값)
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.12)', // Elevation 3 (대략적인 값)
          borderRadius: 12,
        },
      },
    },
    // 다른 컴포넌트들에 대한 스타일 오버라이드 추가 가능
  },
});

export default theme;