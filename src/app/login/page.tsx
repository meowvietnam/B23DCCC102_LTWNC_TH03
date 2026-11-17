import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Đăng nhập',
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) redirect('/');

  const { callbackUrl } = await searchParams;
  const target = (Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl) ?? '/loans';

  return (
    <section className="card auth-card">
      <h1>Đăng nhập</h1>
      <p className="muted small">Dùng tài khoản thư viện để mượn sách.</p>
      <LoginForm callbackUrl={target} />
    </section>
  );
}
