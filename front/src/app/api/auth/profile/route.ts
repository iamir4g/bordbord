import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getStrapiBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
}

export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("strapi_jwt")?.value ?? null;

  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await req.json().catch(() => null)) as {
    firstName?: string;
    lastName?: string;
    username?: string;
  } | null;

  const url = new URL("/api/otp-auth/profile", getStrapiBaseUrl());
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      firstName: payload?.firstName ?? "",
      lastName: payload?.lastName ?? "",
      username: payload?.username ?? "",
    }),
  });

  const json = (await res.json().catch(() => null)) as {
    user?: unknown;
    message?: string;
    error?: string;
  } | null;

  if (!res.ok) {
    return NextResponse.json(
      { error: json?.error ?? "به‌روزرسانی پروفایل ناموفق بود." },
      { status: res.status },
    );
  }

  return NextResponse.json({
    user: json?.user ?? null,
    message: json?.message ?? "پروفایل با موفقیت به‌روزرسانی شد.",
  });
}
