import type { Metadata } from 'next';
// import './globals.css'; // <-- 이 라인 제거 또는 주석 처리
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import Providers from '@/components/Providers';
import AppShell from '@/components/AppShell'; // AppShell 컴포넌트 추가
import { Noto_Sans_KR, Lato } from 'next/font/google'; // theme.ts에서 가져오는 폰트와 동일하게 import
// import { useEffect } from 'react'; // 이 라인 제거
import HydrationFix from '@/components/HydrationFix'; // 새로 생성한 HydrationFix 컴포넌트 import

// Pretendard 폰트 대신 Google Fonts의 Noto Sans KR을 사용합니다.
const notoSansKR = Noto_Sans_KR({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-kr', // CSS 변수로 사용하기 위해 variable 추가
});

// Lato 폰트 설정
const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato', // CSS 변수로 사용하기 위해 variable 추가
});

export const metadata: Metadata = {
  title: 'MCRM Admin',
  description: 'Medical CRM Admin Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // useEffect 훅 사용 부분 제거
  // useEffect(() => {
  //   if (document.body.hasAttribute('wotdisconnected')) {
  //     document.body.removeAttribute('wotdisconnected');
  //   }
  // }, []);

// ... existing code ...

return (
  <html lang="ko" className={`${notoSansKR.variable} ${lato.variable}`}>
    <body suppressHydrationWarning>
      <HydrationFix />
      <ThemeRegistry>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </ThemeRegistry>
    </body>
  </html>
);

}