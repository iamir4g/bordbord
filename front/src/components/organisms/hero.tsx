import Image from "next/image";
import Link from "next/link";
import { Award, Sparkles } from "lucide-react";

import type { Game } from "@/services/strapi";
import { getStrapiMediaUrl } from "@/services/strapi";
import { Container } from "@/components/atoms/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

function getFirstImageUrl(game: Game) {
  const images = game.images as unknown;
  const first =
    (getNested(images, ["data", 0, "attributes", "url"]) as string | undefined) ??
    (getNested(images, ["data", 0, "url"]) as string | undefined) ??
    (getNested(images, [0, "url"]) as string | undefined) ??
    null;
  return getStrapiMediaUrl(first);
}

function formatPlayers(game: Game) {
  if (game.minPlayers && game.maxPlayers) {
    return `${game.minPlayers} تا ${game.maxPlayers} نفر`;
  }
  return "نامشخص";
}

function formatPlayTime(game: Game) {
  if (game.playingTime) return `${game.playingTime} دقیقه`;
  return "نامشخص";
}

export function Hero({
  games,
  publishersCount,
}: {
  games: Game[];
  publishersCount: number;
}) {
  const featured = games.slice(0, 4);

  return (
    <section className="animate-fade-in border-b border-slate-800">
      <Container className="py-8 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/15 bg-slate-900/40 p-6 shadow-2xl sm:p-10">
          <div className="pointer-events-none absolute top-0 left-0 h-64 w-64 -translate-x-12 -translate-y-12 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-12 translate-y-12 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-5 text-right lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/15 px-3 py-1 text-[11px] font-bold text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>مرجع منتقدین و کلوب هواداران بازی‌های رومیزی ایران</span>
              </div>

              <h1 className="text-2xl font-extrabold leading-snug text-slate-100 sm:text-4xl">
                به{" "}
                <span className="bg-gradient-to-l from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  بازی‌گیک
                </span>{" "}
                خوش آمدید!
              </h1>

              <p className="max-w-xl text-justify text-xs leading-relaxed text-slate-300 sm:text-sm">
                با شبیه‌سازی دقیق وب‌سایت مرجع بین‌المللی بوردگیم‌گیک (BGG)، بازی‌گیک بستری بومی برای مشاهده رتبه‌بندی‌های کیفی، نقدها، آموزش‌های ویدیویی بوردگیم‌های فارسی و آشنایی با ناشران بازی است.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                  <span className="block text-[10px] text-slate-400 sm:text-xs">رده بوردگیم‌ها</span>
                  <strong className="mt-1 inline-block font-mono text-sm font-black text-amber-400 sm:text-lg">
                    {games.length}
                  </strong>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                  <span className="block text-[10px] text-slate-400 sm:text-xs">ناشر تولیدی</span>
                  <strong className="mt-1 inline-block font-mono text-sm font-black text-amber-400 sm:text-lg">
                    {publishersCount}
                  </strong>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                  <span className="block text-[10px] text-slate-400 sm:text-xs">امتیازدهی ۵گانه</span>
                  <strong className="mt-1 inline-block font-mono text-sm font-black text-amber-400 sm:text-lg">
                    IMDB
                  </strong>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link href="/games" className={cn(buttonVariants())}>
                  <span>اکتشاف و نمره‌دهی بازی‌ها</span>
                </Link>
                <Link
                  href="/articles"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>مقالات و آموزش</span>
                </Link>
              </div>
            </div>

            <div className="hidden rotate-1 grid-cols-2 gap-3 border-r border-slate-800 pr-8 lg:col-span-5 lg:grid">
              {featured.map((game) => {
                const imageUrl = getFirstImageUrl(game);
                return (
                  <Link
                    key={game.slug}
                    href={game.slug ? `/games/${game.slug}` : "/"}
                    className="group relative h-28 cursor-pointer overflow-hidden rounded-xl border border-slate-700/60 shadow-lg transition-all duration-300 hover:border-amber-500/40"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={game.title ?? "بازی"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-amber-500/20 to-slate-950" />
                    )}
                    <div className="absolute inset-0 bg-slate-950/80 transition-colors group-hover:bg-slate-950/60" />
                    <div className="absolute inset-x-0 bottom-2 px-3 text-right">
                      <strong className="mt-1 block truncate text-xs text-slate-100">
                        {game.title}
                      </strong>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
