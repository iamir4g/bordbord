import { Suspense } from "react";

import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { GamesExplorer } from "@/components/organisms/games-explorer";
import { parseGameCatalogFilters } from "@/lib/game-catalog-filters";
import { getCategories, getGames } from "@/services/strapi";

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
  }>;
}) {
  const filters = parseGameCatalogFilters(await searchParams);
  const [games, categories] = await Promise.all([
    getGames({
      query: filters.query,
      categorySlugs: filters.categorySlugs,
    }).catch(() => []),
    getCategories().catch(() => []),
  ]);

  const categoryOptions = categories
    .map((category) => ({
      name: typeof category.name === "string" ? category.name : "",
      slug: typeof category.slug === "string" ? category.slug : "",
    }))
    .filter((category) => category.name && category.slug);

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <Container className="py-8">
        <Heading className="text-2xl text-slate-100">بانک بازی‌ها</Heading>
        <p className="mt-2 text-sm text-slate-400">
          کاتالوگ جامع بوردگیم‌های فارسی و بین‌المللی با فیلتر دسته‌بندی و جستجو
        </p>
      </Container>
      <Suspense fallback={null}>
        <GamesExplorer
          games={games}
          categories={categoryOptions}
          filters={filters}
        />
      </Suspense>
    </div>
  );
}
