"use client";

import Link from "next/link";
import * as React from "react";
import {
  CornerDownLeft,
  MessageSquare,
  Plus,
  Star,
  ThumbsUp,
  User,
} from "lucide-react";

import { CommentForm } from "@/components/molecules/comment-form";
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
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export function CommentSection({
  gameSlug,
  gameId,
  gameTitle,
}: {
  gameSlug: string;
  gameId?: number | string;
  gameTitle?: string;
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
        { cache: "no-store" },
      );
      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        setError("بارگذاری نظرات با خطا مواجه شد.");
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
        headers: { "Content-Type": "application/json" },
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
    <div
      className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
      id="comments-section"
    >
      <div className="order-last space-y-4 lg:order-first lg:col-span-7">
        <h3 className="mb-4 flex items-center gap-2 text-base font-black text-slate-200">
          <MessageSquare className="h-5 w-5 text-amber-400" />
          <span>نظرات و امتیازات کاربران ({comments.length} نظر)</span>
        </h3>

        {error ? (
          <div className="text-xs text-amber-200">{error}</div>
        ) : null}

        {loading ? (
          <div className="text-xs text-slate-400">در حال بارگذاری نظرات…</div>
        ) : comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center text-xs text-slate-400">
            اولین کسی باشید که برای بازی {gameTitle ?? "این بازی"} نظر و امتیاز
            ثبت می‌کند!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-all duration-300 hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-950 text-slate-400">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <strong className="block text-xs text-slate-200 sm:text-sm">
                        {c.authorName ?? "کاربر"}
                      </strong>
                      <span className="mt-0.5 block font-mono text-[10px] text-slate-500">
                        {formatDate(c.createdAt) ?? ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 whitespace-pre-line text-justify text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {c.content}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-850/50 pt-3">
                  {!user && !authLoading ? (
                    <Link
                      href={`/login?redirect=${encodeURIComponent(redirect)}`}
                      className="flex items-center gap-1 rounded-lg border border-amber-500/10 bg-amber-500/5 px-3 py-1.5 text-[10px] text-amber-500 transition-colors hover:bg-amber-500/10 hover:text-amber-400"
                    >
                      <CornerDownLeft className="h-3 w-3" />
                      <span>ورود برای پاسخ</span>
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    disabled={!user}
                    onClick={() =>
                      void reactTo(
                        c.id,
                        c.viewerReaction === "like" ? "none" : "like",
                      )
                    }
                    className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] transition-colors ${
                      c.viewerReaction === "like"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-amber-400"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>موافق با نظر ({c.likesCount})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 lg:col-span-5">
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-200">
            ثبت نظر و نمره‌دهی سبک IMDB
          </h3>
        </div>

        {gameId ? (
          <CommentForm
            gameId={gameId}
            gameSlug={gameSlug}
            onSubmitted={load}
          />
        ) : (
          <div className="text-xs text-slate-400">
            امکان ثبت نظر برای این بازی وجود ندارد.
          </div>
        )}
      </div>
    </div>
  );
}
