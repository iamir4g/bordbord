import { cn } from "@/lib/utils";

export function ComplexityMeter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const level = Math.max(1, Math.min(5, Math.round(value)));

  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`Complexity: ${level} out of 5`}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className={cn(
            "h-1.5 w-5 rounded-full",
            idx < level ? "bg-indigo-400/80" : "bg-white/10"
          )}
        />
      ))}
    </div>
  );
}

