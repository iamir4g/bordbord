import type { Game } from "@/services/strapi";
import { GameCard } from "@/components/molecules/game-card";

export function GameList({ games }: { games: Game[] }) {
  if (games.length === 0) {
    return <div className="text-sm text-zinc-600 dark:text-zinc-400">No games yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {games.map((game, idx) => (
        <GameCard key={game.slug ?? `${game.title ?? "game"}-${idx}`} game={game} />
      ))}
    </div>
  );
}
