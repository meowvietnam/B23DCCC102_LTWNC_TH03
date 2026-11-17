import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { formatDate, TERM_LABEL } from '@/lib/format';
import { countByStatus, listPendingLoans } from '@/lib/loans';
import { can } from '@/lib/permissions';
import { reviewLoan } from './actions';

export const metadata: Metadata = {
  title: 'Duyệt yêu cầu mượn',
  robots: { index: false },
};

export default async function AdminPage() {
  // Bảo vệ lớp 2: kiểm tra lại quyền ngay trong trang (phòng khi proxy cấu hình sai).
  const session = await auth();
  if (!can(session?.user?.role, 'loan:view-all')) redirect('/forbidden');

  const counts = countByStatus();
  const pending = listPendingLoans();

  return (
    <section>
      <h1>Duyệt yêu cầu mượn</h1>
      <p>
        Chờ duyệt: {counts.pending} | Đã duyệt: {counts.approved} | Từ chối:{' '}
        {counts.rejected}
      </p>
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
              <td>{loan.userEmail}</td>
              <td>
                <form className="inline" action={reviewLoan.bind(null, loan.id, 'approved')}>
                  <button type="submit">Duyệt</button>
                </form>{' '}
                <form className="inline" action={reviewLoan.bind(null, loan.id, 'rejected')}>
                  <button type="submit">Từ chối</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
