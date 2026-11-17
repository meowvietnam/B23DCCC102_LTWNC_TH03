import type { Metadata } from 'next';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Sách đã mượn',
  robots: { index: false },
};

export default async function LoansPage() {
  const session = await auth();

  return (
    <section>
      <h1>Sách đã mượn</h1>
      <p className="muted">Tài khoản: {session?.user?.email}</p>
    </section>
  );
}
