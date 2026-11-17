'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { toLoanData, toLoanInput, validateLoan } from '@/lib/loan-validate';
import type { LoanFormState } from '@/lib/loan-validate';
import { cancelLoan, submitLoan } from '@/lib/loans';
import { can } from '@/lib/permissions';

/** Lấy email người dùng nếu có quyền gửi/hủy yêu cầu, không thì ném lỗi. */
async function requireBorrower(): Promise<string> {
  const session = await auth();
  const user = session?.user;
  if (!user?.email || !can(user.role, 'loan:create')) {
    throw new Error('Không có quyền');
  }
  return user.email;
}

export async function createLoanAction(
  _prevState: LoanFormState,
  formData: FormData,
): Promise<LoanFormState> {
  const email = await requireBorrower();

  const input = toLoanInput(formData);
  const errors = validateLoan(input, db.books);
  if (Object.keys(errors).length > 0) {
    return { errors, values: input };
  }

  const result = submitLoan(email, toLoanData(input));
  if (!result.ok) {
    return { errors: {}, values: input, message: result.message };
  }

  revalidatePath('/loans');
  return { errors: {}, values: {}, message: 'Đã gửi yêu cầu, chờ duyệt', ok: true };
}

export async function cancelLoanAction(id: number): Promise<void> {
  const email = await requireBorrower();
  // Yêu cầu của người khác hoặc không còn chờ duyệt thì cancelLoan bỏ qua.
  cancelLoan(email, id);
  revalidatePath('/loans');
}
