import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { generateBooks } from '@/data/books';
import type { LoanFormState } from '@/lib/loan-validate';
import LoanForm from './LoanForm';

const books = generateBooks(24);

type Action = (prev: LoanFormState, formData: FormData) => Promise<LoanFormState>;

const mockAction = (result: LoanFormState) =>
  vi.fn<Action>(async () => result);

describe('LoanForm', () => {
  it('action trả errors thì lỗi hiện ra ngay dưới đúng ô', async () => {
    const user = userEvent.setup();
    const action = mockAction({
      errors: { bookId: 'Hãy chọn sách', reason: 'Lý do tối thiểu 10 ký tự' },
      values: {},
    });
    render(<LoanForm books={books} action={action} />);

    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    const bookError = await screen.findByText('Hãy chọn sách');
    expect(bookError).toHaveAttribute('role', 'alert');
    expect(screen.getByLabelText('Sách').closest('.field')).toContainElement(bookError);
    expect(screen.getByLabelText('Lý do mượn').closest('.field')).toContainElement(
      screen.getByText('Lý do tối thiểu 10 ký tự'),
    );
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('điền hợp lệ thì action được gọi 1 lần với đúng FormData', async () => {
    const user = userEvent.setup();
    const action = mockAction({ errors: {}, values: {}, message: 'Đã gửi yêu cầu, chờ duyệt', ok: true });
    render(<LoanForm books={books} action={action} />);

    await user.selectOptions(screen.getByLabelText('Sách'), '3');
    await user.type(screen.getByLabelText('Ngày lấy sách'), '2099-01-15');
    await user.selectOptions(screen.getByLabelText('Thời hạn mượn'), '14');
    const quantity = screen.getByLabelText('Số quyển');
    await user.clear(quantity);
    await user.type(quantity, '2');
    await user.type(screen.getByLabelText('Lý do mượn'), 'Mượn phục vụ môn học');
    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    expect(await screen.findByText('Đã gửi yêu cầu, chờ duyệt')).toBeInTheDocument();
    expect(action).toHaveBeenCalledTimes(1);
    const formData = action.mock.calls[0][1];
    expect(formData.get('bookId')).toBe('3');
    expect(formData.get('term')).toBe('14');
    expect(formData.get('quantity')).toBe('2');
  });

  it('action trả message hết bản cùng values thì hiện thông báo và giữ lý do đã nhập', async () => {
    const user = userEvent.setup();
    const values = {
      bookId: '6', pickupDate: '2026-12-02', term: '14', quantity: '1',
      reason: 'Mượn học môn an toàn mạng',
    };
    const action = mockAction({ errors: {}, values, message: 'Sách đã hết bản vào ngày này' });
    render(<LoanForm books={books} action={action} />);

    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    expect(await screen.findByText('Sách đã hết bản vào ngày này')).toBeInTheDocument();
    expect(screen.getByLabelText('Lý do mượn')).toHaveValue('Mượn học môn an toàn mạng');
    expect(screen.getByLabelText('Sách')).toHaveValue('6');
    expect(screen.getByLabelText('Thời hạn mượn')).toHaveValue('14');
  });

  it('có defaultBookId thì ô Sách được chọn sẵn', () => {
    render(<LoanForm books={books} defaultBookId={6} action={mockAction({ errors: {}, values: {} })} />);

    expect(screen.getByLabelText('Sách')).toHaveValue('6');
    expect(screen.getByRole('option', { name: 'An toàn mạng (1 bản)' })).toHaveProperty(
      'selected',
      true,
    );
  });
});
