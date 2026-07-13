import Image from "next/image";

import { getStrapiMediaUrl } from "@/services/strapi";
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

function extractImageUrls(images: unknown) {
  const data = getNested(images, ["data"]);
  const list = Array.isArray(data) ? data : Array.isArray(images) ? images : [];

  return list
    .map((e) => getNested(e, ["attributes", "url"]) ?? getNested(e, ["url"]))
    .filter((v): v is string => typeof v === "string")
    .map((u) => getStrapiMediaUrl(u))
    .filter((u): u is string => typeof u === "string");
}

export function GameGallery({
  title,
  images,
  className,
}: {
  title: string;
  images: unknown;
  className?: string;
}) {
  const urls = extractImageUrls(images);
  const main = urls[0] ?? null;
  const thumbs = urls.slice(1, 5);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {main ? (
          <Image src={main} alt={title} fill className="object-cover" priority />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-500/20 via-slate-950 to-amber-500/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {thumbs.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {thumbs.map((u) => (
            <div
              key={u}
              className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <Image src={u} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

