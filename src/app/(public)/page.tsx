import Link from "next/link";
import { db } from "@/lib/db";

// SSG: không đọc cookie/searchParams nên được sinh sẵn HTML tĩnh khi build.
export default function HomePage() {
  const bookCount = db.books.length;
  const categoryCount = new Set(db.books.map((b) => b.category)).size;

  return (
    <section>
      <h1>Thư viện khoa CNTT PTIT</h1>
      <p>
        {bookCount} đầu sách · {categoryCount} chuyên mục
      </p>
      <Link href="/books">Xem danh mục sách</Link>
    </section>
  );
}
