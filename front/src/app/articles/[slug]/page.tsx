import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronLeft, Clock } from "lucide-react";

import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getArticleBySlug, getArticles, getStrapiMediaUrl } from "@/services/strapi";

function getCoverUrl(article: { coverImage?: unknown }) {
  const rel = article.coverImage as unknown;
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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const all = await getArticles().catch(() => []);
  const related = all.filter((a) => a.slug !== slug).slice(0, 2);
  const coverUrl = getCoverUrl(article);
  const content =
    typeof article.content === "string"
      ? article.content.replace(/<[^>]*>/g, "")
      : "";

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <Container className="py-8">
        <Link
          href="/articles"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>بازگشت به مقالات</span>
        </Link>

        {coverUrl ? (
          <div className="relative mt-6 aspect-[21/9] overflow-hidden rounded-3xl border border-slate-800">
            <Image
              src={coverUrl}
              alt={article.title ?? "مقاله"}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          </div>
        ) : null}

        <div className="mt-8 max-w-3xl text-right">
          {article.category ? (
            <span className="inline-block rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-400">
              {article.category}
            </span>
          ) : null}

          <Heading className="mt-4 text-2xl text-slate-100 sm:text-3xl">
            {article.title}
          </Heading>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {article.author ? <span>نویسنده: {article.author}</span> : null}
            {article.publishedDate ? (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {article.publishedDate}
              </span>
            ) : null}
            {article.readTime ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime}
              </span>
            ) : null}
          </div>

          {article.brief ? (
            <p className="mt-6 text-sm leading-7 text-slate-300">{article.brief}</p>
          ) : null}

          {content ? (
            <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-sm leading-8 text-slate-300">
              {content}
            </div>
          ) : null}
        </div>

        {related.length > 0 ? (
          <div className="mt-12">
            <Heading className="text-lg text-slate-100">مقالات پیشنهادی</Heading>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/articles/${item.slug}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-amber-500/30"
                >
                  <div className="font-bold text-slate-100 hover:text-amber-400">
                    {item.title}
                  </div>
                  {item.brief ? (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                      {item.brief}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
