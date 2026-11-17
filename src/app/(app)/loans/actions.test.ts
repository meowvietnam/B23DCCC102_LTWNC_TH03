import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateLoans } from '@/data/books';
import { db } from '@/lib/db';
import type { Role } from '@/types';

// Giả lập phiên đăng nhập và next/cache để test Server Action ngoài Next.js.
const session: { current: { user: { email: string; role: Role } } | null } = {
  current: null,
};
vi.mock('@/auth', () => ({ auth: vi.fn(async () => session.current) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const { createLoanAction } = await import('./actions');
const { revalidatePath } = await import('next/cache');

const formData = (): FormData => {
  const fd = new FormData();
  fd.set('bookId', '11');
  fd.set('pickupDate', '2099-12-03');
  fd.set('term', '14');
  fd.set('quantity', '1');
  fd.set('reason', 'Mượn làm đồ án môn học');
  return fd;
};

beforeEach(() => {
  db.loans.splice(0, db.loans.length, ...generateLoans(37));
  db.nextLoanId = 38;
  vi.mocked(revalidatePath).mockClear();
});

describe('createLoanAction', () => {
  it('sinh viên gửi hợp lệ thì thành công và form được xóa trắng', async () => {
    session.current = { user: { email: 'sv01@ptit.edu.vn', role: 'student' } };
    const state = await createLoanAction({ errors: {}, values: {} }, formData());
    expect(state).toEqual({
      errors: {}, values: {}, message: 'Đã gửi yêu cầu, chờ duyệt', ok: true,
    });
    expect(revalidatePath).toHaveBeenCalledWith('/loans');
    expect(db.loans[0].userEmail).toBe('sv01@ptit.edu.vn');
  });

  it('admin gửi yêu cầu thì bị ném lỗi Không có quyền', async () => {
    session.current = { user: { email: 'admin@ptit.edu.vn', role: 'admin' } };
    await expect(createLoanAction({ errors: {}, values: {} }, formData())).rejects.toThrow(
      'Không có quyền',
    );
  });
});
