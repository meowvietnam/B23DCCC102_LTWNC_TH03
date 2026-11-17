import { describe, expect, it } from 'vitest';
import { formatDate, STATUS_LABEL, TERM_LABEL } from './format';

describe('format', () => {
  it('formatDate đổi YYYY-MM-DD thành dd/mm/yyyy', () => {
    expect(formatDate('2026-12-02')).toBe('02/12/2026');
  });

  it('có nhãn tiếng Việt cho thời hạn và trạng thái', () => {
    expect(TERM_LABEL[14]).toBe('14 ngày');
    expect(STATUS_LABEL.pending).toBe('Chờ duyệt');
  });
});
