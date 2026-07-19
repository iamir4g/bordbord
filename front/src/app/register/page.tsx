"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { OtpAuthForm } from "@/components/organisms/otp-auth-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  return (
    <div className="flex flex-1 flex-col">
      <Container className="py-10">
        <div className="mx-auto w-full max-w-md">
          <Heading className="text-2xl text-slate-100">ثبت‌نام با موبایل</Heading>
          <div className="mt-2 text-sm text-slate-400">
            حساب داری؟{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-amber-400 hover:underline"
            >
              وارد شو
            </Link>
          </div>

          <Card className="mt-6 border-amber-500/10">
            <CardHeader className="text-sm font-semibold text-slate-100">
              ساخت حساب با کد تایید
            </CardHeader>
            <CardContent>
              <OtpAuthForm
                redirectTo={redirectTo}
                submitLabel="ارسال کد ثبت‌نام"
                introText="حساب کاربری شما با شماره موبایل ساخته می‌شود و بعدا می‌توانی از داخل پروفایل برای آن رمز عبور تعیین کنی."
              />
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-400">
                بعد از ثبت‌نام با OTP مستقیما وارد حساب می‌شوی. اگر بخواهی ورودهای
                بعدی با رمز هم داشته باشی، از بخش پروفایل رمز عبور تعیین کن.
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">
            <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`}>
              <Button variant="ghost" className="w-full">
                ورود با رمز عبور یا کد OTP
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
