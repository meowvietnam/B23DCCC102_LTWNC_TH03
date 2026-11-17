import Link from "next/link";

export default function BookNotFound() {
  return (
    <section className="card empty">
      <h1>Không tìm thấy sách</h1>
      <p>Sách bạn tìm không có trong thư viện.</p>
      <Link href="/books" className="btn">
        Quay lại danh mục sách
      </Link>
    </section>
  );
}
