import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getStrapiBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const gameSlug = url.searchParams.get("gameSlug");
  if (!gameSlug) {
    return NextResponse.json({ error: "Missing gameSlug." }, { status: 400 });
  }

  const jwt = await getJwtFromRequest(req);
  const strapiUrl = new URL(
    `/api/comments/by-game/${encodeURIComponent(gameSlug)}`,
    getStrapiBaseUrl(),
  );
  const { res, json } = await fetchJson(
    strapiUrl,
    jwt
      ? {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      : undefined,
  );
  if (!res.ok) {
    return NextResponse.json(
      {
        error: "Failed to load comments.",
        status: res.status,
        details: json,
      },
      { status: res.status },
    );
  }

  const items = getNested(json, ["data"]);
  const data = Array.isArray(items)
    ? items
        .map((c) => {
          const id = getNested(c, ["id"]);
          const content = getNested(c, ["content"]);
          const username = getNested(c, ["author", "username"]);
          const createdAt = getNested(c, ["createdAt"]);
          const likesCount = getNested(c, ["likesCount"]);
          const dislikesCount = getNested(c, ["dislikesCount"]);
          const viewerReaction = getNested(c, ["viewerReaction"]);
          if (typeof id !== "number") return null;
          if (typeof content !== "string") return null;
          return {
            id,
            attributes: {
              content,
              createdAt: typeof createdAt === "string" ? createdAt : null,
              likesCount: typeof likesCount === "number" ? likesCount : 0,
              dislikesCount:
                typeof dislikesCount === "number" ? dislikesCount : 0,
              viewerReaction:
                viewerReaction === "like" || viewerReaction === "dislike"
                  ? viewerReaction
                  : null,
              author: {
                data: username
                  ? { attributes: { username } }
                  : { attributes: { username: null } },
              },
            },
          };
        })
        .filter((v) => v !== null)
    : [];

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const jwt = await getJwtFromRequest(req);
  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await req.json().catch(() => null)) as {
    content?: string;
    gameId?: number | string;
    gameSlug?: string;
  } | null;

  const content = payload?.content?.trim() ?? "";
  const gameSlug = payload?.gameSlug ?? "";

  if (!content || !gameSlug) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const strapiUrl = new URL("/api/comments/submit", getStrapiBaseUrl());
  const { res, json } = await fetchJson(strapiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, gameSlug }),
  });

  if (!res.ok) {
    return NextResponse.json(
      {
        error: "Failed to submit comment.",
        status: res.status,
        details: json,
      },
      { status: res.status },
    );
  }

  return NextResponse.json(json ?? { ok: true });
}

export async function PATCH(req: Request) {
  const jwt = await getJwtFromRequest(req);
  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await req.json().catch(() => null)) as {
    commentId?: number | string;
    reaction?: "like" | "dislike" | "none";
  } | null;

  const commentIdRaw = payload?.commentId;
  const commentId =
    typeof commentIdRaw === "number"
      ? commentIdRaw
      : typeof commentIdRaw === "string"
        ? Number(commentIdRaw)
        : NaN;
  const reaction = payload?.reaction ?? null;

  if (!Number.isFinite(commentId) || commentId <= 0) {
    return NextResponse.json({ error: "Invalid commentId." }, { status: 400 });
  }
  if (reaction !== "like" && reaction !== "dislike" && reaction !== "none") {
    return NextResponse.json({ error: "Invalid reaction." }, { status: 400 });
  }

  const strapiUrl = new URL("/api/comments/react", getStrapiBaseUrl());
  const { res, json } = await fetchJson(strapiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentId, reaction }),
  });

  if (!res.ok) {
    return NextResponse.json(
      {
        error: "Failed to react to comment.",
        status: res.status,
        details: json,
      },
      { status: res.status },
    );
  }

  return NextResponse.json(json ?? { ok: true });
}
