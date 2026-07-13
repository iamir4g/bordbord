import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ComplexityMeter } from "@/components/molecules/complexity-meter";
import { RatingStars } from "@/components/molecules/rating-stars";
import { GameCard } from "@/components/molecules/game-card";
import { CommentSection } from "@/components/organisms/comment-section";
import { GameGallery } from "@/components/organisms/game-gallery";
import { WishlistButton } from "@/components/organisms/wishlist-button";
import { cn } from "@/lib/utils";
import { getGameBySlug, getGames, type Game } from "@/services/strapi";

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

function getRating(game: Game) {
  if (typeof game.rating === "number") return game.rating;
  const complexity =
    typeof game.complexity === "number" ? game.complexity : 2.5;
  return Math.max(0, Math.min(5, 2.7 + complexity / 2.6));
}

function getComplexityLevel(game: Game) {
  const v = typeof game.complexity === "number" ? game.complexity : 3;
  return Math.max(1, Math.min(5, Math.round(v)));
}

function extractCategoryNames(game: Game) {
  const rel = game.categories as unknown;
  const data = getNested(rel, ["data"]);
  if (Array.isArray(data)) {
    return data
      .map(
        (e) => getNested(e, ["attributes", "name"]) ?? getNested(e, ["name"]),
      )
      .filter((v): v is string => typeof v === "string");
  }
  return [];
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const rating = getRating(game);
  const complexity = getComplexityLevel(game);
  const description =
    typeof game.description === "string" ? game.description : null;
  const all = await getGames().catch(() => []);
  const categories = new Set(
    extractCategoryNames(game).map((c) => c.toLowerCase()),
  );
  const related = all
    .filter((g) => g.slug && g.slug !== slug)
    .map((g) => ({
      g,
      score: extractCategoryNames(g).some((c) =>
        categories.has(c.toLowerCase()),
      )
        ? 1
        : 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.g);

  const publisherName =
    (getNested(game.publisher, ["data", "attributes", "name"]) as
      | string
      | undefined) ??
    (getNested(game.publisher, ["name"]) as string | undefined) ??
    null;
  const publisherSlug =
    (getNested(game.publisher, ["data", "attributes", "slug"]) as
      | string
      | undefined) ??
    (getNested(game.publisher, ["slug"]) as string | undefined) ??
    null;
  const designerName =
    (getNested(game.designer, ["data", "attributes", "name"]) as
      | string
      | undefined) ??
    (getNested(game.designer, ["name"]) as string | undefined) ??
    null;
  const designerSlug =
    (getNested(game.designer, ["data", "attributes", "slug"]) as
      | string
      | undefined) ??
    (getNested(game.designer, ["slug"]) as string | undefined) ??
    null;

  return (
    <div className="flex flex-1 flex-col">
      <Container className="py-8">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <GameGallery title={game.title ?? "Game"} images={game.images} />

          <div>
            <Heading className="text-3xl">{game.title ?? "Untitled"}</Heading>
            <div className="mt-3">
              <RatingStars rating={rating} />
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300">
              {publisherName && publisherSlug ? (
                <Link
                  href={`/publishers/${publisherSlug}`}
                  className="hover:text-zinc-100 hover:underline"
                >
                  Publisher: {publisherName}
                </Link>
              ) : null}
              {designerName && designerSlug ? (
                <Link
                  href={`/designers/${designerSlug}`}
                  className="hover:text-zinc-100 hover:underline"
                >
                  Designer: {designerName}
                </Link>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>
                {game.minPlayers ?? "?"}–{game.maxPlayers ?? "?"} players
              </Badge>
              <Badge variant="amber">
                {game.playingTime ? `${game.playingTime} min` : "Time ?"}
              </Badge>
              <Badge variant="accent">
                {game.age ? `${game.age}+` : "Age ?"}
              </Badge>
            </div>

            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="text-sm font-semibold text-zinc-100">
                  Complexity
                </div>
                <div className="text-xs text-slate-300">{complexity}/5</div>
              </CardHeader>
              <CardContent className="pt-0">
                <ComplexityMeter value={complexity} className="w-full" />
                <div className="mt-4">
                  <WishlistButton
                    gameSlug={slug}
                    gameId={game.id ?? game.documentId}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-sm leading-6 text-slate-300">
              {description ?? "No description yet."}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Heading className="text-xl">User Reviews</Heading>
            <div className="mt-4">
              <CommentSection
                gameSlug={slug}
                gameId={game.id ?? game.documentId}
              />
            </div>
          </div>

          <div>
            <Heading className="text-xl">Related Games</Heading>
            <div className="mt-4 space-y-4">
              {related.length === 0 ? (
                <div className="text-sm text-slate-300">
                  No related games yet.
                </div>
              ) : (
                related
                  .slice(0, 3)
                  .map((g) => <GameCard key={g.slug} game={g} />)
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
