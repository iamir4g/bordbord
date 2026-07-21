import { NextResponse } from "next/server";

import { isValidIranPhone, normalizePhone } from "@/lib/auth-phone";

function getStrapiBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
}

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => null)) as {
    identifier?: string;
    email?: string;
    password?: string;
  } | null;

  const rawIdentifier = payload?.identifier ?? payload?.email ?? "";
  const password = payload?.password ?? "";

  if (!rawIdentifier || !password) {
    return NextResponse.json(
      { error: "نام کاربری/شماره موبایل و رمز عبور الزامی است." },
      { status: 400 },
    );
  }

  const identifier =
    isValidIranPhone(rawIdentifier) || rawIdentifier.startsWith("09")
      ? normalizePhone(rawIdentifier)
      : rawIdentifier.trim();

  const url = new URL("/api/otp-auth/login", getStrapiBaseUrl());
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password }),
  });

  const json = (await res.json().catch(() => null)) as {
    jwt?: string;
    user?: unknown;
    error?: string;
  } | null;

  if (!res.ok || !json?.jwt) {
    return NextResponse.json(
      { error: json?.error ?? "نام کاربری یا رمز عبور اشتباه است." },
      { status: res.status === 401 || res.status === 403 ? res.status : 401 },
    );
  }

  const response = NextResponse.json({ user: json.user ?? null });
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
