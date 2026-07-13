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

function withPopulate(path: string, populate: string[]) {
  const qs = new URLSearchParams();
  populate.forEach((p, idx) => qs.set(`populate[${idx}]`, p));
  return `${path}?${qs.toString()}`;
}

function withPopulateAndFilters(
  path: string,
  populate: string[],
  filters: Record<string, string>,
) {
  const qs = new URLSearchParams();
  populate.forEach((p, idx) => qs.set(`populate[${idx}]`, p));
  Object.entries(filters).forEach(([k, v]) => qs.set(k, v));
  return `${path}?${qs.toString()}`;
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
  slug?: string;
  description?: string;
  minPlayers?: number;
  maxPlayers?: number;
  playingTime?: number;
  age?: number;
  complexity?: number;
  rating?: number;
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
  slug?: string;
  bio?: string;
  logo?: RelationOne<StrapiMedia>;
  games?: RelationMany<Game>;
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

export async function getGames() {
  const url = withPopulate("/api/games", [
    "images",
    "categories",
    "mechanics",
    "publisher",
  ]);
  const res = await fetchJson<StrapiCollectionResponse<Game>>(url, {
    cache: "no-store",
  });
  return res.data.map((e) => unwrap<Game>(e));
}

export async function getGameBySlug(slug: string) {
  const url = withPopulateAndFilters(
    "/api/games",
    ["images", "categories", "mechanics", "publisher", "designer"],
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
