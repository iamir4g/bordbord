import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

import type { Article } from "@/services/strapi";
import { getCoverImageUrl } from "@/lib/strapi-helpers";

export function ArticleCard({ article }: { article: Article }) {
  const coverUrl = getCoverImageUrl(article.coverImage);
  const href = article.slug ? `/articles/${article.slug}` : "/articles";

  return (
    <Link
      href={href}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md transition-all duration-300 hover:border-amber-500/20 hover:shadow-xl"
    >
      <div className="relative aspect-video shrink-0 overflow-hidden bg-slate-950">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={article.title ?? "مقاله"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-500/20 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85" />
        {article.category ? (
          <span className="absolute bottom-2 right-2 rounded-md bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-slate-950">
            {article.category}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4 text-right">
        <div>
          <div className="mb-2 flex items-center gap-3 text-[10px] text-slate-400">
            {article.publishedDate ? (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{article.publishedDate}</span>
              </span>
            ) : null}
            {article.readTime ? (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{article.readTime}</span>
                </span>
              </>
            ) : null}
          </div>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-100 transition-colors group-hover:text-amber-400 sm:text-base">
            {article.title}
          </h3>
          {article.brief ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
              {article.brief}
            </p>
          ) : null}
        </div>
        <div className="mt-4 border-t border-slate-800/80 pt-3 text-[10px] text-slate-300">
          {article.author ?? "بوردبرد"}
        </div>
      </div>
    </Link>
  );
}
