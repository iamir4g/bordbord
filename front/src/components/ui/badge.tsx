import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/5 text-zinc-100",
        accent: "border-indigo-400/20 bg-indigo-500/15 text-indigo-200",
        amber: "border-amber-400/20 bg-amber-500/15 text-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
