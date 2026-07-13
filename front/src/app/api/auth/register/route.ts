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
    | { username?: string; email?: string; password?: string }
    | null;

  const username = payload?.username ?? "";
  const email = payload?.email ?? "";
  const password = payload?.password ?? "";

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const url = new URL("/api/auth/local/register", getStrapiBaseUrl());
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  const json = (await res.json().catch(() => null)) as
    | { jwt?: string; user?: unknown; error?: unknown }
    | null;

  if (!res.ok || !json?.jwt) {
    const msg =
      typeof (json as { error?: { message?: string } } | null)?.error?.message ===
      "string"
        ? (json as { error: { message: string } }).error.message
        : "Registration failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
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

