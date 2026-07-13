import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ProfileDashboard,
  type ProfileComment,
  type ProfileUser,
} from "@/components/organisms/profile-dashboard";
import type { Game } from "@/services/strapi";

function getStrapiBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
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

function unwrapAttributes<T>(entity: unknown): (T & { id?: number }) | null {
  if (!entity || typeof entity !== "object") return null;
  const id = getNested(entity, ["id"]);
  const attrs = getNested(entity, ["attributes"]);
  const base = (attrs && typeof attrs === "object" ? attrs : entity) as Record<
    string,
    unknown
  >;
  const out: Record<string, unknown> = { ...base };
  if (typeof id === "number") out.id = id;
  return out as T & { id?: number };
}

async function fetchJson(path: string, jwt: string) {
  const url = new URL(path, getStrapiBaseUrl());
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as unknown;
  return { res, json };
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("strapi_jwt")?.value ?? null;
  if (!jwt) {
    redirect("/login?redirect=%2Fprofile");
  }

  const me = await fetchJson("/api/users/me", jwt);
  if (!me.res.ok) {
    redirect("/login?redirect=%2Fprofile");
  }

  const meId = getNested(me.json, ["id"]);
  if (typeof meId !== "number") {
    redirect("/login?redirect=%2Fprofile");
  }

  const user: ProfileUser = {
    id: meId,
    username:
      typeof getNested(me.json, ["username"]) === "string"
        ? (getNested(me.json, ["username"]) as string)
        : undefined,
    email:
      typeof getNested(me.json, ["email"]) === "string"
        ? (getNested(me.json, ["email"]) as string)
        : undefined,
  };

  const wishlistRes = await fetchJson(
    "/api/wishlist/me",
    jwt,
  );

  const gamesData = getNested(wishlistRes.json, ["games"]);
  const wishlistGames: Game[] = Array.isArray(gamesData)
    ? gamesData
        .map((g) => unwrapAttributes<Game>(g))
        .filter((g): g is Game => Boolean(g))
    : [];

  const commentsRes = await fetchJson("/api/comments/me", jwt);
  const commentData = getNested(commentsRes.json, ["data"]);
  const comments: ProfileComment[] = Array.isArray(commentData)
    ? (commentData
        .map((c) => {
          const id = getNested(c, ["id"]);
          const content = getNested(c, ["content"]);
          const isApproved = getNested(c, ["isApproved"]);
          const isRejected = getNested(c, ["isRejected"]);
          const createdAt = getNested(c, ["createdAt"]);
          const game = getNested(c, ["game"]);
          const gameTitle = getNested(game, ["title"]);
          const gameSlug = getNested(game, ["slug"]);

          if (typeof id !== "number") return null;
          if (typeof content !== "string") return null;

          return {
            id,
            content,
            isApproved: Boolean(isApproved),
            isRejected: Boolean(isRejected),
            createdAt: typeof createdAt === "string" ? createdAt : null,
            game:
              typeof gameTitle === "string" || typeof gameSlug === "string"
                ? {
                    title: typeof gameTitle === "string" ? gameTitle : undefined,
                    slug: typeof gameSlug === "string" ? gameSlug : undefined,
                  }
                : null,
          } satisfies ProfileComment;
        })
        .filter((c) => c !== null) as ProfileComment[])
    : [];

  return (
    <ProfileDashboard
      user={user}
      wishlistGames={wishlistGames}
      comments={comments}
    />
  );
}
