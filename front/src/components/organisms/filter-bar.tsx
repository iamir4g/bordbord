"use client";

import { cn } from "@/lib/utils";

export function FilterBar({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="sticky top-16 z-30 border-b border-white/10 bg-[#0b1220]/80 backdrop-blur">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="flex gap-2 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {["All", ...categories].map((label) => {
            const isActive = active === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange(label)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "border-indigo-400/30 bg-indigo-500/15 text-indigo-200"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

