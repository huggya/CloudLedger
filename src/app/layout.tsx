import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudLedger 记账本",
  description: "CloudLedger 公网版个人在线记账本"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
