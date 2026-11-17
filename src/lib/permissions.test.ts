import { describe, expect, it } from 'vitest';
import { can } from './permissions';
import type { Action } from './permissions';

const ALL: Action[] = [
  'book:view', 'loan:create', 'loan:view-own', 'loan:view-all', 'loan:review',
];

describe('can() – ma trận quyền', () => {
  it('khách chỉ được xem sách (book:view)', () => {
    expect(ALL.filter((a) => can(undefined, a))).toEqual(['book:view']);
  });

  it('sinh viên gửi được yêu cầu mượn nhưng không được duyệt', () => {
    expect(can('student', 'loan:create')).toBe(true);
    expect(can('student', 'loan:view-own')).toBe(true);
    expect(can('student', 'loan:review')).toBe(false);
    expect(can('student', 'loan:view-all')).toBe(false);
  });

  it('admin duyệt được nhưng không gửi yêu cầu mượn', () => {
    expect(can('admin', 'loan:review')).toBe(true);
    expect(can('admin', 'loan:view-all')).toBe(true);
    expect(can('admin', 'loan:create')).toBe(false);
    expect(can('admin', 'loan:view-own')).toBe(false);
  });
});
