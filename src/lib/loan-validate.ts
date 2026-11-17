import type { Book, Term } from '@/types';

export interface LoanInput {
  bookId: string; pickupDate: string; term: string;
  quantity: string; reason: string;
}
export interface LoanData {
  bookId: number; pickupDate: string; term: 7 | 14 | 30;
  quantity: number; reason: string;
}
export type LoanErrors = Partial<Record<keyof LoanInput, string>>;
export interface LoanFormState {
  errors: LoanErrors;           // lỗi từng ô
  values: Partial<LoanInput>;   // giá trị đã nhập, để hiện lại khi có lỗi
  message?: string;             // thông báo chung (thành công hoặc lỗi từ server)
  ok?: boolean;                 // true nếu message là thông báo thành công
}

const FIELDS: (keyof LoanInput)[] = ['bookId', 'pickupDate', 'term', 'quantity', 'reason'];
const VALID_TERMS: Term[] = [7, 14, 30];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const POSITIVE_INT_RE = /^\d+$/;

const pad = (n: number): string => String(n).padStart(2, '0');

/** Ngày hôm nay dạng YYYY-MM-DD (theo giờ máy chạy). */
export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Chuỗi YYYY-MM-DD có phải một ngày có thật không (loại 2026-02-30). */
const isRealDate = (s: string): boolean => {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
  );
};

const toTerm = (s: string): Term | undefined =>
  VALID_TERMS.find((t) => String(t) === s.trim());

/** Đổi FormData hoặc object thành LoanInput; trường thiếu thành chuỗi rỗng. */
export function toLoanInput(raw: FormData | Record<string, unknown>): LoanInput {
  const read = (key: keyof LoanInput): string => {
    const v = raw instanceof FormData ? raw.get(key) : raw[key];
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    return '';
  };
  const input: LoanInput = { bookId: '', pickupDate: '', term: '', quantity: '', reason: '' };
  for (const f of FIELDS) input[f] = read(f);
  return input;
}

/** Nơi duy nhất giữ quy tắc kiểm tra. Trả object rỗng nghĩa là hợp lệ. */
export function validateLoan(input: LoanInput, books: Book[]): LoanErrors {
  const errors: LoanErrors = {};

  const book = books.find((b) => String(b.id) === input.bookId.trim());
  if (!book) errors.bookId = 'Hãy chọn sách';

  const date = input.pickupDate.trim();
  if (!isRealDate(date)) errors.pickupDate = 'Hãy chọn ngày';
  else if (date < today()) errors.pickupDate = 'Ngày lấy sách không được ở quá khứ';

  if (!toTerm(input.term)) errors.term = 'Hãy chọn thời hạn';

  const qty = input.quantity.trim();
  if (!POSITIVE_INT_RE.test(qty) || Number(qty) < 1) {
    errors.quantity = 'Số quyển phải từ 1 trở lên';
  } else if (book && Number(qty) > book.copies) {
    errors.quantity = `Vượt số bản của sách (${book.copies} bản)`;
  }

  if (input.reason.trim().length < 10) errors.reason = 'Lý do tối thiểu 10 ký tự';

  return errors;
}

/** Ép kiểu dữ liệu đã hợp lệ (chỉ gọi khi validateLoan không còn lỗi). */
export function toLoanData(input: LoanInput): LoanData {
  return {
    bookId: Number(input.bookId),
    pickupDate: input.pickupDate.trim(),
    term: toTerm(input.term) ?? 7,
    quantity: Number(input.quantity),
    reason: input.reason.trim(),
  };
}
