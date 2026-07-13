"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";

import { RatingWidget } from "@/components/molecules/rating-widget";
import type { RatingElements } from "@/lib/strapi-helpers";
import { useAuth } from "@/components/organisms/auth-provider";

const defaultRatings: RatingElements = {
  gameplay: 7,
  artAndComponents: 7,
  rulesEase: 7,
  strategyDepth: 7,
  replayability: 7,
};

export function CommentForm({
  gameId,
  gameSlug,
  onSubmitted,
}: {
  gameId: number | string;
  gameSlug: string;
  onSubmitted?: () => void;
}) {
  const { user } = useAuth();
  const [content, setContent] = React.useState("");
  const [ratings, setRatings] = React.useState<RatingElements>(defaultRatings);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError("لطفاً متن نقد یا دیدگاه خود را پر کنید.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, gameId, gameSlug, ratings }),
      });

      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(json?.error ?? "ثبت نظر با خطا مواجه شد.");
        return;
      }

      setContent("");
      setRatings({
        gameplay: 8,
        artAndComponents: 8,
        rulesEase: 8,
        strategyDepth: 8,
        replayability: 8,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  }

  const redirect = `/games/${gameSlug}`;

  if (!user) {
    return (
      <div className="space-y-3 text-xs text-slate-400">
        <p>برای ثبت نقد، رای و دیدگاه ابتدا باید وارد حساب کاربری خود شوید.</p>
        <Link
          href={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="inline-flex rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-bold text-amber-400 transition-colors hover:bg-amber-500/20"
        >
          ورود / عضویت
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
          <Check className="h-4 w-4 shrink-0" />
          <span>رای و دیدگاه شما ثبت شد و پس از تایید نمایش داده می‌شود.</span>
        </div>
      ) : null}

      <div>
        <label
          className="mb-1.5 block text-xs font-medium text-slate-300"
          htmlFor="username-input"
        >
          ثبت‌کننده نظر
        </label>
        <input
          id="username-input"
          type="text"
          value={user.username}
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-slate-850 bg-slate-950 p-3 text-xs text-slate-400 opacity-80 outline-none"
        />
      </div>

      <div>
        <label
          className="mb-1.5 block text-xs font-medium text-slate-300"
          htmlFor="content-input"
        >
          متن نقد یا دیدگاه شما
        </label>
        <textarea
          id="content-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="تحلیل خود را درباره‌ی جذابیت، کیفیت، و پیچیدگی‌های بازی بنویسید..."
          rows={4}
          disabled={submitting}
          className="w-full resize-none rounded-xl border border-slate-850 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 outline-none focus:border-amber-500 disabled:opacity-50"
        />
      </div>

      <div className="rounded-2xl pt-2">
        <RatingWidget
          ratings={ratings}
          onRatingChange={setRatings}
          interactive
        />
      </div>

      <button
        type="submit"
        disabled={submitting || content.trim().length === 0}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-amber-500/10 transition-all duration-300 hover:from-amber-600 hover:to-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        <span>{submitting ? "در حال ثبت…" : "ثبت نقد تخصصی و امتیاز"}</span>
      </button>
    </form>
  );
}
