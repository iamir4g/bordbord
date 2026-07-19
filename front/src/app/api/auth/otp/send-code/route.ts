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
    | { phone?: string }
    | null;

  const phone = payload?.phone ?? "";
  if (!phone) {
    return NextResponse.json(
      { error: "شماره موبایل الزامی است." },
      { status: 400 },
    );
  }

  const url = new URL("/api/otp-auth/send-code", getStrapiBaseUrl());
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone }),
  });

  const json = (await res.json().catch(() => null)) as
    | {
        error?: { message?: string };
        phone?: string;
        expiresInSeconds?: number;
        resendInSeconds?: number;
        debugCode?: string;
      }
    | null;

  if (!res.ok) {
    const message =
      typeof json?.error?.message === "string"
        ? json.error.message
        : "ارسال کد تایید ناموفق بود.";
    return NextResponse.json({ error: message }, { status: res.status });
  }

  return NextResponse.json({
    phone: json?.phone ?? phone,
    expiresInSeconds: json?.expiresInSeconds ?? null,
    resendInSeconds: json?.resendInSeconds ?? null,
    debugCode: json?.debugCode,
  });
}
