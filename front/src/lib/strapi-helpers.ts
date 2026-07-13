import type { Game } from "@/services/strapi";
import { getStrapiMediaUrl } from "@/services/strapi";

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

function firstMediaUrl(media: unknown): string | null {
  if (!media) return null;

  if (Array.isArray(media)) {
    for (const item of media) {
      const url = firstMediaUrl(item);
      if (url) return url;
    }
    return null;
  }

  if (typeof media === "object") {
    const obj = media as Record<string, unknown>;
    if (typeof obj.url === "string") return obj.url;
    if (obj.data) return firstMediaUrl(obj.data);
    if (obj.attributes && typeof obj.attributes === "object") {
      const url = (obj.attributes as { url?: string }).url;
      if (url) return url;
    }
  }

  return null;
}

export function getGameImageUrl(game: Game) {
  return getStrapiMediaUrl(firstMediaUrl(game.images));
}

export function getCoverImageUrl(cover: unknown) {
  return getStrapiMediaUrl(firstMediaUrl(cover));
}

export function extractCategoryNames(game: Game) {
  const rel = game.categories as unknown;
  const data = getNested(rel, ["data"]);
  const list = Array.isArray(data) ? data : Array.isArray(rel) ? rel : [];
  return list
    .map(
      (e) =>
        getNested(e, ["attributes", "name"]) ??
        getNested(e, ["name"]) ??
        (typeof e === "string" ? e : null),
    )
    .filter((v): v is string => typeof v === "string");
}

export type PublisherSummary = {
  name: string | null;
  slug: string | null;
  nameEnglish: string | null;
  bio: string | null;
  country: string | null;
  foundedYear: number | null;
  logoUrl: string | null;
};

export function getPublisherFromGame(game: Game): PublisherSummary {
  const rel = game.publisher as unknown;
  const logoRaw =
    (getNested(rel, ["data", "attributes", "logo", "data", "attributes", "url"]) as
      | string
      | undefined) ??
    (getNested(rel, ["logo", "data", "attributes", "url"]) as string | undefined) ??
    (getNested(rel, ["logo", "url"]) as string | undefined) ??
    null;

  return {
    name:
      (getNested(rel, ["data", "attributes", "name"]) as string | undefined) ??
      (getNested(rel, ["name"]) as string | undefined) ??
      null,
    slug:
      (getNested(rel, ["data", "attributes", "slug"]) as string | undefined) ??
      (getNested(rel, ["slug"]) as string | undefined) ??
      null,
    nameEnglish:
      (getNested(rel, ["data", "attributes", "nameEnglish"]) as string | undefined) ??
      (getNested(rel, ["nameEnglish"]) as string | undefined) ??
      null,
    bio:
      stripHtml(
        (getNested(rel, ["data", "attributes", "bio"]) as string | undefined) ??
          (getNested(rel, ["bio"]) as string | undefined) ??
          null,
      ) || null,
    country:
      (getNested(rel, ["data", "attributes", "country"]) as string | undefined) ??
      (getNested(rel, ["country"]) as string | undefined) ??
      null,
    foundedYear:
      (getNested(rel, ["data", "attributes", "foundedYear"]) as number | undefined) ??
      (getNested(rel, ["foundedYear"]) as number | undefined) ??
      null,
    logoUrl: getStrapiMediaUrl(logoRaw),
  };
}

export function getGameRating(game: Game) {
  if (typeof game.averageRating === "number") return game.averageRating;
  if (typeof game.rating === "number") return game.rating;
  const complexity = typeof game.complexity === "number" ? game.complexity : 2.5;
  return Math.max(5, Math.min(10, 6 + complexity));
}

export function formatPlayers(game: Game) {
  if (game.minPlayers && game.maxPlayers) {
    return `${game.minPlayers} تا ${game.maxPlayers} نفر`;
  }
  return "نامشخص";
}

export function formatPlayTime(game: Game) {
  if (game.playingTime) return `${game.playingTime} دقیقه`;
  return "نامشخص";
}

export function stripHtml(text?: string | null) {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "").trim();
}

export type RatingElements = {
  gameplay: number;
  artAndComponents: number;
  rulesEase: number;
  strategyDepth: number;
  replayability: number;
};

export function getDesignerFromGame(game: Game) {
  const rel = game.designer as unknown;
  return {
    name:
      (getNested(rel, ["data", "attributes", "name"]) as string | undefined) ??
      (getNested(rel, ["name"]) as string | undefined) ??
      null,
    slug:
      (getNested(rel, ["data", "attributes", "slug"]) as string | undefined) ??
      (getNested(rel, ["slug"]) as string | undefined) ??
      null,
  };
}

export function formatAgeRange(game: Game) {
  if (typeof game.age === "number") return `+${game.age} سال`;
  return "نامشخص";
}

export function getDifficultyLabel(weight: number) {
  if (weight >= 4.0) return "بسیار سنگین (فوق حرفه‌ای)";
  if (weight >= 3.0) return "نیمه‌سنگین (استراتژیک حرفه‌ای)";
  if (weight >= 2.0) return "متوسط (آماتور تا نیمه‌حرفه‌ای)";
  return "سبک (خانوادگی و مبتدی)";
}

export function getSimilarGames(current: Game, allGames: Game[], limit = 3) {
  const currentSlug = current.slug;
  const currentCategories = new Set(
    extractCategoryNames(current).map((c) => c.toLowerCase()),
  );
  const currentPublisher = getPublisherFromGame(current).slug;
  const currentComplexity =
    typeof current.complexity === "number" ? current.complexity : 2.5;

  return allGames
    .filter((g) => g.slug && g.slug !== currentSlug)
    .map((g) => {
      const categoryMatches = extractCategoryNames(g).filter((cat) =>
        currentCategories.has(cat.toLowerCase()),
      ).length;
      const publisherMatch =
        getPublisherFromGame(g).slug &&
        getPublisherFromGame(g).slug === currentPublisher
          ? 2
          : 0;
      const gComplexity = typeof g.complexity === "number" ? g.complexity : 2.5;
      const diffDiff = Math.abs(gComplexity - currentComplexity);
      const difficultyScore = diffDiff < 0.6 ? 2 : diffDiff < 1.2 ? 1 : 0;

      return {
        game: g,
        score: categoryMatches * 4 + publisherMatch + difficultyScore,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.game);
}

export function getOtherGamesByPublisher(
  current: Game,
  allGames: Game[],
  limit = 3,
) {
  const publisherSlug = getPublisherFromGame(current).slug;
  if (!publisherSlug) return [];
  return allGames
    .filter(
      (g) =>
        g.slug &&
        g.slug !== current.slug &&
        getPublisherFromGame(g).slug === publisherSlug,
    )
    .slice(0, limit);
}

export function buildRatingsFromGame(game: {
  ratingGameplay?: number;
  ratingArt?: number;
  ratingRules?: number;
  ratingStrategy?: number;
  ratingReplay?: number;
  averageRating?: number;
}): RatingElements {
  const avg = game.averageRating ?? 7.5;
  return {
    gameplay: game.ratingGameplay ?? avg,
    artAndComponents: game.ratingArt ?? avg,
    rulesEase: game.ratingRules ?? avg,
    strategyDepth: game.ratingStrategy ?? avg,
    replayability: game.ratingReplay ?? avg,
  };
}
