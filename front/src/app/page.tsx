import { Suspense } from "react";

import { Hero } from "@/components/organisms/hero";
import { HomeSections } from "@/components/organisms/home-sections";
import { GamesExplorer } from "@/components/organisms/games-explorer";
import { extractCategoryNames } from "@/lib/strapi-helpers";
import { getArticles, getGames, getPublishers } from "@/services/strapi";

async function loadHomeData() {
  const [games, publishers, articles] = await Promise.all([
    getGames(),
    getPublishers(),
    getArticles(),
  ]);
  return { games, publishers, articles };
}

export default async function Home() {
  let games: Awaited<ReturnType<typeof getGames>> = [];
  let publishers: Awaited<ReturnType<typeof getPublishers>> = [];
  let articles: Awaited<ReturnType<typeof getArticles>> = [];
  let apiError: string | null = null;

  try {
    const data = await loadHomeData();
    games = data.games;
    publishers = data.publishers;
    articles = data.articles;
  } catch (err) {
    apiError =
      err instanceof Error
        ? err.message
        : "اتصال به Strapi برقرار نشد. مطمئن شوید بک‌اند روی پورت ۱۳۳۷ در حال اجراست.";
  }

  const categories = Array.from(
    new Set(games.flatMap((game) => extractCategoryNames(game))),
  );

  return (
    <div className="flex flex-1 flex-col">
      {apiError ? (
        <div className="border-b border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-600">
          {apiError}
        </div>
      ) : null}
      <Hero games={games} publishersCount={publishers.length} />
      <HomeSections games={games} articles={articles} publishers={publishers} />
      <Suspense fallback={null}>
        <GamesExplorer games={games} categories={categories} />
      </Suspense>
    </div>
  );
}
