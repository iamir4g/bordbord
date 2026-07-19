export type StrapiCollectionResponse<T> = {
  data: Array<
    {
      id: number;
      documentId?: string;
      attributes?: T;
    } & T
  >;
  meta?: unknown;
};

export type StrapiSingleResponse<T> = {
  data:
    | ({
        id: number;
        documentId?: string;
        attributes?: T;
      } & T)
    | null;
  meta?: unknown;
};

type FetchOptions = Omit<RequestInit, "cache"> & { cache?: RequestCache };
type QueryValue = string | number | boolean | null | undefined;

function getBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
}

function getPublicBaseUrl() {
  return process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
}

async function fetchJson<T>(path: string, options?: FetchOptions): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl);
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Strapi request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  return (await res.json()) as T;
}

function unwrap<T>(entity: { attributes?: T } & Partial<T>): T {
  const attributes = (entity.attributes ?? entity) as T;
  if (!attributes || typeof attributes !== "object") return attributes;
  const id = (entity as { id?: number }).id;
  const documentId = (entity as { documentId?: string }).documentId;
  return {
    ...(typeof id === "number" ? { id } : {}),
    ...(typeof documentId === "string" ? { documentId } : {}),
    ...(attributes as Record<string, unknown>),
  } as T;
}

function appendQueryValue(qs: URLSearchParams, key: string, value: QueryValue) {
  if (value === null || value === undefined || value === "") return;
  qs.set(key, String(value));
}

function buildListUrl(
  path: string,
  populate: string[],
  query?: Record<string, QueryValue>,
) {
  const qs = new URLSearchParams();
  populate.forEach((p, idx) => qs.set(`populate[${idx}]`, p));
  Object.entries(query ?? {}).forEach(([key, value]) =>
    appendQueryValue(qs, key, value),
  );
  if (!qs.has("pagination[pageSize]")) {
    qs.set("pagination[pageSize]", "100");
  }
  if (!qs.has("sort")) {
    qs.set("sort", "createdAt:desc");
  }
  return `${path}?${qs.toString()}`;
}

function withPopulate(
  path: string,
  populate: string[],
  query?: Record<string, QueryValue>,
) {
  return buildListUrl(path, populate, query);
}

function withPopulateAndFilters(
  path: string,
  populate: string[],
  filters: Record<string, QueryValue>,
) {
  return buildListUrl(path, populate, filters);
}

