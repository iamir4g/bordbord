import { Suspense } from "react";

import { Hero } from "@/components/organisms/hero";
import { HomeSections } from "@/components/organisms/home-sections";
import { GamesExplorer } from "@/components/organisms/games-explorer";
import { parseGameCatalogFilters } from "@/lib/game-catalog-filters";
import {
  getArticles,
  getCategories,
  getGames,
  getPublishers,
} from "@/services/strapi";

async function loadHomeData() {
  const [games, publishers, articles] = await Promise.all([
    getGames(),
    getPublishers(),
    getArticles(),
  ]);
  return { games, publishers, articles };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
  }>;
}) {
  let games: Awaited<ReturnType<typeof getGames>> = [];
  let publishers: Awaited<ReturnType<typeof getPublishers>> = [];
  let articles: Awaited<ReturnType<typeof getArticles>> = [];
  let apiError: string | null = null;
  const filters = parseGameCatalogFilters(await searchParams);

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

  const [explorerGames, categories] = await Promise.all([
    filters.query || filters.categorySlugs.length > 0
      ? getGames({
          query: filters.query,
          categorySlugs: filters.categorySlugs,
        }).catch(() => [])
      : Promise.resolve(games),
    getCategories().catch(() => []),
  ]);

  const categoryOptions = categories
    .map((category) => ({
      name: typeof category.name === "string" ? category.name : "",
      slug: typeof category.slug === "string" ? category.slug : "",
    }))
    .filter((category) => category.name && category.slug);

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
        <GamesExplorer
          games={explorerGames}
          categories={categoryOptions}
          filters={filters}
        />
      </Suspense>
    </div>
  );
}
