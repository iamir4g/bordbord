import { NextResponse } from "next/server";

function getStrapiBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
}

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => null)) as
    | { phone?: string; code?: string }
    | null;

  const phone = payload?.phone ?? "";
  const code = payload?.code ?? "";

  if (!phone || !code) {
    return NextResponse.json(
      { error: "شماره موبایل و کد تایید الزامی است." },
      { status: 400 },
    );
  }

  const url = new URL("/api/otp-auth/verify-code", getStrapiBaseUrl());
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone, code }),
  });

  const json = (await res.json().catch(() => null)) as
    | {
        jwt?: string;
        isNewUser?: boolean;
        user?: unknown;
        error?: string;
        remainingAttempts?: number;
      }
    | null;

  if (!res.ok || !json?.jwt) {
    return NextResponse.json(
      {
        error: json?.error ?? "تایید کد ناموفق بود.",
        remainingAttempts:
          typeof json?.remainingAttempts === "number"
            ? json.remainingAttempts
            : undefined,
      },
      { status: res.status || 400 },
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
