import type { Game } from "@/services/strapi";
import { GameCard } from "@/components/molecules/game-card";

export function GameGrid({ games }: { games: Game[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game, idx) => (
        <GameCard key={game.slug ?? `${game.title ?? "game"}-${idx}`} game={game} />
      ))}
    </div>
  );
}

