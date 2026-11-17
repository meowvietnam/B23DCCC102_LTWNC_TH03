export default function MemberLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <p className="member-banner">Khu vực thành viên</p>
      {children}
    </>
  );
}
