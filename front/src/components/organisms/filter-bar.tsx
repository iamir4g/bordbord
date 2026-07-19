"use client";

import { cn } from "@/lib/utils";

type CategoryOption = {
  name: string;
  slug: string;
};

export function FilterBar({
  categories,
  activeCategories,
  onChange,
}: {
  categories: CategoryOption[];
  activeCategories: string[];
  onChange: (category: string) => void;
}) {
  return (
    <div className="sticky top-16 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { label: "همه", value: "همه" },
            ...categories.map((category) => ({
              label: category.name,
              value: category.slug,
            })),
          ].map((item) => {
            const isActive =
              item.value === "همه"
                ? activeCategories.length === 0
                : activeCategories.includes(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onChange(item.value)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300",
                  isActive
                    ? "border-amber-500/30 bg-amber-500/15 text-amber-400"
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-amber-500/20 hover:text-amber-300",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
