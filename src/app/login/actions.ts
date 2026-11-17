'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

export interface LoginState {
  error?: string;
}

/** Chỉ cho chuyển hướng trong cùng trang web, mặc định /loans. */
const safeCallback = (v: FormDataEntryValue | null): string =>
  typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') ? v : '/loans';

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: safeCallback(formData.get('callbackUrl')),
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email hoặc mật khẩu không đúng' };
    }
    // redirect() của Next.js là một exception, phải ném lại.
    throw error;
  }
}
