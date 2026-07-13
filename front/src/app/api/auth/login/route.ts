import { NextResponse } from "next/server";

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

  const identifier = payload?.identifier ?? payload?.email ?? "";
  const password = payload?.password ?? "";

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Missing credentials." },
      { status: 400 },
    );
  }

  const url = new URL("/api/auth/local", getStrapiBaseUrl());
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
    error?: unknown;
  } | null;

  if (!res.ok || !json?.jwt) {
    return NextResponse.json(
      { error: "Invalid email/username or password." },
      { status: 401 },
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
