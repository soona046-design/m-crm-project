import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // 공개 경로 (API, 정적 파일 등)
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/api') || 
      request.nextUrl.pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // 로그인 페이지 처리
  if (isLoginPage) {
    if (authToken) {
      // 이미 로그인된 상태면 대시보드로 리다이렉트
      return NextResponse.redirect(new URL('/dashboards/agent-performance', request.url));
    }
    return NextResponse.next();
  }

  // 인증이 필요한 페이지
  if (!authToken) {
    // 로그인되지 않은 상태에서 보호된 페이지 접근 시
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // 이전 페이지 정보 저장
    response.cookies.set('previousPage', request.nextUrl.pathname, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/'
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};