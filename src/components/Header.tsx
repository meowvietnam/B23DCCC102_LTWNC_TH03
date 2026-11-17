'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { can } from '@/lib/permissions';

export default function Header() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();

  // Đăng nhập bằng Server Action không reload trang, nên đọc lại phiên khi đổi trang.
  useEffect(() => {
    void update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const user = session?.user;
  const isActive = (href: string): string =>
    (href === '/' ? pathname === '/' : pathname.startsWith(href)) ? 'active' : '';

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-logo">IT</span>
          <span>Thư viện CNTT</span>
        </Link>
        <nav className="nav">
          <Link href="/" className={isActive('/')}>Trang chủ</Link>
          <Link href="/books" className={isActive('/books')}>Sách</Link>
          {user && (
            <Link href="/loans" className={isActive('/loans')}>Sách đã mượn</Link>
          )}
          {user && can(user.role, 'loan:review') && (
            <Link href="/admin" className={isActive('/admin')}>Quản trị</Link>
          )}
        </nav>
        <div className="user-area">
          {status === 'loading' ? null : user ? (
            <>
              <span className="user-name">
                Xin chào, {user.name} ({user.role})
              </span>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => signOut({ redirectTo: '/' })}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-sm">Đăng nhập</Link>
          )}
        </div>
      </div>
    </header>
  );
}
