"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import {
  ArrowRight,
  Film,
  Heart,
  Play,
  Sparkles,
  Star,
  Video,
} from "lucide-react";

import { RatingWidget } from "@/components/molecules/rating-widget";
import { CommentSection } from "@/components/organisms/comment-section";
import {
  buildRatingsFromGame,
  extractCategoryNames,
  formatAgeRange,
  formatPlayers,
  formatPlayTime,
  getDifficultyLabel,
  getGameImageUrl,
  getGameRating,
  stripHtml,
  type PublisherSummary,
} from "@/lib/strapi-helpers";
import type { Game } from "@/services/strapi";

function GameVideoPlayer({
  gameTitle,
  videoUrl,
}: {
  gameTitle: string;
  videoUrl?: string | null;
}) {
  const [activeVideoIdx, setActiveVideoIdx] = React.useState(0);

  const baseVideoUrl = videoUrl || "https://www.youtube.com/embed/zXz7gCdf79E";
  const gameVideos = [
    {
      id: "teaser",
      title: "تیزر معرفی و اتمسفر بازی",
      role: "ویدیوی سینماتیک اول",
      desc: "تم داستانی، معرفی کاراکترها و قطعات زیبای بازی",
      url: baseVideoUrl,
      duration: "۲:۴۰",
      type: "معرفی",
    },
    {
      id: "rules",
      title: "آموزش گام‌به‌گام قوانین رسمی",
      role: "ویدیوی راهنمای دوم",
      desc: "آموزش چیدمان اولیه صفحه، نوبت‌ها و روش کسب امتیاز",
      url: baseVideoUrl.includes("?")
        ? `${baseVideoUrl}&start=120`
        : `${baseVideoUrl}?start=120`,
      duration: "۱۱:۱۵",
      type: "آموزش",
    },
    {
      id: "gameplay",
      title: "یک دست بازی کامل (گیم‌پلی زنده)",
      role: "ویدیوی مسابقه سوم",
      desc: "مشاهده جریان عملی بازی با حضور بوردگیمرهای برجسته",
      url: baseVideoUrl.includes("?")
        ? `${baseVideoUrl}&start=320`
        : `${baseVideoUrl}?start=320`,
      duration: "۲۶:۵۰",
      type: "گیم‌پلی",
    },
    {
      id: "review",
      title: "نقد منتقدین و شگردهای برنده شدن",
      role: "ویدیوی بررسی چهارم",
      desc: "تحلیل عمق استراتژی، ارزش تکرار و کیفیت متریال قطعات",
      url: baseVideoUrl.includes("?")
        ? `${baseVideoUrl}&start=650`
        : `${baseVideoUrl}?start=650`,
      duration: "۱۴:۰۵",
      type: "تحلیل",
    },
  ];

  const activeVideo = gameVideos[activeVideoIdx];

  return (
    <div
      className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl"
      id="video-section"
    >
      <div className="flex items-center justify-between border-b border-slate-850 p-5">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-100 sm:text-base">
              بخش چندرسانه‌ای بازی
            </h3>
            <p className="mt-0.5 text-[10px] text-slate-400">
              شامل ۴ ویدیوی تخصصی: تیزر، آموزش کامل، گیم‌پلی زنده و تحلیل
            </p>
          </div>
        </div>
        <span className="rounded-md bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] text-amber-500">
          {activeVideo.type}
        </span>
      </div>

      <div className="relative aspect-video bg-black">
        <iframe
          src={activeVideo.url}
          title={`${gameTitle} - ${activeVideo.title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          className="h-full w-full animate-fade-in border-0"
          key={activeVideoIdx}
        />
      </div>

      <div
        className="border-b border-slate-800 bg-slate-950/40 p-4 text-right leading-relaxed"
        dir="rtl"
      >
        <strong className="mb-1 block text-xs text-slate-200 sm:text-sm">
          {activeVideo.title}
        </strong>
        <span className="block text-[11px] text-slate-400">{activeVideo.desc}</span>
      </div>

      <div className="grid grid-cols-1 gap-3 bg-slate-950/60 p-4 sm:grid-cols-2">
        {gameVideos.map((vid, idx) => {
          const isSelected = activeVideoIdx === idx;
          return (
            <button
              key={vid.id}
              type="button"
              onClick={() => setActiveVideoIdx(idx)}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-right transition-all duration-300 ${
                isSelected
                  ? "border-amber-500/30 bg-amber-500/10 shadow"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/80"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isSelected
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-950 text-slate-400"
                }`}
              >
                {isSelected ? (
                  <Film className="h-4 w-4" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
              </div>
              <div className="flex-1 truncate">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold ${isSelected ? "text-amber-400" : "text-slate-400"}`}
                  >
                    {vid.role}
                  </span>
                  <span className="font-mono text-[9px] text-slate-500">
                    {vid.duration}
                  </span>
                </div>
                <strong
                  className={`mt-0.5 block truncate text-xs ${isSelected ? "font-black text-slate-100" : "text-slate-300"}`}
                >
                  {vid.title}
                </strong>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniGameCard({ game }: { game: Game }) {
  const imageUrl = getGameImageUrl(game);
  const rating = getGameRating(game);
  const complexity =
    typeof game.complexity === "number" ? game.complexity : 2.5;

  if (!game.slug) return null;

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-3 transition-all duration-300 hover:border-amber-500/20 hover:bg-slate-800/80"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-700">
        {imageUrl ? (
          <Image src={imageUrl} alt={game.title ?? ""} fill className="object-cover" />
        ) : (
          <div className="h-full w-full bg-slate-950" />
        )}
      </div>
      <div className="truncate">
        <h4 className="truncate text-xs font-bold text-slate-200 transition-colors group-hover:text-amber-400 sm:text-sm">
          {game.title}
        </h4>
        <div className="mt-1 flex items-center gap-2">
          {game.titleEnglish ? (
            <span className="truncate font-mono text-[10px] text-slate-400">
              {game.titleEnglish}
            </span>
          ) : null}
          <span className="flex items-center font-mono text-[10px] text-amber-500">
            ★ {rating.toFixed(1)}
          </span>
        </div>
        <span className="mt-1 block text-[10px] text-slate-500">
          پیچیدگی: {complexity.toFixed(1)} / ۵
        </span>
      </div>
    </Link>
  );
}

function WishlistInline({
  gameSlug,
  gameId,
}: {
  gameSlug: string;
  gameId?: number | string;
}) {
  const [active, setActive] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [mutating, setMutating] = React.useState(false);

  React.useEffect(() => {
    const qs = new URLSearchParams({ gameSlug });
    if (gameId != null) qs.set("gameId", String(gameId));
    fetch(`/api/wishlist?${qs}`)
      .then((r) => r.json())
      .then((j: { active?: boolean }) => setActive(Boolean(j?.active)))
      .finally(() => setLoading(false));
  }, [gameId, gameSlug]);

  async function toggle() {
    setMutating(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug, gameId }),
      });
      if (res.status === 401) {
        window.location.href = `/login?redirect=${encodeURIComponent(`/games/${gameSlug}`)}`;
        return;
      }
      const json = (await res.json()) as { active?: boolean };
      setActive(Boolean(json?.active));
    } finally {
      setMutating(false);
    }
  }

  if (loading) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={mutating}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all duration-300 active:scale-95 ${
        active
          ? "border-rose-500/30 bg-rose-500/10 font-bold text-rose-400"
          : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-rose-400"
      }`}
    >
      <Heart
        className={`h-3.5 w-3.5 ${active ? "fill-rose-500 text-rose-500" : ""}`}
      />
      <span>{active ? "در لیست علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}</span>
    </button>
  );
}

export function GameDetailsView({
  game,
  publisher,
  designerName,
  otherGamesByPublisher,
  similarGames,
}: {
  game: Game;
  publisher: PublisherSummary;
  designerName: string | null;
  otherGamesByPublisher: Game[];
  similarGames: Game[];
}) {
  const slug = game.slug ?? "";
  const gameId = game.id ?? game.documentId;
  const imageUrl = getGameImageUrl(game);
  const rating = getGameRating(game);
  const ratingsCount =
    typeof game.ratingsCount === "number" ? game.ratingsCount : 0;
  const complexity =
    typeof game.complexity === "number" ? game.complexity : 2.5;
  const categories = extractCategoryNames(game);
  const ratings = buildRatingsFromGame(game);
  const description = stripHtml(
    typeof game.description === "string" ? game.description : "",
  );
  const story = stripHtml(typeof game.story === "string" ? game.story : "");

  return (
    <div className="animate-fade-in space-y-8 pb-16" dir="rtl">
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          className="flex items-center gap-1.5 rounded-xl border border-slate-800/80 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 transition-all duration-300 hover:bg-slate-800 hover:text-amber-400"
        >
          <ArrowRight className="ml-0.5 h-4 w-4" />
          <span>بازگشت به بانک بازی‌ها</span>
        </Link>
        {gameId ? (
          <span className="hidden font-mono text-xs tracking-widest text-slate-500 sm:inline">
            GAME ID #: {String(gameId).toUpperCase()}
          </span>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl sm:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl sm:aspect-square">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={game.title ?? "بازی"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-amber-500/20 via-slate-950 to-slate-900" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

              <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-slate-950/90 p-2 px-4 text-slate-100">
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                <div className="text-right">
                  <span className="block text-xs leading-none text-slate-400">
                    نمره سایت
                  </span>
                  <strong className="mt-1 inline-block font-mono text-lg font-black leading-none text-amber-400">
                    {rating.toFixed(1)}
                  </strong>
                  <span className="font-mono text-[10px] text-slate-500">
                    {" "}
                    / ۱۰
                    {ratingsCount > 0 ? ` (${ratingsCount} رای)` : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
                <span className="block text-slate-400">طراح اصلی اثر</span>
                <strong className="mt-1 inline-block text-slate-200">
                  {designerName ?? "نامشخص"}
                </strong>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
                <span className="block text-slate-400">سال انتشار</span>
                <strong className="mt-1 inline-block font-mono text-slate-200">
                  {game.releaseYear ?? "—"}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-6 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                {publisher.name && publisher.slug ? (
                  <Link
                    href={`/publishers/${publisher.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400 transition-all duration-300 hover:bg-amber-500/20"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>محصولی از ناشر: {publisher.name}</span>
                  </Link>
                ) : null}
                <WishlistInline gameSlug={slug} gameId={gameId} />
              </div>

              <h1 className="mt-3 text-2xl font-extrabold leading-tight text-slate-100 sm:text-3xl">
                {game.title ?? "بدون عنوان"}
              </h1>
              {game.titleEnglish ? (
                <span className="mt-1 block font-mono text-sm tracking-wide text-slate-400">
                  {game.titleEnglish}
                </span>
              ) : null}

              {categories.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-[10px] text-amber-400 sm:text-xs"
                    >
                      # {cat}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
                {description ? <p>{description}</p> : null}
                {story ? (
                  <div className="my-4 border-r-2 border-amber-500/40 pr-3">
                    <span className="mb-1 block text-xs font-bold text-amber-500">
                      پیش‌زمینه و داستان تماتیک بازی:
                    </span>
                    <p className="text-xs italic leading-relaxed text-slate-400">
                      {story}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-center md:grid-cols-4">
              <div>
                <span className="block text-[10px] text-slate-400 sm:text-xs">
                  تعداد بازیکنان
                </span>
                <strong className="mt-1 inline-block text-sm font-medium text-slate-200">
                  {formatPlayers(game)}
                </strong>
                {game.bestPlayerCount ? (
                  <span className="block text-[9px] text-amber-500">
                    (بهترین: {game.bestPlayerCount})
                  </span>
                ) : null}
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 sm:text-xs">
                  مدت زمان حدودی
                </span>
                <strong className="mt-1 inline-block text-sm font-medium text-slate-200">
                  {formatPlayTime(game)}
                </strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 sm:text-xs">
                  رده سنی مجاز
                </span>
                <strong className="mt-1 inline-block font-mono text-sm font-medium text-slate-200">
                  {formatAgeRange(game)}
                </strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 sm:text-xs">
                  درجه‌ی سختی
                </span>
                <strong className="mt-1 inline-block font-mono text-sm font-medium text-slate-200">
                  {complexity.toFixed(1)} / ۵
                </strong>
                <span className="block text-[9px] text-slate-500">
                  {getDifficultyLabel(complexity)}
                </span>
              </div>
            </div>

            {game.languageDependency ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-400">
                <span className="font-bold text-slate-300">
                  میزان وابستگی به زبان:
                </span>
                <span>{game.languageDependency}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-slate-850 bg-slate-950 p-1.5">
            <RatingWidget ratings={ratings} />
          </div>

          {publisher.name && publisher.slug ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-500">
                شناسنامه ناشر اثر
              </span>
              <div className="mt-3 flex items-center gap-3">
                {publisher.logoUrl ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-700">
                    <Image
                      src={publisher.logoUrl}
                      alt={publisher.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div>
                  <h4 className="text-xs font-bold text-slate-200 sm:text-sm">
                    {publisher.name}
                  </h4>
                  {(publisher.country || publisher.foundedYear) && (
                    <p className="font-mono text-[10px] text-slate-400">
                      {publisher.country ? `اساس کار: ${publisher.country}` : ""}
                      {publisher.foundedYear
                        ? ` - تاسیس: ${publisher.foundedYear}`
                        : ""}
                    </p>
                  )}
                </div>
              </div>
              {publisher.bio ? (
                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-400">
                  {publisher.bio}
                </p>
              ) : null}
              <Link
                href={`/publishers/${publisher.slug}`}
                className="mt-4 block w-full rounded-xl border border-slate-700/50 bg-slate-800 py-2 text-center text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700"
              >
                مشاهده اطلاعات کامل و سایر بازی‌ها
              </Link>
            </div>
          ) : null}
        </div>

        <div className="space-y-6 lg:col-span-7">
          <GameVideoPlayer gameTitle={game.title ?? "بازی"} videoUrl={game.videoUrl} />
        </div>
      </div>

      {otherGamesByPublisher.length > 0 ? (
        <div className="mt-4 rounded-3xl border border-slate-800/60 bg-slate-900/10 p-6">
          <h3 className="mb-4 inline-flex items-center gap-2 text-base font-bold text-slate-200">
            <span className="h-4 w-1.5 rounded-full bg-amber-500" />
            <span>
              سایر بازی‌های منتشر شده توسط این ناشر ({publisher.name ?? ""})
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {otherGamesByPublisher.map((g) => (
              <MiniGameCard key={g.slug ?? g.id} game={g} />
            ))}
          </div>
        </div>
      ) : null}

      {similarGames.length > 0 ? (
        <div className="mt-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 shadow-sm">
          <h3 className="mb-3 inline-flex items-center gap-2 text-base font-black text-amber-600">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>بوردگیم‌های مشابه پیشنهادی</span>
          </h3>
          <p className="mb-4 text-xs leading-relaxed text-slate-400">
            بر اساس شباهت در دسته‌بندی‌ها، ناشر و میزان سختی، بازی‌های زیر
            پیشنهاد می‌شوند:
          </p>
          <div className="grid grid-cols-1 gap-5 border-t border-slate-800/50 pt-4 sm:grid-cols-3">
            {similarGames.map((g) => (
              <MiniGameCard key={g.slug ?? g.id} game={g} />
            ))}
          </div>
        </div>
      ) : null}

      <CommentSection
        gameSlug={slug}
        gameId={gameId}
        gameTitle={game.title}
      />
    </div>
  );
}
