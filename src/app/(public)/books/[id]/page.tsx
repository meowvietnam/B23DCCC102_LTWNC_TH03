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
      <h1>{book.title}</h1>
      <p>Tác giả: {book.author}</p>
      <p>Chuyên mục: {book.category}</p>
      <p>Số bản: {book.copies}</p>
      <p className="muted">Cập nhật lúc: {nowTime()}</p>
      <Link href={`/loans?book=${book.id}`}>Mượn sách này</Link>
    </article>
  );
}
