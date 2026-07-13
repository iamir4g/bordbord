"use client";

import Link from "next/link";
import * as React from "react";

import { CommentForm } from "@/components/molecules/comment-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/organisms/auth-provider";

type CommentItem = {
  id: number;
  content: string;
  authorName: string | null;
  createdAt: string | null;
  likesCount: number;
  dislikesCount: number;
  viewerReaction: "like" | "dislike" | null;
};

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

function toComments(json: unknown): CommentItem[] {
  const data = getNested(json, ["data"]);
  if (!Array.isArray(data)) return [];

  return data
    .map((entry) => {
      const id = getNested(entry, ["id"]);
      const content =
        getNested(entry, ["attributes", "content"]) ??
        getNested(entry, ["content"]);
      const createdAt =
        getNested(entry, ["attributes", "createdAt"]) ??
        getNested(entry, ["createdAt"]) ??
        null;
      const likesCount =
        getNested(entry, ["attributes", "likesCount"]) ??
        getNested(entry, ["likesCount"]);
      const dislikesCount =
        getNested(entry, ["attributes", "dislikesCount"]) ??
        getNested(entry, ["dislikesCount"]);
      const viewerReaction =
        getNested(entry, ["attributes", "viewerReaction"]) ??
        getNested(entry, ["viewerReaction"]) ??
        null;
      const authorName =
        getNested(entry, [
          "attributes",
          "author",
          "data",
          "attributes",
          "username",
        ]) ??
        getNested(entry, ["author", "data", "username"]) ??
        getNested(entry, ["author", "username"]) ??
        null;

      if (typeof id !== "number") return null;
      if (typeof content !== "string" || content.trim().length === 0)
        return null;
      return {
        id,
        content,
        authorName: typeof authorName === "string" ? authorName : null,
        createdAt: typeof createdAt === "string" ? createdAt : null,
        likesCount: typeof likesCount === "number" ? likesCount : 0,
        dislikesCount: typeof dislikesCount === "number" ? dislikesCount : 0,
        viewerReaction:
          viewerReaction === "like" || viewerReaction === "dislike"
            ? viewerReaction
            : null,
      };
    })
    .filter((v): v is CommentItem => Boolean(v));
}

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export function CommentSection({
  gameSlug,
  gameId,
}: {
  gameSlug: string;
  gameId?: number | string;
}) {
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [comments, setComments] = React.useState<CommentItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/comments?gameSlug=${encodeURIComponent(gameSlug)}`,
        {
          cache: "no-store",
        },
      );
      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        setError("Failed to load comments.");
        setComments([]);
        return;
      }
      setComments(toComments(json));
    } finally {
      setLoading(false);
    }
  }, [gameSlug]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  const reactTo = React.useCallback(
    async (commentId: number, reaction: "like" | "dislike" | "none") => {
      if (!user) return;
      const res = await fetch(`/api/comments`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId, reaction }),
      });
      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) return;

      const data = getNested(json, ["data"]);
      const id = getNested(data, ["id"]);
      const likesCount = getNested(data, ["likesCount"]);
      const dislikesCount = getNested(data, ["dislikesCount"]);
      const viewerReaction = getNested(data, ["viewerReaction"]);

      if (typeof id !== "number") return;
      setComments((prev) =>
        prev.map((c) =>
          c.id !== id
            ? c
            : {
                ...c,
                likesCount:
                  typeof likesCount === "number" ? likesCount : c.likesCount,
                dislikesCount:
                  typeof dislikesCount === "number"
                    ? dislikesCount
                    : c.dislikesCount,
                viewerReaction:
                  viewerReaction === "like" || viewerReaction === "dislike"
                    ? viewerReaction
                    : null,
              },
        ),
      );
    },
    [user],
  );

  const redirect = `/games/${gameSlug}`;

  return (
    <div className="space-y-4">
      {user ? (
        <Card>
          <CardContent className="pt-4">
            {gameId ? (
              <CommentForm
                gameId={gameId}
                gameSlug={gameSlug}
                onSubmitted={load}
              />
            ) : (
              <div className="text-sm text-slate-300">
                Unable to submit comments for this game.
              </div>
            )}
          </CardContent>
        </Card>
      ) : authLoading ? null : (
        <div>
          <Link
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Login to comment
          </Link>
        </div>
      )}

      {error ? <div className="text-sm text-amber-200">{error}</div> : null}

      {loading ? (
        <div className="text-sm text-slate-300">Loading comments…</div>
      ) : comments.length === 0 ? (
        <Card>
          <CardContent className="pt-4 text-sm text-slate-300">
            No reviews yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {comments.slice(0, 8).map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-4 text-sm text-slate-200">
                {c.authorName || c.createdAt ? (
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="truncate">{c.authorName ?? ""}</div>
                    <div className="shrink-0">
                      {formatDate(c.createdAt) ?? ""}
                    </div>
                  </div>
                ) : null}
                {c.content}
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={c.viewerReaction === "like" ? "amber" : "outline"}
                    disabled={!user}
                    onClick={() =>
                      void reactTo(
                        c.id,
                        c.viewerReaction === "like" ? "none" : "like",
                      )
                    }
                  >
                    Like ({c.likesCount})
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      c.viewerReaction === "dislike" ? "amber" : "outline"
                    }
                    disabled={!user}
                    onClick={() =>
                      void reactTo(
                        c.id,
                        c.viewerReaction === "dislike" ? "none" : "dislike",
                      )
                    }
                  >
                    Dislike ({c.dislikesCount})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
