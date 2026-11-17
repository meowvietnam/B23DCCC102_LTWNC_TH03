import { db } from './db';
import type { Loan, LoanStatus } from '@/types';

export interface LoanWithTitle extends Loan {
  bookTitle: string;
}

const withTitle = (loan: Loan): LoanWithTitle => ({
  ...loan,
  bookTitle: db.books.find((b) => b.id === loan.bookId)?.title ?? '(không rõ)',
});

/** Đếm số yêu cầu theo từng trạng thái. */
export function countByStatus(): Record<LoanStatus, number> {
  const counts: Record<LoanStatus, number> = { pending: 0, approved: 0, rejected: 0 };
  for (const loan of db.loans) counts[loan.status] += 1;
  return counts;
}

/** Danh sách yêu cầu đang chờ duyệt (cho trang quản trị). */
export function listPendingLoans(): LoanWithTitle[] {
  return db.loans.filter((l) => l.status === 'pending').map(withTitle);
}

/** Duyệt/từ chối 1 yêu cầu; chỉ đổi được yêu cầu đang pending. */
export function reviewLoanStatus(
  id: number,
  status: Exclude<LoanStatus, 'pending'>,
): boolean {
  const loan = db.loans.find((l) => l.id === id);
  if (!loan || loan.status !== 'pending') return false;
  loan.status = status;
  return true;
}
