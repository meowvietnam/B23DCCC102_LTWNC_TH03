import { describe, expect, it } from 'vitest';
import { generateBooks } from '@/data/books';
import { today, toLoanData, toLoanInput, validateLoan } from './loan-validate';
import type { LoanInput } from './loan-validate';

const books = generateBooks(24);

const valid: LoanInput = {
  bookId: '3', // Nhập môn cơ sở dữ liệu, 3 bản
  pickupDate: '2099-01-15',
  term: '14',
  quantity: '2',
  reason: 'Mượn phục vụ môn học',
};

describe('validateLoan', () => {
  it('dữ liệu hợp lệ thì trả object rỗng', () => {
    expect(validateLoan(valid, books)).toEqual({});
  });

  it('form trống báo đủ lỗi cho từng ô', () => {
    const errors = validateLoan(toLoanInput({}), books);
    expect(errors).toEqual({
      bookId: 'Hãy chọn sách',
      pickupDate: 'Hãy chọn ngày',
      term: 'Hãy chọn thời hạn',
      quantity: 'Số quyển phải từ 1 trở lên',
      reason: 'Lý do tối thiểu 10 ký tự',
    });
  });

  it('báo lỗi khi chọn sách không có thật', () => {
    expect(validateLoan({ ...valid, bookId: '999' }, books).bookId).toBe('Hãy chọn sách');
  });

  it('ngày lấy sách ở quá khứ bị từ chối, hôm nay thì hợp lệ', () => {
    expect(validateLoan({ ...valid, pickupDate: '2000-01-01' }, books).pickupDate).toBe(
      'Ngày lấy sách không được ở quá khứ',
    );
    expect(validateLoan({ ...valid, pickupDate: today() }, books)).toEqual({});
  });

  it('ngày sai định dạng hoặc không có thật thì báo hãy chọn ngày', () => {
    expect(validateLoan({ ...valid, pickupDate: '15/01/2099' }, books).pickupDate).toBe(
      'Hãy chọn ngày',
    );
    expect(validateLoan({ ...valid, pickupDate: '2099-02-30' }, books).pickupDate).toBe(
      'Hãy chọn ngày',
    );
  });

  it('lý do dưới 10 ký tự (kể cả chuỗi toàn khoảng trắng) là sai', () => {
    expect(validateLoan({ ...valid, reason: 'ngắn quá' }, books).reason).toBe(
      'Lý do tối thiểu 10 ký tự',
    );
    expect(validateLoan({ ...valid, reason: '              ' }, books).reason).toBe(
      'Lý do tối thiểu 10 ký tự',
    );
  });

  it('số quyển vượt số bản của sách (sách id 1 có 1 bản, mượn 2)', () => {
    expect(validateLoan({ ...valid, bookId: '1', quantity: '2' }, books).quantity).toBe(
      'Vượt số bản của sách (1 bản)',
    );
  });

  it('số quyển không phải số nguyên dương thì báo lỗi', () => {
    for (const quantity of ['0', '-1', '1.5', 'abc', '']) {
      expect(validateLoan({ ...valid, quantity }, books).quantity).toBe(
        'Số quyển phải từ 1 trở lên',
      );
    }
  });

  it('thời hạn không hợp lệ (10 ngày) thì báo lỗi', () => {
    expect(validateLoan({ ...valid, term: '10' }, books).term).toBe('Hãy chọn thời hạn');
  });
});

describe('toLoanInput / toLoanData', () => {
  it('toLoanInput đọc được FormData, trường thiếu thành chuỗi rỗng', () => {
    const fd = new FormData();
    fd.set('bookId', '6');
    fd.set('term', '7');
    expect(toLoanInput(fd)).toEqual({
      bookId: '6', pickupDate: '', term: '7', quantity: '', reason: '',
    });
  });

  it('toLoanData ép kiểu số từ chuỗi và trim lý do', () => {
    expect(toLoanData({ ...valid, reason: '  Mượn phục vụ môn học  ' })).toEqual({
      bookId: 3,
      pickupDate: '2099-01-15',
      term: 14,
      quantity: 2,
      reason: 'Mượn phục vụ môn học',
    });
  });
});
