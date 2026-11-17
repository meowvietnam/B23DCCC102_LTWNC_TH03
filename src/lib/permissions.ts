import type { Role } from '@/types';

export type Action =
  | 'book:view'
  | 'loan:create'
  | 'loan:view-own'
  | 'loan:view-all'
  | 'loan:review';

type Actor = Role | 'guest';

/** Ma trận quyền: mỗi vai trò được làm những action nào. */
const PERMISSIONS: Record<Actor, readonly Action[]> = {
  guest: ['book:view'],
  student: ['book:view', 'loan:create', 'loan:view-own'],
  admin: ['book:view', 'loan:view-all', 'loan:review'],
};

/** role undefined nghĩa là khách (chưa đăng nhập). */
export function can(role: Role | undefined, action: Action): boolean {
  return PERMISSIONS[role ?? 'guest'].includes(action);
}
