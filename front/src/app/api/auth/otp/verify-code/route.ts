import { NextResponse } from "next/server";

import { normalizePhone } from "@/lib/auth-phone";
import { otpForBackend } from "@/lib/digits";

function getStrapiBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
}

function extractErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (typeof error === "string" && error.trim()) return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => null)) as
    | { phone?: string; code?: string }
    | null;

  const phone = normalizePhone(payload?.phone ?? "");
  const code = otpForBackend(payload?.code ?? "");

  if (!phone || !code) {
    return NextResponse.json(
      { error: "شماره موبایل و کد تایید الزامی است." },
      { status: 400 },
    );
  }

  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: "شماره موبایل معتبر نیست." },
      { status: 400 },
    );
  }

  if (!/^\d{4}$/.test(code)) {
    return NextResponse.json(
      { error: "کد تایید باید ۴ رقمی باشد." },
      { status: 400 },
    );
  }

  const url = new URL("/api/otp-auth/verify-code", getStrapiBaseUrl());
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, code }),
    });
  } catch {
    return NextResponse.json(
      { error: "ارتباط با سرور احراز هویت برقرار نشد." },
      { status: 502 },
    );
  }

  const json = (await res.json().catch(() => null)) as
    | {
        jwt?: string;
        isNewUser?: boolean;
        user?: unknown;
        error?: unknown;
        remainingAttempts?: number;
      }
    | null;

  if (!res.ok || !json?.jwt) {
    const status = res.status >= 400 ? res.status : 400;
    return NextResponse.json(
      {
        error: extractErrorMessage(json?.error, "تایید کد ناموفق بود."),
        remainingAttempts:
          typeof json?.remainingAttempts === "number"
            ? json.remainingAttempts
            : undefined,
      },
      { status },
    );
  }

  const response = NextResponse.json({
    user: json.user ?? null,
    isNewUser: Boolean(json.isNewUser),
  });
  response.cookies.set({
    name: "strapi_jwt",
    value: json.jwt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return response;
}
