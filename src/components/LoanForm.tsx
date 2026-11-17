'use client';

import { useActionState } from 'react';
import { TERMS } from '@/data/books';
import { TERM_LABEL } from '@/lib/format';
import type { LoanErrors, LoanFormState } from '@/lib/loan-validate';
import type { Book } from '@/types';

export interface LoanFormProps {
  books: Book[];
  defaultBookId?: number;
  action: (prev: LoanFormState, formData: FormData) => Promise<LoanFormState>;
}

const initialState: LoanFormState = { errors: {}, values: {} };

function FieldError({ errors, name }: { errors: LoanErrors; name: keyof LoanErrors }) {
  const message = errors[name];
  if (!message) return null;
  return (
    <p id={`${name}-error`} role="alert" className="field-error">
      {message}
    </p>
  );
}

export default function LoanForm({ books, defaultBookId, action }: LoanFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const { errors, values } = state;

  // React 19 xóa form sau mỗi lần gửi: đổi key để dựng lại form với defaultValue mới.
  const formKey = JSON.stringify(values) + (state.message ?? '');

  return (
    <form key={formKey} action={formAction} noValidate>
      <h2>Gửi yêu cầu mượn</h2>

      <div className="field">
        <label htmlFor="bookId">Sách</label>
        <select
          id="bookId"
          name="bookId"
          defaultValue={values.bookId ?? (defaultBookId ? String(defaultBookId) : '')}
        >
          <option value="">-- Chọn sách --</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} ({b.copies} bản)
            </option>
          ))}
        </select>
        <FieldError errors={errors} name="bookId" />
      </div>

      <div className="field">
        <label htmlFor="pickupDate">Ngày lấy sách</label>
        <input
          id="pickupDate"
          name="pickupDate"
          type="date"
          defaultValue={values.pickupDate ?? ''}
        />
        <FieldError errors={errors} name="pickupDate" />
      </div>

      <div className="field">
        <label htmlFor="term">Thời hạn mượn</label>
        <select id="term" name="term" defaultValue={values.term ?? ''}>
          <option value="">-- Chọn thời hạn --</option>
          {TERMS.map((t) => (
            <option key={t} value={t}>
              {TERM_LABEL[t]}
            </option>
          ))}
        </select>
        <FieldError errors={errors} name="term" />
      </div>

      <div className="field">
        <label htmlFor="quantity">Số quyển</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          defaultValue={values.quantity ?? '1'}
        />
        <FieldError errors={errors} name="quantity" />
      </div>

      <div className="field">
        <label htmlFor="reason">Lý do mượn</label>
        <textarea id="reason" name="reason" rows={3} defaultValue={values.reason ?? ''} />
        <FieldError errors={errors} name="reason" />
      </div>

      <button type="submit" disabled={pending}>
        Gửi yêu cầu
      </button>

      {state.message && (
        <p role="status" className={state.ok ? 'message-ok' : 'message-error'}>
          {state.message}
        </p>
      )}
    </form>
  );
}
