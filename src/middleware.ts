import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 공개 경로 (API, 정적 파일 등) - 인증 불필요
  if (request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // 미들웨어는 서버 사이드에서 실행되므로 쿠키만 체크 가능
  const authToken = request.cookies.get('auth_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // 로그인 페이지 처리
  if (isLoginPage) {
    if (authToken) {
      // 이미 로그인된 상태면 redirect 파라미터가 있으면 해당 페이지로, 없으면 홈으로
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      const redirectTo = redirectParam || '/';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.next();
  }

  // 모든 다른 페이지는 인증 필요
  if (!authToken) {
    // 로그인되지 않은 상태에서 보호된 페이지 접근 시
    const currentPath = request.nextUrl.pathname + request.nextUrl.search;
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', currentPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};