import Link from "next/link";
import { CATEGORIES } from "@/data/books";
import { db } from "@/lib/db";
import type { Category } from "@/types";

const CATEGORY_ICON: Record<Category, string> = {
  "Lập trình": "💻",
  "Mạng máy tính": "🌐",
  "Cơ sở dữ liệu": "🗄️",
  "Toán rời rạc": "∑",
};

// SSG: không đọc cookie/searchParams nên được sinh sẵn HTML tĩnh khi build.
export default function HomePage() {
  const bookCount = db.books.length;
  const categoryCount = new Set(db.books.map((b) => b.category)).size;

  return (
    <>
      <section className="hero">
        <h1>Thư viện khoa CNTT PTIT</h1>
        <p>Tra cứu sách chuyên ngành và đăng ký mượn trực tuyến.</p>
        <div className="stats">
          <span className="stat-pill">
            {bookCount} đầu sách · {categoryCount} chuyên mục
          </span>
        </div>
        <Link href="/books" className="btn">
          Xem danh mục sách
        </Link>
      </section>

      <h2>Chuyên mục</h2>
      <div className="grid">
        {CATEGORIES.map((c) => {
          const books = db.books.filter((b) => b.category === c);
          const copies = books.reduce((sum, b) => sum + b.copies, 0);
          return (
            <Link
              key={c}
              href={`/books?category=${encodeURIComponent(c)}`}
              className="card cat-card"
            >
              <span className="icon" aria-hidden="true">
                {CATEGORY_ICON[c]}
              </span>
              <h3>{c}</h3>
              <p className="muted small">
                {books.length} đầu sách · {copies} bản
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