export function getStrapiMediaUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${getPublicBaseUrl()}${url}`;
}

export type StrapiMedia = {
  url?: string;
  alternativeText?: string;
};

type RelationMany<T> =
  | { data?: Array<{ id: number; attributes?: T } & T> }
  | Array<T>
  | undefined;

type RelationOne<T> =
  | { data?: ({ id: number; documentId?: string; attributes?: T } & T) | null }
  | ({ id?: number; documentId?: string; attributes?: T } & Partial<T>)
  | undefined
  | null;

export type Game = {
  id?: number;
  documentId?: string;
  title?: string;
  titleEnglish?: string;
  slug?: string;
  description?: string;
  story?: string;
  videoUrl?: string;
  minPlayers?: number;
  maxPlayers?: number;
  bestPlayerCount?: string;
  playingTime?: number;
  age?: number;
  languageDependency?: string;
  releaseYear?: number;
  complexity?: number;
  rating?: number;
  averageRating?: number;
  ratingsCount?: number;
  ratingGameplay?: number;
  ratingArt?: number;
  ratingRules?: number;
  ratingStrategy?: number;
  ratingReplay?: number;
  images?: RelationMany<StrapiMedia>;
  categories?: RelationMany<{ name?: string; slug?: string }>;
  mechanics?: RelationMany<{ name?: string; slug?: string }>;
  publisher?: RelationOne<{ name?: string; slug?: string }>;
  designer?: RelationOne<{ name?: string; slug?: string }>;
};

export type Publisher = {
  id?: number;
  documentId?: string;
  name?: string;
  nameEnglish?: string;
  slug?: string;
  bio?: string;
  foundedYear?: number;
  country?: string;
  website?: string;
  logo?: RelationOne<StrapiMedia>;
  games?: RelationMany<Game>;
};

export type Article = {
  id?: number;
  documentId?: string;
  title?: string;
  slug?: string;
  brief?: string;
  content?: string;
  author?: string;
  publishedDate?: string;
  readTime?: string;
  category?: string;
  likes?: number;
  tags?: string[];
  coverImage?: RelationOne<StrapiMedia>;
};

export type Designer = {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
  bio?: string;
  logo?: RelationOne<StrapiMedia>;
  games?: RelationMany<Game>;
};

export type Category = {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
};

export type GameCatalogFilters = {
  query?: string;
  categorySlugs?: string[];
  publisherSlug?: string;
};

function buildGameCatalogQuery(filters: GameCatalogFilters = {}) {
  const query = new URLSearchParams();

  const categorySlugs = Array.from(
    new Set(
      (filters.categorySlugs ?? []).map((item) => item.trim()).filter(Boolean),
    ),
  );

  categorySlugs.forEach((slug, idx) => {
    query.set(`filters[categories][slug][$in][${idx}]`, slug);
  });

  const trimmedQuery = filters.query?.trim();
  if (trimmedQuery) {
    const searchTargets = [
      ["title"],
      ["titleEnglish"],
      ["publisher", "name"],
      ["categories", "name"],
    ];

    searchTargets.forEach((segments, idx) => {
      const key = segments.reduce(
        (acc, segment) => `${acc}[${segment}]`,
        `filters[$or][${idx}]`,
      );
      query.set(`${key}[$containsi]`, trimmedQuery);
    });
  }

  const publisherSlug = filters.publisherSlug?.trim();
  if (publisherSlug) {
    query.set("filters[publisher][slug][$eq]", publisherSlug);
  }

  query.set("pagination[pageSize]", "100");
  query.set("sort", "createdAt:desc");

  return query;
}

export async function getGames(filters: GameCatalogFilters = {}) {
  const query = buildGameCatalogQuery(filters);
  const url = withPopulate(
    "/api/games",
    ["images", "categories", "mechanics", "publisher"],
    Object.fromEntries(query.entries()),
  );
  const res = await fetchJson<StrapiCollectionResponse<Game>>(url, {
    cache: "no-store",
  });
  return res.data.map((e) => unwrap<Game>(e));
}

export async function getGameBySlug(slug: string) {
  const url = withPopulateAndFilters(
    "/api/games",
    [
      "images",
      "categories",
      "mechanics",
      "publisher",
      "publisher.logo",
      "designer",
    ],
    { "filters[slug][$eq]": slug },
  );
  const res = await fetchJson<StrapiCollectionResponse<Game>>(url, {
    cache: "no-store",
  });
  const first = res.data[0];
  return first ? unwrap<Game>(first) : null;
}

export async function getPublisherBySlug(slug: string) {
  const url = withPopulateAndFilters(
    "/api/publishers",
    [
      "logo",
      "games",
      "games.images",
      "games.categories",
      "games.mechanics",
      "games.publisher",
    ],
    { "filters[slug][$eq]": slug },
  );
  const res = await fetchJson<StrapiCollectionResponse<Publisher>>(url, {
    cache: "no-store",
  });
  const first = res.data[0];
  return first ? unwrap<Publisher>(first) : null;
}

export async function getPublishers() {
  const url = withPopulate("/api/publishers", ["logo", "games"]);
  const res = await fetchJson<StrapiCollectionResponse<Publisher>>(url, {
    cache: "no-store",
  });
  return res.data.map((e) => unwrap<Publisher>(e));
}

export async function getCategories() {
  const url = withPopulate("/api/categories", [], {
    "pagination[pageSize]": "100",
    sort: "name:asc",
  });
  const res = await fetchJson<StrapiCollectionResponse<Category>>(url, {
    cache: "no-store",
  });
  return res.data.map((e) => unwrap<Category>(e));
}

export async function getArticles() {
  const url = withPopulate("/api/articles", ["coverImage"]);
  const res = await fetchJson<StrapiCollectionResponse<Article>>(url, {
    cache: "no-store",
  });
  return res.data.map((e) => unwrap<Article>(e));
}

export async function getArticleBySlug(slug: string) {
  const url = withPopulateAndFilters("/api/articles", ["coverImage"], {
    "filters[slug][$eq]": slug,
  });
  const res = await fetchJson<StrapiCollectionResponse<Article>>(url, {
    cache: "no-store",
  });
  const first = res.data[0];
  return first ? unwrap<Article>(first) : null;
}

export async function getDesignerBySlug(slug: string) {
  const url = withPopulateAndFilters(
    "/api/designers",
    [
      "logo",
      "games",
      "games.images",
      "games.categories",
      "games.mechanics",
      "games.publisher",
    ],
    { "filters[slug][$eq]": slug },
  );
  const res = await fetchJson<StrapiCollectionResponse<Designer>>(url, {
    cache: "no-store",
  });
  const first = res.data[0];
  return first ? unwrap<Designer>(first) : null;
}
