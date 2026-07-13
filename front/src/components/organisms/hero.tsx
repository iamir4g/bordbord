import Image from "next/image";
import Link from "next/link";

import type { Game } from "@/services/strapi";
import { getStrapiMediaUrl } from "@/services/strapi";
import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

function getFirstImageUrl(game: Game) {
  const images = game.images as unknown;
  const first =
    (getNested(images, ["data", 0, "attributes", "url"]) as
      | string
      | undefined) ??
    (getNested(images, ["data", 0, "url"]) as string | undefined) ??
    (getNested(images, [0, "url"]) as string | undefined) ??
    null;
  return getStrapiMediaUrl(first);
}

export function Hero({ game }: { game: Game | null }) {
  const imageUrl = game ? getFirstImageUrl(game) : null;
  const title = game?.title ?? "Board Game of the Week";
  const href = game?.slug ? `/games/${game.slug}` : "/";

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover opacity-45"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-600/30 via-slate-950 to-amber-500/15" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/50 to-transparent" />
      </div>

      <Container className="relative py-14 sm:py-16">
        <div className="max-w-2xl">
          <div className="text-xs font-medium tracking-widest text-indigo-200/80">
            BOARD GAME OF THE WEEK
          </div>
          <Heading className="mt-3 text-3xl sm:text-4xl">{title}</Heading>
          <div className="mt-4 text-sm leading-6 text-slate-300">
            {typeof game?.description === "string"
              ? game.description.slice(0, 160)
              : "Discover standout games, curated weekly. Explore details, stats, and community reviews."}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={href}
              className={cn(buttonVariants({ variant: "default" }))}
            >
              View Game
            </Link>
            <Link
              href="#games"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Browse All
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
