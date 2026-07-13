import { Suspense } from "react";

import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { GamesExplorer } from "@/components/organisms/games-explorer";
import { extractCategoryNames } from "@/lib/strapi-helpers";
import { getGames } from "@/services/strapi";

export default async function GamesPage() {
  const games = await getGames().catch(() => []);
  const categories = Array.from(
    new Set(games.flatMap((game) => extractCategoryNames(game))),
  );

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <Container className="py-8">
        <Heading className="text-2xl text-slate-100">بانک بازی‌ها</Heading>
        <p className="mt-2 text-sm text-slate-400">
          کاتالوگ جامع بوردگیم‌های فارسی و بین‌المللی با فیلتر دسته‌بندی و جستجو
        </p>
      </Container>
      <Suspense fallback={null}>
        <GamesExplorer games={games} categories={categories} />
      </Suspense>
    </div>
  );
}
