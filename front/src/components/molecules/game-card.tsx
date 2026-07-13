import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Clock, Layers, Star, Users } from "lucide-react";

import type { Game } from "@/services/strapi";
import {
  extractCategoryNames,
  formatPlayers,
  formatPlayTime,
  getGameImageUrl,
  getGameRating,
  getPublisherFromGame,
  stripHtml,
} from "@/lib/strapi-helpers";
import { cn } from "@/lib/utils";

export function GameCard({ game, className }: { game: Game; className?: string }) {
  const imageUrl = getGameImageUrl(game);
  const rating = getGameRating(game);
  const publisher = getPublisherFromGame(game);
  const categories = extractCategoryNames(game);
  const complexity = typeof game.complexity === "number" ? game.complexity : 2.5;
  const description = stripHtml(
    typeof game.description === "string" ? game.description : "",
  );

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5",
        className,
      )}
    >
      <Link
        href={game.slug ? `/games/${game.slug}` : "/"}
        className="relative aspect-video w-full overflow-hidden bg-slate-950"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={game.title ?? "بازی"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-500/20 via-slate-950 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

        <div className="absolute top-2 right-2 flex flex-wrap gap-1">
          {categories.slice(0, 2).map((cat) => (
            <span
              key={cat}
              className="rounded-md border border-amber-500/10 bg-slate-950/80 px-2 py-1 text-[10px] font-medium text-amber-400"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-1 font-mono text-xs font-black text-slate-950 shadow-md">
          <Star className="h-3 w-3 fill-slate-950" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-4 text-right">
        <div>
          {publisher.name && publisher.slug ? (
            <Link
              href={`/publishers/${publisher.slug}`}
              className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-500/80 transition-colors hover:text-amber-400"
            >
              <span>ناشر: {publisher.name}</span>
            </Link>
          ) : null}

          <Link href={game.slug ? `/games/${game.slug}` : "/"}>
            <h3 className="line-clamp-1 text-base font-bold leading-snug text-slate-100 transition-colors hover:text-amber-400">
              {game.title ?? "بدون عنوان"}
            </h3>
          </Link>

          {game.titleEnglish ? (
            <p className="mt-0.5 line-clamp-1 font-mono text-xs tracking-wide text-slate-400">
              {game.titleEnglish}
            </p>
          ) : null}

          {description ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300">
              {description.slice(0, 120)}
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
          <div className="flex flex-col items-center justify-center rounded-lg bg-slate-950/30 p-1 text-center">
            <Users className="mb-1 h-3.5 w-3.5 text-slate-500" />
            <span className="font-medium text-slate-300">{formatPlayers(game)}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-slate-950/30 p-1 text-center">
            <Clock className="mb-1 h-3.5 w-3.5 text-slate-500" />
            <span className="font-medium text-slate-300">{formatPlayTime(game)}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-slate-950/30 p-1 text-center">
            <Layers className="mb-1 h-3.5 w-3.5 text-slate-500" />
            <span className="font-medium font-mono text-slate-300">
              {complexity.toFixed(1)} / ۵
            </span>
          </div>
        </div>

        <Link
          href={game.slug ? `/games/${game.slug}` : "/"}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 transition-all duration-300 hover:bg-amber-500 hover:text-slate-950"
        >
          <span>مشاهده و ثبت رای</span>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
