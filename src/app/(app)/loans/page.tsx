import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import LoanForm from '@/components/LoanForm';
import { db } from '@/lib/db';
import { formatDate, STATUS_LABEL, TERM_LABEL } from '@/lib/format';
import { listLoans, parseStatus } from '@/lib/loans';
import { can } from '@/lib/permissions';
import type { LoanStatus } from '@/types';
import { cancelLoanAction, createLoanAction } from './actions';

export const metadata: Metadata = {
  title: 'Sách đã mượn',
  robots: { index: false },
};

type Param = string | string[] | undefined;

interface LoansPageProps {
  searchParams: Promise<{ status?: Param; page?: Param; book?: Param }>;
}

const first = (v: Param): string => (Array.isArray(v) ? v[0] : v) ?? '';

const pageHref = (status: LoanStatus | undefined, page: number): string =>
  `/loans?${new URLSearchParams({ status: status ?? '', page: String(page) })}`;

const STATUS_OPTIONS: LoanStatus[] = ['pending', 'approved', 'rejected'];

export default async function LoansPage({ searchParams }: LoansPageProps) {
  const session = await auth();
  const user = session?.user;
  if (!user?.email) redirect('/login?callbackUrl=%2Floans');

  const params = await searchParams;
  const status = parseStatus(first(params.status));
  const result = listLoans(
    { email: user.email, role: user.role },
    status,
    Number(first(params.page)) || 1,
  );

  const canCreate = can(user.role, 'loan:create');
  const showOwner = can(user.role, 'loan:view-all');
  const bookParam = Number(first(params.book));
  const defaultBookId = db.books.some((b) => b.id === bookParam) ? bookParam : undefined;

  return (
    <section>
      <div className="page-head">
        <h1>Sách đã mượn</h1>
        <span className="muted small">{result.total} yêu cầu</span>
      </div>

      <form method="get" action="/loans" className="card filters">
        <div className="field">
          <label htmlFor="status">Trạng thái</label>
          <select id="status" name="status" defaultValue={status ?? ''}>
            <option value="">Tất cả</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field action">
          <button type="submit">Lọc</button>
        </div>
      </form>

      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Tên sách</th>
            <th>Ngày lấy</th>
            <th>Thời hạn</th>
            <th>Số quyển</th>
            <th>Trạng thái</th>
            {showOwner && <th>Người mượn</th>}
            {canCreate && <th>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {result.items.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.bookTitle}</td>
              <td>{formatDate(loan.pickupDate)}</td>
              <td>{TERM_LABEL[loan.term]}</td>
              <td>{loan.quantity} quyển</td>
              <td>
                <span className={`badge badge-${loan.status}`}>
                  {STATUS_LABEL[loan.status]}
                </span>
              </td>
              {showOwner && <td className="muted">{loan.userEmail}</td>}
              {canCreate && (
                <td className="actions-cell">
                  {loan.status === 'pending' && loan.userEmail === user.email && (
                    <form className="inline" action={cancelLoanAction.bind(null, loan.id)}>
                      <button type="submit" className="btn-ghost btn-sm">Hủy</button>
                    </form>
                  )}
                </td>
              )}
            </tr>
          ))}
          {result.items.length === 0 && (
            <tr>
              <td colSpan={7} className="empty">Chưa có yêu cầu nào</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      <div className="pagination">
        {result.page > 1 ? (
          <Link href={pageHref(status, result.page - 1)}>Trước</Link>
        ) : (
          <span className="disabled">Trước</span>
        )}
        <span className="page-info">
          Trang {result.page}/{result.totalPages}
        </span>
        {result.page < result.totalPages ? (
          <Link href={pageHref(status, result.page + 1)}>Sau</Link>
        ) : (
          <span className="disabled">Sau</span>
        )}
      </div>

      {canCreate && (
        <div className="card">
          <LoanForm books={db.books} defaultBookId={defaultBookId} action={createLoanAction} />
        </div>
      )}
    </section>
  );
}
