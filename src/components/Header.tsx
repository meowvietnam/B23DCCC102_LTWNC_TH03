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

  return (
    <header className="site-header">
      <nav>
        <Link href="/">Trang chủ</Link>
        <Link href="/books">Sách</Link>
        {user && <Link href="/loans">Sách đã mượn</Link>}
        {user && can(user.role, 'loan:review') && <Link href="/admin">Quản trị</Link>}
      </nav>
      <nav style={{ marginLeft: 'auto' }}>
        {status === 'loading' ? null : user ? (
          <>
            <span>
              Xin chào, {user.name} ({user.role})
            </span>
            <button type="button" onClick={() => signOut({ redirectTo: '/' })}>
              Đăng xuất
            </button>
          </>
        ) : (
          <Link href="/login">Đăng nhập</Link>
        )}
      </nav>
    </header>
  );
}
