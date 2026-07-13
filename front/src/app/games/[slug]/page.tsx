import { notFound } from "next/navigation";

import { Container } from "@/components/atoms/container";
import { GameDetailsView } from "@/components/organisms/game-details-view";
import {
  getDesignerFromGame,
  getOtherGamesByPublisher,
  getPublisherFromGame,
  getSimilarGames,
} from "@/lib/strapi-helpers";
import { getGameBySlug, getGames } from "@/services/strapi";

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const allGames = await getGames().catch(() => []);
  const publisher = getPublisherFromGame(game);
  const designer = getDesignerFromGame(game);
  const otherGamesByPublisher = getOtherGamesByPublisher(game, allGames);
  const similarGames = getSimilarGames(game, allGames);

  return (
    <div className="flex flex-1 flex-col">
      <Container className="py-8">
        <GameDetailsView
          game={game}
          publisher={publisher}
          designerName={designer.name}
          otherGamesByPublisher={otherGamesByPublisher}
          similarGames={similarGames}
        />
      </Container>
    </div>
  );
}
