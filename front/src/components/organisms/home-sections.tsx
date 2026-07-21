import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  ChevronLeft,
  Compass,
  Flame,
  Sparkles,
} from "lucide-react";

import type { Article, Game, Publisher } from "@/services/strapi";
import { Container } from "@/components/atoms/container";
import { ArticleCard } from "@/components/molecules/article-card";
import {
  extractCategoryNames,
  formatPlayers,
  getGameImageUrl,
  getGameRating,
  getPublisherFromGame,
} from "@/lib/strapi-helpers";

function getPublisherGamesCount(publisher: Publisher, games: Game[]) {
  const slug = publisher.slug;
  if (!slug) return 0;
  return games.filter((g) => getPublisherFromGame(g).slug === slug).length;
}

function GameReelCard({ game }: { game: Game }) {
  const imageUrl = getGameImageUrl(game);
  const categories = extractCategoryNames(game);
  const rating = getGameRating(game);
  const publisher = getPublisherFromGame(game);

  return (
    <Link
      href={game.slug ? `/games/${game.slug}` : "/"}
      className="group w-64 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950 shadow transition-all duration-300 hover:border-amber-500/35 hover:shadow-lg hover:shadow-amber-500/5"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={game.title ?? "بازی"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-500/20 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <span className="absolute bottom-2 right-2 rounded-md border border-slate-800 bg-slate-900/90 px-2 py-0.5 font-mono text-xs font-bold text-amber-500">
          ★ {rating.toFixed(1)}
        </span>
      </div>
      <div className="space-y-2 p-4 text-right">
        <strong className="block truncate text-sm text-slate-200 transition-colors group-hover:text-amber-400">
          {game.title}
        </strong>
        {game.titleEnglish ? (
          <p className="truncate font-mono text-[10px] text-slate-400">{game.titleEnglish}</p>
        ) : null}
        <div className="flex items-center justify-between border-t border-slate-900 pt-1.5 text-[10px] text-slate-500">
          <span>کلاس: {categories[0] ?? "بوردگیم"}</span>
          <span>{formatPlayers(game)}</span>
        </div>
      </div>
    </Link>
  );
}

export function HomeSections({
  games,
  articles,
  publishers,
}: {
  games: Game[];
  articles: Article[];
  publishers: Publisher[];
}) {
  const newReleases = [...games]
    .sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0))
    .slice(0, 3);

  const allCategories = Array.from(
    new Set(games.flatMap((g) => extractCategoryNames(g))),
  );

  const strategyGames = games.filter((g) =>
    extractCategoryNames(g).some((c) =>
      ["استراتژیک", "کنترل قلمرو", "مدیریت منابع", "اقتصادی"].includes(c),
    ),
  );

  const partyGames = games.filter((g) =>
    extractCategoryNames(g).some((c) =>
      ["نقش مخفی", "بلوف‌زنی", "پارتی گیم", "دورهمی"].includes(c),
    ),
  );

  const familyGames = games.filter((g) =>
    extractCategoryNames(g).some((c) =>
      ["خانوادگی", "جمع‌آوری مجموعه", "موتورسازی"].includes(c),
    ),
  );

  return (
    <div className="animate-fade-in space-y-12 pb-16">
      {/* About + intro video */}
      <Container>
        <div
          id="about-site-showcase"
          className="relative space-y-6 overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-slate-950/40 p-6 shadow-xl sm:p-8"
        >
          <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-4 text-right lg:col-span-7">
              <div className="flex items-center gap-2">
                <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] font-black tracking-wider text-amber-500">
                  ABOUT BOARDBORD.COM
                </span>
                <h2 className="text-lg font-black text-slate-100 sm:text-xl">
                  درباره بوردبرد؛ دانشنامه مستقل منتقدین بوردگیم
                </h2>
              </div>
              <p className="text-justify text-xs leading-relaxed text-slate-400 sm:text-sm">
                پایگاه اینترنتی <strong className="text-amber-500">بوردبرد (boardbord.com)</strong> مرجعی نوین و مشارکتی با هدف ارتقای آگاهی بازیکنان، اشتراک‌گذاری کلوب منتقدین و ارزیابی چندبعدی بازی‌های فکری و رومیزی بومی و وارداتی است.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-slate-300">
                {[
                  "محاسبه معدل وزنی هوشمند با مدل IMDB",
                  "کلوب منتقدین معتبر و رنک‌های برنز تا طلا",
                  "پروفایل شخصی‌سازی شده با قابلیت مورد علاقه",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="group relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300 hover:border-amber-500/20">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/S2gP_R2-WqA"
                  title="معرفی ویدیویی بوردبرد"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* New releases + rating hub */}
      <Container>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 animate-pulse text-amber-500" />
                <h2 className="text-lg font-black text-slate-200">
                  جدیدترین انتشارات بوردگیم بومی و خارجی
                </h2>
              </div>
              <Link
                href="/games"
                className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-400"
              >
                <span>بانک کل بازی‌ها</span>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {newReleases.map((game) => {
                const imageUrl = getGameImageUrl(game);
                const publisher = getPublisherFromGame(game);
                return (
                  <Link
                    key={game.slug}
                    href={game.slug ? `/games/${game.slug}` : "/"}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow transition-all duration-300 hover:border-amber-500/35"
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-950">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={game.title ?? "بازی"}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : null}
                      {game.releaseYear ? (
                        <span className="absolute bottom-1 right-1 rounded-md border border-slate-800 bg-slate-950/90 px-2 py-0.5 font-mono text-[8px] text-amber-400">
                          سال {game.releaseYear}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-4 text-right">
                      <div>
                        <strong className="block truncate text-sm text-slate-100 transition-colors group-hover:text-amber-400">
                          {game.title}
                        </strong>
                        {game.titleEnglish ? (
                          <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-400">
                            {game.titleEnglish}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[10px] text-slate-400">
                        <span>ناشر: {publisher.name?.split(" ")[0] ?? "—"}</span>
                        <span className="font-mono font-bold text-amber-500">
                          ★ {getGameRating(game).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-800/80 bg-slate-900/30 p-5 text-right lg:col-span-4">
            <span className="block font-mono text-[10px] text-slate-500">EXPLANATION HUB</span>
            <h3 className="text-sm font-extrabold text-slate-200">المان‌های کلیدی امتیازدهی (IMDB)</h3>
            <p className="text-justify text-xs leading-relaxed text-slate-400">
              هر کاربر نقد خود را همراه با ۵ المان اصلی ثبت می‌کند و امتیاز نهایی از میانگین وزنی محاسبه می‌شود.
            </p>
            <div className="space-y-2 text-[10px] text-slate-300">
              {[
                ["مکانیک‌ها و لذت روند بازی", "گیم‌پلی"],
                ["کیفیت آرت و قطعات", "طراحی هنری"],
                ["شفافیت قوانین", "سهولت قوانین"],
                ["عمق تاکتیکی", "استراتژی"],
              ].map(([fa, en]) => (
                <div
                  key={en}
                  className="flex justify-between rounded-lg bg-slate-950/40 p-2"
                >
                  <span>{fa}</span>
                  <strong className="text-amber-400">{en}</strong>
                </div>
              ))}
            </div>
            {allCategories.length > 0 ? (
              <div className="pt-2">
                <h4 className="mb-2 text-xs font-bold text-slate-200">دسته‌بندی‌های پرتکرار</h4>
                <div className="flex flex-wrap gap-1">
                  {allCategories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat}
                      href="/games"
                      className="rounded bg-slate-900 px-2.5 py-1 text-[10px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-amber-400"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>

      {/* Category reels */}
      <Container className="space-y-12" id="home-category-reels">
        {[
          {
            title: "ریل بازی‌های استراتژیک و تاکتیکی عمیق",
            icon: Sparkles,
            games: strategyGames,
            tag: "STRATEGY & TACTICS REEL",
          },
          {
            title: "ریل بازی‌های دورهمی، مهمانی و نقش مخفی",
            icon: Award,
            games: partyGames,
            tag: "SOCIAL & PARTY BLUFFS",
          },
          {
            title: "ریل سنگین‌نشین خانوادگی و گیت‌وی دوستانه",
            icon: Compass,
            games: familyGames,
            tag: "FAMILY & GATEWAY GEMS",
          },
        ].map((reel) => {
          const Icon = reel.icon;
          if (reel.games.length === 0) return null;
          return (
            <div key={reel.tag} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-black text-slate-200">{reel.title}</h2>
                </div>
                <span className="font-mono text-[10px] text-slate-500">{reel.tag}</span>
              </div>
              <div className="no-scrollbar flex gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth">
                {reel.games.map((game) => (
                  <GameReelCard key={game.slug} game={game} />
                ))}
              </div>
            </div>
          );
        })}
      </Container>

      {/* Articles */}
      {articles.length > 0 ? (
        <Container className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-black text-slate-200">
                مقالات نقد و آموزش آخرین بوردگیم‌ها
              </h2>
            </div>
            <Link
              href="/articles"
              className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-400"
            >
              <span>بایگانی تمامی مقالات</span>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {articles.slice(0, 2).map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </Container>
      ) : null}

      {/* Publishers */}
      {publishers.length > 0 ? (
        <Container>
          <div className="space-y-4 rounded-3xl border border-slate-850 bg-slate-900/10 p-6">
            <h3 className="text-sm font-bold text-slate-300 sm:text-base">
              ناشران برتر حامی بوردگیم فارسی
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {publishers.slice(0, 3).map((pub) => (
                <Link
                  key={pub.slug}
                  href={`/publishers/${pub.slug}`}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition-colors hover:border-amber-500/30"
                >
                  <div className="font-bold text-slate-100 hover:text-amber-400">{pub.name}</div>
                  <div className="mt-1 font-mono text-[10px] text-slate-500">
                    {getPublisherGamesCount(pub, games)} بازی
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      ) : null}
    </div>
  );
}
