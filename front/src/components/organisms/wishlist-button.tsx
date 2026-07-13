"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/organisms/auth-provider";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={filled ? "h-4 w-4 fill-current" : "h-4 w-4"}
      aria-hidden="true"
    >
      <path
        d="M12.001 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54l-1.449 1.31z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function formatCount(n: number) {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const v = n / 1000;
    const decimals = v >= 10 ? 0 : 1;
    return `${v.toFixed(decimals).replace(/\.0$/, "")}k`;
  }
  const v = n / 1_000_000;
  const decimals = v >= 10 ? 0 : 1;
  return `${v.toFixed(decimals).replace(/\.0$/, "")}M`;
}

export function WishlistButton({
  gameSlug,
  gameId,
}: {
  gameSlug: string;
  gameId?: number | string;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [active, setActive] = React.useState(false);
  const [count, setCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [mutating, setMutating] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("gameSlug", gameSlug);
      if (gameId !== undefined && gameId !== null)
        qs.set("gameId", String(gameId));
      const res = await fetch(`/api/wishlist?${qs.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json().catch(() => null)) as {
        active?: boolean;
        count?: number;
      } | null;
      if (!res.ok) return;
      setActive(Boolean(json?.active));
      setCount(typeof json?.count === "number" ? json.count : null);
    } finally {
      setLoading(false);
    }
  }, [gameId, gameSlug]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function toggle() {
    if (!user && !authLoading) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/games/${gameSlug}`)}`,
      );
      return;
    }
    setMutating(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug, gameId }),
      });
      const json = (await res.json().catch(() => null)) as
        | { active?: boolean; count?: number }
        | { error?: string }
        | null;
      if (!res.ok) {
        if (!user) {
          router.push(
            `/login?redirect=${encodeURIComponent(`/games/${gameSlug}`)}`,
          );
        }
        return;
      }
      setActive(Boolean((json as { active?: boolean } | null)?.active));
      const nextCount = (json as { count?: number } | null)?.count;
      setCount((prev) => (typeof nextCount === "number" ? nextCount : prev));
    } finally {
      setMutating(false);
    }
  }

  const label = active ? "در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها";
  const suffix = typeof count === "number" ? ` (${formatCount(count)})` : "";

  return (
    <Button
      onClick={toggle}
      variant={active ? "amber" : "default"}
      className="w-full justify-between gap-3 sm:w-auto"
      disabled={mutating || authLoading}
      aria-label={`${label}${suffix}`}
    >
      <span className="inline-flex items-center gap-2">
        <HeartIcon filled={active} />
        <span>{loading ? "Loading…" : label}</span>
      </span>
      <span className="tabular-nums text-sm opacity-90">{suffix.trim()}</span>
    </Button>
  );
}
