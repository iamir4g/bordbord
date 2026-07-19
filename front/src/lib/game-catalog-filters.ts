export const GAME_QUERY_PARAM = "q";
export const GAME_CATEGORY_PARAM = "category";

export type GameCatalogSearchParams = {
  q?: string | string[];
  category?: string | string[];
};

export type GameCatalogUiFilters = {
  query: string;
  categorySlugs: string[];
};

function normalizeCategorySlugs(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

export function parseGameCatalogFilters(
  searchParams: GameCatalogSearchParams,
): GameCatalogUiFilters {
  const rawQuery = searchParams.q;
  const query = Array.isArray(rawQuery)
    ? (rawQuery[0] ?? "").trim()
    : (rawQuery ?? "").trim();

  const rawCategories = searchParams.category;
  const categoryValues = Array.isArray(rawCategories)
    ? rawCategories
    : rawCategories
      ? [rawCategories]
      : [];

  return {
    query,
    categorySlugs: normalizeCategorySlugs(categoryValues),
  };
}

export function applyGameCatalogFiltersToSearchParams(
  current: URLSearchParams,
  filters: GameCatalogUiFilters,
) {
  const next = new URLSearchParams(current.toString());

  next.delete(GAME_QUERY_PARAM);
  next.delete(GAME_CATEGORY_PARAM);

  const query = filters.query.trim();
  if (query) {
    next.set(GAME_QUERY_PARAM, query);
  }

  normalizeCategorySlugs(filters.categorySlugs).forEach((slug) => {
    next.append(GAME_CATEGORY_PARAM, slug);
  });

  return next;
}
