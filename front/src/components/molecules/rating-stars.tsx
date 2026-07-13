import { cn } from "@/lib/utils";

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={cn("h-4 w-4", className)} aria-hidden="true">
      <path d="M10 1.5l2.7 5.47 6.04.88-4.37 4.26 1.03 6.01L10 15.96 4.6 18.18l1.03-6.01L1.26 7.85l6.04-.88L10 1.5z" />
    </svg>
  );
}

export function RatingStars({ rating }: { rating: number }) {
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.5;

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${clamped.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const isFull = idx < full;
        const isHalf = idx === full && hasHalf;
        return (
          <div key={idx} className="relative">
            <Star className="text-white/15" />
            {(isFull || isHalf) && (
              <div className={cn("absolute inset-0 overflow-hidden", isHalf ? "w-1/2" : "w-full")}>
                <Star className="text-amber-300" />
              </div>
            )}
          </div>
        );
      })}
      <div className="ml-2 text-xs text-slate-300">{clamped.toFixed(1)}</div>
    </div>
  );
}

