import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { getPublishers, getStrapiMediaUrl } from "@/services/strapi";

function getLogoUrl(publisher: Awaited<ReturnType<typeof getPublishers>>[number]) {
  const rel = publisher.logo as unknown;
  const url =
    (rel && typeof rel === "object" && "url" in rel && typeof rel.url === "string"
      ? rel.url
      : null) ??
    (rel &&
    typeof rel === "object" &&
    "data" in rel &&
    rel.data &&
    typeof rel.data === "object" &&
    "url" in rel.data &&
    typeof (rel.data as { url?: string }).url === "string"
      ? (rel.data as { url: string }).url
      : null);
  return getStrapiMediaUrl(url);
}

function getGamesCount(publisher: Awaited<ReturnType<typeof getPublishers>>[number]) {
  const games = publisher.games as unknown;
  if (Array.isArray(games)) return games.length;
  if (games && typeof games === "object" && "data" in games && Array.isArray(games.data)) {
    return games.data.length;
  }
  return 0;
}

export default async function PublishersPage() {
  const publishers = await getPublishers().catch(() => []);

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <Container className="py-10">
        <Heading className="text-2xl text-slate-100">ناشران بازی</Heading>
        <p className="mt-2 text-sm text-slate-400">
          ناشران ایرانی و بین‌المللی بوردگیم‌های موجود در بوردبرد
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {publishers.map((publisher) => {
            const logoUrl = getLogoUrl(publisher);
            const gamesCount = getGamesCount(publisher);
            const bio =
              typeof publisher.bio === "string"
                ? publisher.bio.replace(/<[^>]*>/g, "").slice(0, 160)
                : "";

            return (
              <div
                key={publisher.slug}
                className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-md transition-all duration-300 hover:border-amber-500/30 hover:shadow-xl"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 self-start">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={publisher.name ?? "لوگو"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                      لوگو
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/publishers/${publisher.slug}`}
                      className="text-base font-bold text-slate-100 transition-colors hover:text-amber-400"
                    >
                      {publisher.name}
                    </Link>
                    {publisher.nameEnglish ? (
                      <p className="mt-0.5 font-mono text-[11px] tracking-wider text-slate-400">
                        {publisher.nameEnglish}
                      </p>
                    ) : null}
                    {bio ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {bio}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs">
                    <span className="text-slate-400">
                      تعداد بازی‌ها:{" "}
                      <strong className="font-mono text-amber-500">{gamesCount} عدد</strong>
                    </span>
                    <Link
                      href={`/publishers/${publisher.slug}`}
                      className="flex items-center gap-1 font-bold text-amber-500 hover:text-amber-400"
                    >
                      <span>صفحه ناشر</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
