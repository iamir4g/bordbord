import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getStrapiBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("strapi_jwt")?.value ?? null;
  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await req.json().catch(() => null)) as
    | { password?: string }
    | null;
  const password = payload?.password ?? "";

  if (!password) {
    return NextResponse.json({ error: "رمز عبور الزامی است." }, { status: 400 });
  }

  const url = new URL("/api/otp-auth/set-password", getStrapiBaseUrl());
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ password }),
  });

  const json = (await res.json().catch(() => null)) as
    | { ok?: boolean; message?: string; error?: string }
    | null;

  if (!res.ok) {
    return NextResponse.json(
      { error: json?.error ?? "ذخیره رمز عبور ناموفق بود." },
      { status: res.status || 400 },
    );
  }

  return NextResponse.json({
    ok: Boolean(json?.ok),
    message: json?.message ?? "رمز عبور با موفقیت ذخیره شد.",
  });
}
