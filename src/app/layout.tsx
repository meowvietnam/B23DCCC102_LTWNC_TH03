import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Thư viện khoa CNTT",
    template: "%s | Thư viện khoa",
  },
  description: "Tra cứu và đăng ký mượn sách tại thư viện khoa CNTT.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <header className="site-header">
          <nav>
            <Link href="/">Trang chủ</Link>
            <Link href="/books">Sách</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
