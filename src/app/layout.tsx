import type { Metadata } from "next";
import Header from "@/components/Header";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Thư viện khoa CNTT",
    template: "%s | Thư viện khoa",
  },
  description: "Tra cứu và đăng ký mượn sách tại thư viện khoa CNTT.",
};

// Không gọi auth() ở đây để giữ các trang công khai là SSG.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
