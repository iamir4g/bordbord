import { Hero } from "@/components/organisms/hero";
import { GamesExplorer } from "@/components/organisms/games-explorer";
import { getGames } from "@/services/strapi";

export default async function Home() {
  const games = await getGames().catch(() => []);
  const featured = games[0] ?? null;
  const categories = [
    "Strategy",
    "Family",
    "Party",
    "Co-op",
    "Card",
    "Abstract",
  ];

  return (
    <div className="flex flex-1 flex-col">
      <Hero game={featured} />
      <GamesExplorer games={games} categories={categories} />
    </div>
  );
}
