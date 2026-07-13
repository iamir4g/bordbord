import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getStrapiBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
}

export async function GET() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("strapi_jwt")?.value ?? null;
  if (!jwt) {
    return NextResponse.json({ user: null });
  }

  const url = new URL("/api/users/me", getStrapiBaseUrl());
  let res: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      res = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        cache: "no-store",
      });
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
  }

  if (!res) {
    return NextResponse.json({ user: null }, { status: 503 });
  }

  if (!res.ok) {
    const response = NextResponse.json({ user: null }, { status: 401 });
    response.cookies.set({
      name: "strapi_jwt",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  const user = (await res.json().catch(() => null)) as {
    id?: number;
    username?: string;
    email?: string;
  } | null;

  if (!user || typeof user.id !== "number") {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: user.id, username: user.username, email: user.email },
  });
}
