import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getBookById } from "@/lib/books";
import { nowTime } from "@/lib/time";

// ISR: trang tĩnh được tạo lại tối đa mỗi 60 giây.
export const revalidate = 60;

interface BookPageProps {
  params: Promise<{ id: string }>;
}

// SSG: chỉ sinh sẵn 12 sách đầu, các sách còn lại sinh khi có yêu cầu lần đầu.
export function generateStaticParams(): { id: string }[] {
  return db.books.slice(0, 12).map((b) => ({ id: String(b.id) }));
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(Number(id));
  if (!book) return { title: "Không tìm thấy sách" };
  return {
    title: `${book.title} – ${book.author}`,
    description: `Sách ${book.category}, thư viện có ${book.copies} bản`,
  };
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const { id } = await params;
  const book = await getBookById(Number(id));
  if (!book) notFound();

  return (
    <article>
      <Link href="/books" className="back-link">
        ← Danh mục sách
      </Link>
      <div className="card book-detail">
        <div className="book-cover" aria-hidden="true">
          {book.title}
        </div>
        <div>
          <span className="badge badge-brand">{book.category}</span>
          <h1 style={{ marginTop: 10 }}>{book.title}</h1>
          <ul className="meta">
            <li>Tác giả: {book.author}</li>
            <li>Chuyên mục: {book.category}</li>
            <li>Số bản: {book.copies}</li>
          </ul>
          <Link href={`/loans?book=${book.id}`} className="btn">
            Mượn sách này
          </Link>
          <p className="muted small" style={{ marginTop: 16 }}>
            Cập nhật lúc: {nowTime()}
          </p>
        </div>
      </div>
    </article>
  );
}
