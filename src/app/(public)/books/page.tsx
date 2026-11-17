import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/data/books";
import { getBooks } from "@/lib/books";
import { nowTime } from "@/lib/time";
import type { Category } from "@/types";

export const metadata: Metadata = {
  title: "Danh mục sách",
};

interface BooksPageProps {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[] }>;
}

const first = (v: string | string[] | undefined): string =>
  (Array.isArray(v) ? v[0] : v) ?? "";

const toCategory = (v: string): Category | undefined =>
  CATEGORIES.find((c) => c === v);

// SSR: đọc searchParams nên render lại theo từng request.
export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams;
  const q = first(params.q);
  const category = toCategory(first(params.category));
  const books = await getBooks({ category, q });

  return (
    <section>
      <h1>Danh mục sách</h1>
      <form method="get" action="/books" className="filters">
        <div className="field">
          <label htmlFor="q">Tìm sách</label>
          <input id="q" name="q" type="search" defaultValue={q} />
        </div>
        <div className="field">
          <label htmlFor="category">Chuyên mục</label>
          <select id="category" name="category" defaultValue={category ?? ""}>
            <option value="">Tất cả</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <button type="submit">Lọc</button>
        </div>
      </form>

      <p>Tìm thấy {books.length} sách</p>
      <p className="muted">Render lúc: {nowTime()}</p>

      {books.length === 0 ? (
        <p>Không tìm thấy sách nào</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tên sách</th>
              <th>Tác giả</th>
              <th>Số bản</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>
                  <Link href={`/books/${b.id}`}>{b.title}</Link>
                </td>
                <td>{b.author}</td>
                <td>Số bản: {b.copies}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
