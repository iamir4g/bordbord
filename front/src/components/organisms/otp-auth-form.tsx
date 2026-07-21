"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { useAuth } from "@/components/organisms/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizePhone } from "@/lib/auth-phone";
import {
  formatOtpForDisplay,
  otpForBackend,
  sanitizeOtpInput,
  toPersianDigits,
} from "@/lib/digits";

type OtpAuthFormProps = {
  redirectTo: string;
  submitLabel: string;
  introText: string;
};

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds} ثانیه`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function OtpAuthForm({
  redirectTo,
  submitLabel,
  introText,
}: OtpAuthFormProps) {
  const router = useRouter();
  const { refresh } = useAuth();

  const [step, setStep] = React.useState<"phone" | "code">("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [resendCountdown, setResendCountdown] = React.useState(0);
  const [expiryCountdown, setExpiryCountdown] = React.useState(0);
  const [debugCode, setDebugCode] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = window.setTimeout(() => {
      setResendCountdown((prev: number) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  React.useEffect(() => {
    if (expiryCountdown <= 0) return;
    const timer = window.setTimeout(() => {
      setExpiryCountdown((prev: number) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [expiryCountdown]);

  async function handleSendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/otp/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(phone) }),
      });

      const json = (await res.json().catch(() => null)) as {
        error?: string;
        resendInSeconds?: number | null;
        expiresInSeconds?: number | null;
        cooldownSeconds?: number;
        debugCode?: string;
        phone?: string;
      } | null;

      if (!res.ok) {
        if (typeof json?.cooldownSeconds === "number" && json.cooldownSeconds > 0) {
          setResendCountdown(json.cooldownSeconds);
        }
        setError(json?.error ?? "ارسال کد تایید ناموفق بود.");
        return;
      }

      setPhone(
        json?.phone ? normalizePhone(json.phone) : normalizePhone(phone),
      );
      setDebugCode(typeof json?.debugCode === "string" ? json.debugCode : null);
      setResendCountdown(
        typeof json?.resendInSeconds === "number" ? json.resendInSeconds : 60,
      );
      setExpiryCountdown(
        typeof json?.expiresInSeconds === "number" ? json.expiresInSeconds : 180,
      );
      setCode("");
      setStep("code");
    } finally {
      setSending(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();

    if (expiryCountdown <= 0) {
      setError("کد تایید منقضی شده است. لطفا کد جدید دریافت کنید.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/otp/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizePhone(phone),
          code: otpForBackend(code),
        }),
      });

      const json = (await res.json().catch(() => null)) as {
        error?: string;
        remainingAttempts?: number;
      } | null;

      if (!res.ok) {
        const suffix =
          typeof json?.remainingAttempts === "number"
            ? ` (${json.remainingAttempts} تلاش باقی مانده)`
            : "";
        setError((json?.error ?? "کد تایید نامعتبر است.") + suffix);
        return;
      }

      await refresh();
      router.push(redirectTo);
    } finally {
      setVerifying(false);
    }
  }

  if (step === "phone") {
    return (
      <form onSubmit={handleSendCode} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-300">شماره موبایل</label>
          <Input
            value={toPersianDigits(phone)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPhone(normalizePhone(e.target.value))
            }
            inputMode="numeric"
            autoComplete="tel"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            required
            dir="ltr"
            className="text-left"
          />
          <p className="text-xs text-slate-500">{introText}</p>
        </div>

        {error ? <div className="text-sm text-rose-400">{error}</div> : null}

        <Button type="submit" disabled={sending} className="w-full">
          {sending ? "در حال ارسال..." : submitLabel}
        </Button>
      </form>
    );
  }

  const codeExpired = expiryCountdown <= 0;

  return (
    <form onSubmit={handleVerifyCode} className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-300">
        کد تایید به شماره{" "}
        <span className="font-bold text-amber-400">{toPersianDigits(phone)}</span>{" "}
        ارسال شد.
        {codeExpired ? (
          <p className="mt-2 text-rose-400">کد منقضی شده است. کد جدید دریافت کنید.</p>
        ) : (
          <p className="mt-2 text-slate-400">
            اعتبار کد:{" "}
            <span className="font-medium text-slate-200" dir="ltr">
              {formatCountdown(expiryCountdown)}
            </span>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">کد تایید ۴ رقمی</label>
        <Input
          value={formatOtpForDisplay(code)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCode(sanitizeOtpInput(e.target.value))
          }
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="۱۲۳۴"
          required
          dir="ltr"
          className="text-center text-lg tracking-[0.4em]"
        />
        {debugCode ? (
          <p className="text-xs text-amber-400">
            کد تستی محیط توسعه: {toPersianDigits(debugCode)}
          </p>
        ) : null}
      </div>

      {error ? <div className="text-sm text-rose-400">{error}</div> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          disabled={verifying || codeExpired}
          className="flex-1"
        >
          {verifying ? "در حال تایید..." : "تایید و ورود"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={sending || resendCountdown > 0}
          onClick={() => void handleSendCode()}
        >
          {sending
            ? "در حال ارسال..."
            : resendCountdown > 0
              ? `ارسال مجدد تا ${formatCountdown(resendCountdown)}`
              : "ارسال مجدد کد"}
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => {
          setStep("phone");
          setCode("");
          setError(null);
          setResendCountdown(0);
          setExpiryCountdown(0);
        }}
      >
        ویرایش شماره موبایل
      </Button>
    </form>
  );
}
