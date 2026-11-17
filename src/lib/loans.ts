import { db } from './db';
import type { LoanData } from './loan-validate';
import { can } from './permissions';
import type { Loan, LoanStatus, Role } from '@/types';

// Các hàm nghiệp vụ thuần TypeScript, không import gì của Next.js để dễ test.

export const PAGE_SIZE = 10;

export interface Viewer {
  email: string;
  role: Role;
}

export interface LoanWithTitle extends Loan {
  bookTitle: string;
}

export interface LoanPage {
  items: LoanWithTitle[];
  total: number;
  page: number;
  totalPages: number;
}

export type SubmitResult =
  | { ok: true; loan: Loan }
  | { ok: false; message: string };

export type CancelResult = 'ok' | 'not-found' | 'forbidden' | 'not-pending';

const STATUSES: LoanStatus[] = ['pending', 'approved', 'rejected'];

const withTitle = (loan: Loan): LoanWithTitle => ({
  ...loan,
  bookTitle: db.books.find((b) => b.id === loan.bookId)?.title ?? '(không rõ)',
});

/** Chỉ nhận pending/approved/rejected; giá trị khác coi như không lọc. */
export function parseStatus(v: unknown): LoanStatus | undefined {
  return STATUSES.find((s) => s === v);
}

/** Danh sách yêu cầu theo người xem, lọc trạng thái và phân trang 10 dòng/trang. */
export function listLoans(
  viewer: Viewer,
  status: LoanStatus | undefined | '',
  page: number,
): LoanPage {
  const visible = can(viewer.role, 'loan:view-all')
    ? db.loans
    : can(viewer.role, 'loan:view-own')
      ? db.loans.filter((l) => l.userEmail === viewer.email)
      : [];
  const filtered = status ? visible.filter((l) => l.status === status) : visible;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const wanted = Number.isFinite(page) ? Math.trunc(page) : 1;
  const current = Math.min(Math.max(wanted, 1), totalPages);
  const start = (current - 1) * PAGE_SIZE;

  return {
    items: filtered.slice(start, start + PAGE_SIZE).map(withTitle),
    total,
    page: current,
    totalPages,
  };
}

/** Tạo yêu cầu mượn sau khi kiểm tra tồn kho theo từng ngày lấy sách. */
export function submitLoan(email: string, data: LoanData): SubmitResult {
  const book = db.books.find((b) => b.id === data.bookId);
  if (!book) return { ok: false, message: 'Không tìm thấy sách' };

  const used = db.loans
    .filter(
      (l) =>
        l.bookId === data.bookId &&
        l.pickupDate === data.pickupDate &&
        l.status !== 'rejected',
    )
    .reduce((sum, l) => sum + l.quantity, 0);

  if (used + data.quantity > book.copies) {
    return { ok: false, message: 'Sách đã hết bản vào ngày này' };
  }

  const loan: Loan = {
    id: db.nextLoanId++,
    bookId: data.bookId,
    userEmail: email,
    pickupDate: data.pickupDate,
    term: data.term,
    quantity: data.quantity,
    reason: data.reason,
    status: 'pending',
  };
  db.loans.unshift(loan);
  return { ok: true, loan };
}

/** Hủy yêu cầu của chính mình khi còn chờ duyệt. */
export function cancelLoan(email: string, id: number): CancelResult {
  const index = db.loans.findIndex((l) => l.id === id);
  if (index === -1) return 'not-found';
  const loan = db.loans[index];
  if (loan.userEmail !== email) return 'forbidden';
  if (loan.status !== 'pending') return 'not-pending';
  db.loans.splice(index, 1);
  return 'ok';
}

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
