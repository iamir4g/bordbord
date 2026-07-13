"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Award, Clock, Eye, ShieldAlert, Star, Users } from "lucide-react";

import {
  extractCategoryNames,
  formatPlayers,
  formatPlayTime,
  getGameImageUrl,
  getGameRating,
  stripHtml,
} from "@/lib/strapi-helpers";
import type { Game } from "@/services/strapi";

type SortCriteria = "rating" | "difficulty" | "votes" | "release";

function getRankBadge(index: number) {
  const rank = index + 1;
  if (rank === 1) {
    return (
      <div className="flex h-8 w-8 animate-bounce items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-sm font-black text-slate-950 shadow-md">
        ۱
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-sm font-black text-slate-950 shadow-sm">
        ۲
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700 text-sm font-black text-slate-100 shadow-sm">
        ۳
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-900 font-mono text-xs font-bold text-slate-500">
      {rank}
    </div>
  );
}

export function RankingsView({ games }: { games: Game[] }) {
  const [sortBy, setSortBy] = React.useState<SortCriteria>("rating");
  const [selectedCategory, setSelectedCategory] = React.useState("همه سبک‌ها");

  const availableCategories = React.useMemo(
    () => [
      "همه سبک‌ها",
      ...Array.from(new Set(games.flatMap((g) => extractCategoryNames(g)))),
    ],
    [games],
  );

  const filteredCategoryGames = React.useMemo(() => {
    return games.filter((game) => {
      if (selectedCategory === "همه سبک‌ها") return true;
      return extractCategoryNames(game).includes(selectedCategory);
    });
  }, [games, selectedCategory]);

  const sortedGames = React.useMemo(() => {
    return [...filteredCategoryGames].sort((a, b) => {
      if (sortBy === "rating") {
        return getGameRating(b) - getGameRating(a);
      }
      if (sortBy === "difficulty") {
        return (b.complexity ?? 0) - (a.complexity ?? 0);
      }
      if (sortBy === "votes") {
        return (b.ratingsCount ?? 0) - (a.ratingsCount ?? 0);
      }
      if (sortBy === "release") {
        return (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
      }
      return 0;
    });
  }, [filteredCategoryGames, sortBy]);

  const sortLabel = {
    rating: "امتیاز مرجع بوردبرد",
    difficulty: "درجه سختی قوانین و روند بازی",
    votes: "محبوبیت بر اساس تعداد آرای ریخته‌شده",
    release: "سال ساخت بوردگیم",
  }[sortBy];

  return (
    <div className="animate-fade-in space-y-6 pb-16" dir="rtl">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1 text-right">
            <h1 className="flex items-center gap-2 text-xl font-black text-slate-100 sm:text-2xl">
              <Award className="h-6 w-6 animate-pulse text-amber-500" />
              <span>جدول رده‌بندی ملی بوردگیم‌ها</span>
            </h1>
            <p className="max-w-xl text-justify text-xs text-slate-400">
              جدول رنکینگ زیر بازتابی از امتیاز ارزیابی‌های وزنی منتقدین و اعضای
              جامعه هواداری است و با ثبت نمرات جدید به‌روز می‌شود.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 font-mono text-[10px] text-amber-400">
            <strong>تعداد کل بازی‌ها: {games.length} عدد</strong>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 rounded-2xl border border-slate-800/60 bg-slate-900/20 p-4 text-right">
        <span className="block text-[10px] font-bold leading-none text-slate-400">
          فیلتر رنکینگ بر اساس سبک بازی (ژانر):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${
                selectedCategory === cat
                  ? "border-amber-500 bg-amber-500 text-slate-950 shadow-md"
                  : "border-slate-850 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row">
        <span className="text-xs font-bold text-slate-300">
          مرتب‌سازی بر اساس:{" "}
          <span className="font-extrabold text-amber-500">{sortLabel}</span>
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {(
            [
              ["rating", "بالاترین امتیاز"],
              ["difficulty", "سنگین‌ترین‌ها"],
              ["votes", "بیشترین آرا"],
              ["release", "جدیدترین"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortBy(key)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                sortBy === key
                  ? "border-amber-500/30 bg-amber-500/10 font-extrabold text-amber-400"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3.5">
        {sortedGames.map((game, index) => {
          if (!game.slug) return null;
          const imageUrl = getGameImageUrl(game);
          const rating = getGameRating(game);
          const complexity = game.complexity ?? 2.5;
          const description = stripHtml(
            typeof game.description === "string" ? game.description : "",
          );

          return (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="group flex cursor-pointer flex-col items-center gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-4 transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg md:flex-row"
            >
              <div className="flex w-12 shrink-0 items-center justify-center text-center md:flex-col">
                {getRankBadge(index)}
                <span className="mt-1 hidden font-mono text-[9px] tracking-wider text-slate-500 md:block">
                  RANK
                </span>
              </div>

              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-md transition-colors group-hover:border-slate-700">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={game.title ?? ""}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1 text-right">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-black text-slate-100 transition-colors group-hover:text-amber-400 sm:text-base">
                    {game.title}
                  </h3>
                  {game.titleEnglish ? (
                    <span className="font-mono text-[10px] tracking-wide text-slate-500 sm:text-xs">
                      ({game.titleEnglish})
                    </span>
                  ) : null}
                  {game.releaseYear ? (
                    <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-[9px] text-slate-400">
                      سال {game.releaseYear}
                    </span>
                  ) : null}
                </div>
                {description ? (
                  <p className="mt-1 line-clamp-1 pl-4 text-[11px] leading-relaxed text-slate-400">
                    {description}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-amber-500/80" />
                    <span>بازیکنان: {formatPlayers(game)}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3.5 w-3.5 text-amber-500/80" />
                    <span>زمان: {formatPlayTime(game)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500/80" />
                    <span>سختی: {complexity.toFixed(1)} / ۵</span>
                  </span>
                </div>
              </div>

              <div className="flex w-full shrink-0 flex-row items-center justify-between gap-4 rounded-2xl border border-slate-850 bg-slate-950/50 p-3 text-center shadow-inner hover:bg-slate-950/80 md:w-36 md:flex-col md:justify-center">
                <div className="flex items-center gap-1 font-black text-amber-400">
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                  <span className="font-mono text-base font-black sm:text-lg">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-right md:text-center">
                  <span className="block font-mono text-[10px] text-slate-400">
                    تعداد کل آرا
                  </span>
                  <strong className="mt-0.5 inline-block font-mono text-[10px] text-slate-300 sm:text-xs">
                    {game.ratingsCount ?? 0} رأی معتبر
                  </strong>
                </div>
              </div>

              <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950 lg:flex">
                <Eye className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
