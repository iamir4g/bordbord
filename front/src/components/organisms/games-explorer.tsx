"use client";

import * as React from "react";

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

export function GamesExplorer({ games, categories }: { games: Game[]; categories: string[] }) {
  const [active, setActive] = React.useState("All");

  const filtered = React.useMemo(() => {
    if (active === "All") return games;
    return games.filter((g) => extractCategoryNames(g).some((c) => c.toLowerCase() === active.toLowerCase()));
  }, [active, games]);

  return (
    <>
      <FilterBar categories={categories} active={active} onChange={setActive} />
      <Container id="games" className="py-10">
        <div className="text-sm text-slate-300">
          Showing <span className="font-semibold text-zinc-100">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "game" : "games"}
        </div>
        <div className="mt-5">
          <GameGrid games={filtered} />
        </div>
      </Container>
    </>
  );
}

