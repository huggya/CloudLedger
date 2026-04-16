import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudLedger",
  description: "A public-web personal ledger powered by Next.js and Supabase"
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
