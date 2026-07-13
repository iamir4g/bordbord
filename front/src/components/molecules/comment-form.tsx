"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

export function CommentForm({
  gameId,
  gameSlug,
  onSubmitted,
}: {
  gameId: number | string;
  gameSlug: string;
  onSubmitted?: () => void;
}) {
  const [content, setContent] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, gameId, gameSlug }),
      });

      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(json?.error ?? "Failed to submit comment.");
        return;
      }

      setContent("");
      setSuccess("Your comment is pending admin approval.");
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment…"
        required
        disabled={submitting}
        rows={3}
        className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {success ? (
        <div className="text-sm text-indigo-200">{success}</div>
      ) : null}
      {error ? <div className="text-sm text-amber-200">{error}</div> : null}
      <Button
        type="submit"
        disabled={submitting || content.trim().length === 0}
      >
        {submitting ? "Submitting…" : "Submit comment"}
      </Button>
    </form>
  );
}
