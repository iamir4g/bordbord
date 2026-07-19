"use client";

import * as React from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import type { Game } from "@/services/strapi";
import { Container } from "@/components/atoms/container";
import { FilterBar } from "@/components/organisms/filter-bar";
import { GameGrid } from "@/components/organisms/game-grid";
import {
  applyGameCatalogFiltersToSearchParams,
  type GameCatalogUiFilters,
} from "@/lib/game-catalog-filters";

type CategoryOption = {
  name: string;
  slug: string;
};

export function GamesExplorer({
  games,
  categories,
  filters,
}: {
  games: Game[];
  categories: CategoryOption[];
  filters: GameCatalogUiFilters;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = filters.query.trim();
  const activeCategories = filters.categorySlugs;

  const toggleCategory = React.useCallback(
    (category: string) => {
      const nextCategories =
        category === "همه"
          ? []
          : activeCategories.includes(category)
            ? activeCategories.filter((item) => item !== category)
            : [...activeCategories, category];

      const nextParams = applyGameCatalogFiltersToSearchParams(searchParams, {
        query,
        categorySlugs: nextCategories,
      });
      const qs = nextParams.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [activeCategories, pathname, query, router, searchParams],
  );

  return (
    <>
      <FilterBar
        categories={categories}
        activeCategories={activeCategories}
        onChange={toggleCategory}
      />
      <Container id="games" className="animate-fade-in py-10">
        <div className="text-sm text-slate-400">
          نمایش{" "}
          <span className="font-semibold text-amber-400">{games.length}</span>{" "}
          بازی
          {activeCategories.length > 0 ? (
            <span className="text-slate-500">
              {" "}
              با {activeCategories.length} دسته‌بندی فعال
            </span>
          ) : null}
          {query ? (
            <span className="text-slate-500">
              {" "}برای «{query}»
            </span>
          ) : null}
        </div>
        <div className="mt-5">
          <GameGrid games={games} />
        </div>
      </Container>
    </>
  );
}
