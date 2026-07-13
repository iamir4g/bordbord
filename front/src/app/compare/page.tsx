import { Container } from "@/components/atoms/container";
import { CompareView } from "@/components/organisms/compare-view";
import { getGames } from "@/services/strapi";

export default async function ComparePage() {
  const games = await getGames().catch(() => []);

  return (
    <div className="flex flex-1 flex-col">
      <Container className="py-8">
        <CompareView games={games} />
      </Container>
    </div>
  );
}
