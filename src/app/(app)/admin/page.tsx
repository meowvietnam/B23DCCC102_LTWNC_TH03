import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { formatDate, STATUS_LABEL, TERM_LABEL } from '@/lib/format';
import { countByStatus, listPendingLoans } from '@/lib/loans';
import { can } from '@/lib/permissions';
import type { LoanStatus } from '@/types';
import { reviewLoan } from './actions';

export const metadata: Metadata = {
  title: 'Duyệt yêu cầu mượn',
  robots: { index: false },
};

const STATUSES: LoanStatus[] = ['pending', 'approved', 'rejected'];

export default async function AdminPage() {
  // Bảo vệ lớp 2: kiểm tra lại quyền ngay trong trang (phòng khi proxy cấu hình sai).
  const session = await auth();
  if (!can(session?.user?.role, 'loan:view-all')) redirect('/forbidden');

  const counts = countByStatus();
  const pending = listPendingLoans();

  return (
    <section>
      <div className="page-head">
        <h1>Duyệt yêu cầu mượn</h1>
      </div>

      <div className="stat-cards">
        {STATUSES.map((s) => (
          <div key={s} className="card stat-card">
            <span className={`badge badge-${s}`}>{STATUS_LABEL[s]}</span>
            <div className="num">{counts[s]}</div>
          </div>
        ))}
      </div>
      <p className="muted small">
        Chờ duyệt: {counts.pending} | Đã duyệt: {counts.approved} | Từ chối:{' '}
        {counts.rejected}
      </p>

      {pending.length === 0 ? (
        <div className="card empty">Không còn yêu cầu nào chờ duyệt</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tên sách</th>
                <th>Ngày lấy</th>
                <th>Thời hạn</th>
                <th>Người mượn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.bookTitle}</td>
                  <td>{formatDate(loan.pickupDate)}</td>
                  <td>{TERM_LABEL[loan.term]}</td>
                  <td className="muted">{loan.userEmail}</td>
                  <td className="actions-cell">
                    <form className="inline" action={reviewLoan.bind(null, loan.id, 'approved')}>
                      <button type="submit" className="btn-ok btn-sm">Duyệt</button>
                    </form>{' '}
                    <form className="inline" action={reviewLoan.bind(null, loan.id, 'rejected')}>
                      <button type="submit" className="btn-ghost btn-sm">Từ chối</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
