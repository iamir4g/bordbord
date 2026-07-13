import Image from "next/image";
import { notFound } from "next/navigation";

import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { GameGrid } from "@/components/organisms/game-grid";
import { getDesignerBySlug, getStrapiMediaUrl, type Game } from "@/services/strapi";

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

function unwrap<T>(entity: unknown): T | null {
  if (!entity || typeof entity !== "object") return null;
  const attrs = (entity as Record<string, unknown>)["attributes"];
  if (attrs && typeof attrs === "object") return attrs as T;
  return entity as T;
}

export default async function DesignerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const designer = await getDesignerBySlug(slug);
  if (!designer) notFound();

  const logoUrlRaw =
    (getNested(designer.logo, ["data", "attributes", "url"]) as string | undefined) ??
    (getNested(designer.logo, ["url"]) as string | undefined) ??
    null;
  const logoUrl = getStrapiMediaUrl(logoUrlRaw);

  const gameData = getNested(designer.games, ["data"]);
  const games = Array.isArray(gameData)
    ? gameData
        .map((e) => unwrap<Game>(e))
        .filter((g): g is Game => Boolean(g))
    : [];

  const bio = typeof designer.bio === "string" ? designer.bio : null;

  return (
    <div className="flex flex-1 flex-col">
      <Container className="py-8">
        <div className="flex items-start gap-4">
          {logoUrl ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <Image
                src={logoUrl}
                alt={designer.name ?? "Designer logo"}
                fill
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <Heading className="text-3xl">{designer.name ?? "Designer"}</Heading>
            {bio ? (
              <div className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                {bio}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10">
          <Heading className="text-xl">Games</Heading>
          <div className="mt-4">
            <GameGrid games={games} />
          </div>
        </div>
      </Container>
    </div>
  );
}

