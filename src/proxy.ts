import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { can } from '@/lib/permissions';

export default auth((req) => {
  const { pathname, search, origin } = req.nextUrl;

  // Chưa đăng nhập → về trang đăng nhập, nhớ đường dẫn đang vào.
  if (!req.auth) {
    const url = new URL('/login', origin);
    url.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(url);
  }

  // /admin chỉ dành cho người được duyệt yêu cầu (admin).
  if (pathname.startsWith('/admin') && !can(req.auth.user?.role, 'loan:review')) {
    return NextResponse.redirect(new URL('/forbidden', origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/loans/:path*', '/admin/:path*'],
};
