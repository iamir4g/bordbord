"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { OtpAuthForm } from "@/components/organisms/otp-auth-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/organisms/auth-provider";
import { normalizePhone } from "@/lib/auth-phone";
import { looksLikePhoneInput, toPersianDigits } from "@/lib/digits";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();

  const redirectTo = searchParams.get("redirect") ?? "/";

  const [mode, setMode] = React.useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: looksLikePhoneInput(identifier)
            ? normalizePhone(identifier)
            : identifier,
          password,
        }),
      });

      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(json?.error ?? "ورود ناموفق بود.");
        return;
      }

      await refresh();
      router.push(redirectTo);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Container className="py-10">
        <div className="mx-auto w-full max-w-md">
          <Heading className="text-2xl text-slate-100">ورود به حساب</Heading>
          <div className="mt-2 text-sm text-slate-400">
            حساب ندارید؟{" "}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-amber-400 hover:underline"
            >
              ثبت‌نام کنید
            </Link>
          </div>

          <Card className="mt-6 border-amber-500/10">
            <CardHeader className="text-sm font-semibold text-slate-100">
              ورود / عضویت
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mode === "password" ? "default" : "outline"}
                  onClick={() => setMode("password")}
                >
                  ورود با رمز
                </Button>
                <Button
                  type="button"
                  variant={mode === "otp" ? "default" : "outline"}
                  onClick={() => setMode("otp")}
                >
                  ورود با OTP
                </Button>
              </div>

              {mode === "password" ? (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">
                      شماره موبایل یا نام کاربری
                    </label>
                    <Input
                      value={
                        looksLikePhoneInput(identifier)
                          ? toPersianDigits(identifier)
                          : identifier
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const raw = e.target.value;
                        setIdentifier(
                          looksLikePhoneInput(raw)
                            ? normalizePhone(raw)
                            : raw,
                        );
                      }}
                      autoComplete="username"
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹ یا username"
                      required
                      dir="ltr"
                      className="text-left"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">رمز عبور</label>
                    <Input
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                      type="password"
                      autoComplete="current-password"
                      required
                      dir="ltr"
                      className="text-left"
                    />
                  </div>

                  {error ? (
                    <div className="text-sm text-rose-400">{error}</div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? "در حال ورود…" : "ورود با رمز عبور"}
                  </Button>
                </form>
              ) : (
                <OtpAuthForm
                  redirectTo={redirectTo}
                  submitLabel="ارسال کد ورود"
                  introText="با شماره موبایل کد تایید دریافت می‌کنی. اگر رمز عبور هم تعیین کرده‌ای، می‌توانی از تب «ورود با رمز» استفاده کنی."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
