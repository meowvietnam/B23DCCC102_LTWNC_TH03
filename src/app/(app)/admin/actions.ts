'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { reviewLoanStatus } from '@/lib/loans';
import { can } from '@/lib/permissions';

/** Server Action là endpoint công khai nên phải tự kiểm tra quyền. */
export async function reviewLoan(
  id: number,
  status: 'approved' | 'rejected',
): Promise<void> {
  const session = await auth();
  if (!can(session?.user?.role, 'loan:review')) {
    throw new Error('Không có quyền');
  }
  reviewLoanStatus(id, status);
  revalidatePath('/admin');
}
