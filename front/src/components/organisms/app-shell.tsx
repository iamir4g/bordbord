"use client";

import Link from "next/link";
import * as React from "react";
import { Suspense } from "react";

import { AuthProvider } from "@/components/organisms/auth-provider";
import { Header } from "@/components/organisms/header";
import { PageTransition } from "@/components/organisms/page-transition";

function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12" dir="rtl">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 text-right text-xs text-slate-400 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
            <strong className="font-sans text-sm font-extrabold text-amber-500">
              بوردبرد (boardbord.com)
            </strong>
          </div>
          <p className="text-justify leading-relaxed text-slate-400">
            بوردبرد مرجع مستقل نقد، بررسی تخصصی و ارزیابی چندبعدی بوردگیم‌ها و
            بازی‌های رومیزی تولید ایران و جهان است.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-200">بخش‌های کلیدی سامانه</h4>
          <ul className="space-y-2.5">
            <li>
              <Link href="/" className="transition-colors hover:text-amber-400">
                صفحه اصلی
              </Link>
            </li>
            <li>
              <Link href="/games" className="transition-colors hover:text-amber-400">
                کاتالوگ جامع بازی‌های رومیزی
              </Link>
            </li>
            <li>
              <Link href="/rankings" className="transition-colors hover:text-amber-400">
                جدول رده‌بندی ملی بوردگیم‌ها
              </Link>
            </li>
            <li>
              <Link href="/compare" className="transition-colors hover:text-amber-400">
                سرویس مقایسه و تطبیق مشخصات
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-200">شورای مشارکت هواداران</h4>
          <p className="text-justify leading-relaxed text-slate-400">
            اطلاعات موجود بر روی پلتفرم بوردبرد به روش مشارکتی توسط بازیکنان و
            منتقدان غنی‌سازی می‌شود.
          </p>
          <span className="block pt-2 font-mono text-[10px] leading-normal text-slate-500" dir="ltr">
            boardbord.com © 2026 • All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-full flex-col bg-slate-900">
        <Suspense
          fallback={<div className="h-16 border-b border-slate-800 bg-slate-950" />}
        >
          <Header />
        </Suspense>
        <main className="flex flex-1 flex-col">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
      </div>
    </AuthProvider>
  );
}
