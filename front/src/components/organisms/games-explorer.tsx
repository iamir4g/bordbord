"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import type { Game } from "@/services/strapi";
import { Container } from "@/components/atoms/container";
import { FilterBar } from "@/components/organisms/filter-bar";
import { GameGrid } from "@/components/organisms/game-grid";

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

function extractCategoryNames(game: Game) {
  const rel = game.categories as unknown;
  const data = getNested(rel, ["data"]);
  if (Array.isArray(data)) {
    return data
      .map((e) => getNested(e, ["attributes", "name"]) ?? getNested(e, ["name"]))
      .filter((v): v is string => typeof v === "string");
  }
  if (Array.isArray(rel)) {
    return rel
      .map((e) => getNested(e, ["name"]))
      .filter((v): v is string => typeof v === "string");
  }
  return [];
}

function getPublisherName(game: Game) {
  const rel = game.publisher as unknown;
  return (
    (getNested(rel, ["data", "attributes", "name"]) as string | undefined) ??
    (getNested(rel, ["name"]) as string | undefined) ??
    ""
  );
}

export function GamesExplorer({
  games,
  categories,
}: {
  games: Game[];
  categories: string[];
}) {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const [active, setActive] = React.useState("همه");

  const filtered = React.useMemo(() => {
    return games.filter((g) => {
      const matchesCategory =
        active === "همه" ||
        extractCategoryNames(g).some((c) => c === active);

      if (!matchesCategory) return false;
      if (!query) return true;

      const haystack = [
        g.title ?? "",
        g.titleEnglish ?? "",
        getPublisherName(g),
        ...extractCategoryNames(g),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [active, games, query]);

  return (
    <>
      <FilterBar categories={categories} active={active} onChange={setActive} />
      <Container id="games" className="animate-fade-in py-10">
        <div className="text-sm text-slate-400">
          نمایش{" "}
          <span className="font-semibold text-amber-400">{filtered.length}</span>{" "}
          بازی
          {query ? (
            <span className="text-slate-500"> برای «{searchParams.get("q")}»</span>
          ) : null}
        </div>
        <div className="mt-5">
          <GameGrid games={filtered} />
        </div>
      </Container>
    </>
  );
}
