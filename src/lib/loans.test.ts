import { beforeEach, describe, expect, it } from 'vitest';
import { generateLoans } from '@/data/books';
import { db } from './db';
import { cancelLoan, listLoans, parseStatus, submitLoan } from './loans';
import type { Viewer } from './loans';

const sv01: Viewer = { email: 'sv01@ptit.edu.vn', role: 'student' };
const sv02: Viewer = { email: 'sv02@ptit.edu.vn', role: 'student' };
const admin: Viewer = { email: 'admin@ptit.edu.vn', role: 'admin' };

// Đưa kho dữ liệu trong bộ nhớ về trạng thái ban đầu trước mỗi test.
beforeEach(() => {
  db.loans.splice(0, db.loans.length, ...generateLoans(37));
  db.nextLoanId = 38;
});

describe('listLoans', () => {
  it('sv01 có 27 yêu cầu chia 3 trang (10/10/7)', () => {
    const sizes = [1, 2, 3].map((p) => listLoans(sv01, undefined, p).items.length);
    expect(sizes).toEqual([10, 10, 7]);
    const first = listLoans(sv01, undefined, 1);
    expect(first.total).toBe(27);
    expect(first.totalPages).toBe(3);
    expect(first.items.every((l) => l.userEmail === sv01.email)).toBe(true);
    expect(first.items[0].bookTitle).toBeTruthy();
  });

  it('sinh viên chỉ thấy yêu cầu của mình, admin thấy tất cả 37', () => {
    expect(listLoans(sv02, '', 1).total).toBe(10);
    const all = listLoans(admin, undefined, 1);
    expect(all.total).toBe(37);
    expect(all.totalPages).toBe(4);
  });

  it('lọc theo trạng thái', () => {
    expect(listLoans(sv01, 'pending', 1).total).toBe(9);
    expect(listLoans(admin, 'pending', 1).totalPages).toBe(2);
  });

  it('trang vượt giới hạn bị kẹp lại trong khoảng 1…totalPages', () => {
    expect(listLoans(sv01, undefined, 99).page).toBe(3);
    expect(listLoans(sv01, undefined, -5).page).toBe(1);
    expect(listLoans(sv01, undefined, Number.NaN).page).toBe(1);
  });

  it('parseStatus chỉ nhận 3 trạng thái hợp lệ', () => {
    expect(parseStatus('approved')).toBe('approved');
    expect(parseStatus('abc')).toBeUndefined();
    expect(parseStatus(undefined)).toBeUndefined();
  });
});

describe('submitLoan', () => {
  it('trả hết bản với sách id 6 ngày 2026-12-02', () => {
    const result = submitLoan(sv01.email, {
      bookId: 6, pickupDate: '2026-12-02', term: 14, quantity: 1, reason: 'Mượn học môn mạng',
    });
    expect(result).toEqual({ ok: false, message: 'Sách đã hết bản vào ngày này' });
  });

  it('yêu cầu bị từ chối không chiếm bản: sách id 11 ngày 2026-12-03 tạo được', () => {
    const result = submitLoan(sv01.email, {
      bookId: 11, pickupDate: '2026-12-03', term: 14, quantity: 1, reason: 'Mượn làm đồ án',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.loan).toMatchObject({ id: 38, status: 'pending', userEmail: sv01.email });
      expect(db.loans[0]).toBe(result.loan);
      expect(db.nextLoanId).toBe(39);
    }
  });
});

describe('cancelLoan', () => {
  it('tạo được rồi hủy: forbidden, ok, not-found', () => {
    const result = submitLoan(sv01.email, {
      bookId: 11, pickupDate: '2026-12-03', term: 7, quantity: 1, reason: 'Mượn làm đồ án',
    });
    if (!result.ok) throw new Error('Phải tạo được yêu cầu');
    const id = result.loan.id;

    expect(cancelLoan(sv02.email, id)).toBe('forbidden');
    expect(cancelLoan(sv01.email, id)).toBe('ok');
    expect(cancelLoan(sv01.email, id)).toBe('not-found');
  });

  it('không hủy được yêu cầu đã duyệt', () => {
    // Yêu cầu mẫu id 2 của sv01 có trạng thái approved.
    expect(cancelLoan(sv01.email, 2)).toBe('not-pending');
  });
});
