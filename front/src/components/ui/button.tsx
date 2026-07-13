import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/10 hover:from-amber-400 hover:to-amber-500",
        amber:
          "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30",
        outline:
          "border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-amber-500/30 hover:text-amber-400",
        ghost:
          "text-slate-300 hover:bg-slate-800/60 hover:text-amber-300",
        danger:
          "border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
