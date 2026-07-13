import { Container } from "@/components/atoms/container";
import { RankingsView } from "@/components/organisms/rankings-view";
import { getGames } from "@/services/strapi";

export default async function RankingsPage() {
  const games = await getGames().catch(() => []);

  return (
    <div className="flex flex-1 flex-col">
      <Container className="py-8">
        <RankingsView games={games} />
      </Container>
    </div>
  );
}
