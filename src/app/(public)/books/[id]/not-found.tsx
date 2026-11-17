import Link from "next/link";

export default function BookNotFound() {
  return (
    <section>
      <h1>Không tìm thấy sách</h1>
      <Link href="/books">Quay lại danh mục sách</Link>
    </section>
  );
}
