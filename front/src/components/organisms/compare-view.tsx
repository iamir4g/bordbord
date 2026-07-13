"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { ArrowLeftRight } from "lucide-react";

import {
  buildRatingsFromGame,
  formatAgeRange,
  formatPlayers,
  formatPlayTime,
  getGameImageUrl,
  getGameRating,
  getPublisherFromGame,
} from "@/lib/strapi-helpers";
import type { Game } from "@/services/strapi";

const criteriaList = [
  { key: "gameplay" as const, label: "جذابیت گیم‌پلی" },
  { key: "artAndComponents" as const, label: "کیفیت قطعات و آرت" },
  { key: "rulesEase" as const, label: "سهولت یادگیری" },
  { key: "strategyDepth" as const, label: "عمق استراتژیک" },
  { key: "replayability" as const, label: "ارزش تکرار" },
];

function gameKey(game: Game) {
  return game.slug ?? String(game.id ?? game.documentId ?? "");
}

export function CompareView({ games }: { games: Game[] }) {
  const playable = games.filter((g) => g.slug);
  const [leftSlug, setLeftSlug] = React.useState(playable[0]?.slug ?? "");
  const [rightSlug, setRightSlug] = React.useState(playable[1]?.slug ?? playable[0]?.slug ?? "");

  const leftGame = playable.find((g) => g.slug === leftSlug);
  const rightGame = playable.find((g) => g.slug === rightSlug);

  return (
    <div className="animate-fade-in space-y-8 pb-16" dir="rtl">
      <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-r from-amber-500/10 to-transparent p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
          <ArrowLeftRight className="h-5 w-5 text-amber-500" />
          <span>مقایسه فنی بوردگیم‌ها (صف ارزیابی)</span>
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          دو بازی محبوب را انتخاب کنید تا جنبه‌های کیفی، پیچیدگی و المان‌های
          امتیازدهی را به صورت نمودار مقایسه‌ای مشاهده کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <label
            className="mb-1.5 block text-xs text-slate-400"
            htmlFor="compare-game-a-select"
          >
            انتخاب بوردگیم اول (طرف راست)
          </label>
          <select
            id="compare-game-a-select"
            value={leftSlug}
            onChange={(e) => setLeftSlug(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 outline-none"
          >
            {playable.map((g) => (
              <option key={gameKey(g)} value={g.slug}>
                {g.title} ({g.titleEnglish ?? "—"})
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <label
            className="mb-1.5 block text-xs text-slate-400"
            htmlFor="compare-game-b-select"
          >
            انتخاب بوردگیم دوم (طرف چپ)
          </label>
          <select
            id="compare-game-b-select"
            value={rightSlug}
            onChange={(e) => setRightSlug(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 outline-none"
          >
            {playable.map((g) => (
              <option key={gameKey(g)} value={g.slug}>
                {g.title} ({g.titleEnglish ?? "—"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {leftGame && rightGame ? (
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/20 p-6">
          <div className="grid grid-cols-12 items-center gap-4 border-b border-slate-800/85 pb-6 text-center">
            <GameCompareHeader game={leftGame} />
            <div className="col-span-2 flex flex-col items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-black text-amber-400 shadow-md">
                VS
              </div>
            </div>
            <GameCompareHeader game={rightGame} />
          </div>

          <div className="space-y-4">
            <h4 className="text-center text-xs font-black uppercase tracking-widest text-amber-500">
              مشخصات فیزیکی و فکری
            </h4>
            <div className="space-y-2 text-xs">
              <CompareRow
                label="تعداد بازیکنان"
                left={formatPlayers(leftGame)}
                right={formatPlayers(rightGame)}
              />
              <CompareRow
                label="مدت زمان بازی"
                left={formatPlayTime(leftGame)}
                right={formatPlayTime(rightGame)}
              />
              <CompareRow
                label="رده سنی"
                left={formatAgeRange(leftGame)}
                right={formatAgeRange(rightGame)}
                mono
              />
              <CompareRow
                label="درجه سختی (وزن)"
                left={`${(leftGame.complexity ?? 2.5).toFixed(1)} / ۵`}
                right={`${(rightGame.complexity ?? 2.5).toFixed(1)} / ۵`}
                highlight
              />
              <CompareRow
                label="ناشر بومی"
                left={getPublisherFromGame(leftGame).name ?? "—"}
                right={getPublisherFromGame(rightGame).name ?? "—"}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-800/60 pt-4">
            <h4 className="text-center text-xs font-black uppercase tracking-widest text-amber-500">
              مقایسه کیفی به تفکیک المان‌ها
            </h4>
            <div className="mt-4 grid grid-cols-1 gap-6 md:px-12">
              {criteriaList.map((crit) => {
                const lRatings = buildRatingsFromGame(leftGame);
                const rRatings = buildRatingsFromGame(rightGame);
                const lVal = lRatings[crit.key];
                const rVal = rRatings[crit.key];

                return (
                  <div key={crit.key} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span className="rounded-lg border border-slate-800 bg-slate-950 p-1 px-2.5 font-mono text-[10px] text-amber-400">
                        {lVal.toFixed(1)} / ۱۰
                      </span>
                      <span>{crit.label}</span>
                      <span className="rounded-lg border border-slate-800 bg-slate-950 p-1 px-2.5 font-mono text-[10px] text-amber-400">
                        {rVal.toFixed(1)} / ۱۰
                      </span>
                    </div>
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-6 flex justify-end">
                        <div className="flex h-3.5 w-full flex-row-reverse items-stretch overflow-hidden rounded-l-full bg-slate-950">
                          <div
                            className="h-full rounded-l-full bg-gradient-to-l from-amber-500 to-amber-600"
                            style={{ width: `${lVal * 10}%` }}
                          />
                        </div>
                      </div>
                      <div className="col-span-6 flex justify-start">
                        <div className="flex h-3.5 w-full items-stretch overflow-hidden rounded-r-full bg-slate-950">
                          <div
                            className="h-full rounded-r-full bg-gradient-to-r from-amber-500 to-amber-600"
                            style={{ width: `${rVal * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/20 p-8 text-center text-xs text-slate-400">
          جهت آغاز مقایسه، حداقل دو بازی در سیستم ثبت شده باشد.
        </div>
      )}
    </div>
  );
}

function GameCompareHeader({ game }: { game: Game }) {
  const imageUrl = getGameImageUrl(game);
  const rating = getGameRating(game);

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group col-span-5 space-y-2"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={game.title ?? ""}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <h3 className="text-sm font-black text-slate-200 transition-colors group-hover:text-amber-400 sm:text-base">
        {game.title}
      </h3>
      {game.titleEnglish ? (
        <span className="block font-mono text-[10px] text-slate-500">
          {game.titleEnglish}
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-500">
        ★ {rating.toFixed(1)}
      </span>
    </Link>
  );
}

function CompareRow({
  label,
  left,
  right,
  mono,
  highlight,
}: {
  label: string;
  left: string;
  right: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  const valueClass = highlight
    ? "font-mono font-bold text-amber-500"
    : mono
      ? "font-mono font-medium text-slate-200"
      : "font-medium text-slate-200";

  return (
    <div className="grid grid-cols-12 items-center rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <div className={`col-span-5 text-center ${valueClass}`}>{left}</div>
      <div className="col-span-2 text-center font-bold text-slate-400">{label}</div>
      <div className={`col-span-5 text-center ${valueClass}`}>{right}</div>
    </div>
  );
}
