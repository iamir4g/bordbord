import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/organisms/app-shell";

export const metadata: Metadata = {
  title: "بازی‌گیک | بوردبرد",
  description: "مرجع منتقدین و کلوب هواداران بازی‌های رومیزی ایران",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
