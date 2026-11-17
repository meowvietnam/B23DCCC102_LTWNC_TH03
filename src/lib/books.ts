import { db } from './db';
import type { Book, Category } from '@/types';

export interface BookFilter {
  category?: Category;
  q?: string;
}

/** Lấy danh sách sách theo chuyên mục và từ khóa (giả lập truy vấn chậm 800ms). */
export async function getBooks(filter: BookFilter = {}): Promise<Book[]> {
  await new Promise((r) => setTimeout(r, 800));
  const q = filter.q?.trim().toLowerCase() ?? '';
  return db.books.filter(
    (b) =>
      (!filter.category || b.category === filter.category) &&
      (!q || b.title.toLowerCase().includes(q)),
  );
}

/** Lấy 1 sách theo id, không có thì trả undefined. */
export async function getBookById(id: number): Promise<Book | undefined> {
  return db.books.find((b) => b.id === id);
}
