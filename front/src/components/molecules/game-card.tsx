import Image from "next/image";
import Link from "next/link";

import type { Game } from "@/services/strapi";
import { getStrapiMediaUrl } from "@/services/strapi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/molecules/rating-stars";
import { ComplexityMeter } from "@/components/molecules/complexity-meter";

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

function getRating(game: Game) {
  if (typeof game.rating === "number") return game.rating;
  const complexity = typeof game.complexity === "number" ? game.complexity : 2.5;
  return Math.max(0, Math.min(5, 2.7 + complexity / 2.6));
}

function getComplexityLevel(game: Game) {
  const v = typeof game.complexity === "number" ? game.complexity : 3;
  return Math.max(1, Math.min(5, Math.round(v)));
}

function getPublisherName(game: Game) {
  const rel = game.publisher as unknown;
  return (
    (getNested(rel, ["data", "attributes", "name"]) as string | undefined) ??
    (getNested(rel, ["name"]) as string | undefined) ??
    null
  );
}

export function GameCard({ game }: { game: Game }) {
  const imageUrl = getFirstImageUrl(game);
  const rating = getRating(game);
  const complexity = getComplexityLevel(game);
  const publisherName = getPublisherName(game);

  return (
    <Link
      href={game.slug ? `/games/${game.slug}` : "/"}
      className="block"
    >
      <Card className="group overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/7">
        <div className="relative aspect-[16/10] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={game.title ?? "Game image"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-500/20 via-slate-950 to-amber-500/10" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b1220]/90 to-transparent" />
        </div>

        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-zinc-100">
                {game.title ?? "Untitled"}
              </div>
              <div className="mt-2">
                <RatingStars rating={rating} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="accent">Complexity {complexity}/5</Badge>
              <ComplexityMeter value={complexity} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {publisherName ? (
              <Badge variant="accent">{publisherName}</Badge>
            ) : null}
            <Badge>
              {game.minPlayers ?? "?"}–{game.maxPlayers ?? "?"} players
            </Badge>
            <Badge variant="amber">{game.playingTime ? `${game.playingTime} min` : "Time ?"}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
