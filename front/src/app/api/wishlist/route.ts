import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getStrapiBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
}

async function getJwtFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const re = /(?:^|;\s*)strapi_jwt=([^;]+)/g;
  let match: RegExpExecArray | null = null;
  let last: string | null = null;
  while ((match = re.exec(cookieHeader)) !== null) {
    last = match[1] ?? null;
  }
  if (last) {
    try {
      return decodeURIComponent(last);
    } catch {
      return last;
    }
  }

  const cookieStore = await cookies();
  return cookieStore.get("strapi_jwt")?.value ?? null;
}

async function fetchJson(url: URL, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as unknown;
  return { res, json };
}

function getNested(obj: unknown, path: Array<string | number>) {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof key === "number") {
      if (!Array.isArray(cur)) return undefined;
      cur = cur[key];
      continue;
    }
    if (typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

async function getWishlistMe(jwt: string) {
  const url = new URL("/api/wishlist/me", getStrapiBaseUrl());
  const { res, json } = await fetchJson(url, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) return null;
  return json as unknown;
}

async function getWishlistCount(gameSlug: string) {
  const url = new URL(
    `/api/games/${encodeURIComponent(gameSlug)}/wishlist-count`,
    getStrapiBaseUrl(),
  );
  const { res, json } = await fetchJson(url);
  if (!res.ok) return null;
  const count = getNested(json, ["count"]);
  return typeof count === "number" ? count : null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const gameSlug = url.searchParams.get("gameSlug") ?? "";

  if (!gameSlug) {
    return NextResponse.json({ error: "Missing gameSlug." }, { status: 400 });
  }

  const count = await getWishlistCount(gameSlug);
  const jwt = await getJwtFromRequest(req);
  if (!jwt) {
    return NextResponse.json({ active: false, count });
  }

  const wishlistMe = await getWishlistMe(jwt);
  const games = getNested(wishlistMe, ["games"]);
  const active = Array.isArray(games)
    ? games.some((g) => getNested(g, ["slug"]) === gameSlug)
    : false;

  return NextResponse.json({ active, count });
}

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => null)) as {
    gameSlug?: string;
    gameId?: string | number;
  } | null;

  const gameSlug = payload?.gameSlug ?? "";
  if (!gameSlug) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const jwt = await getJwtFromRequest(req);
  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const toggleUrl = new URL("/api/wishlist/toggle", getStrapiBaseUrl());
  const { res, json } = await fetchJson(toggleUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ gameSlug }),
  });
  if (!res.ok) {
    return NextResponse.json(
      {
        error: "Failed to update wishlist.",
        status: res.status,
        details: json,
      },
      { status: 400 },
    );
  }

  const count = await getWishlistCount(gameSlug);
  const active = getNested(json, ["active"]) === true;
  return NextResponse.json({ active, count });
}
