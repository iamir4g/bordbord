import * as React from "react";

import { cn } from "@/lib/utils";

export function Heading({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-2xl font-semibold tracking-tight text-zinc-100",
        className,
      )}
      {...props}
    />
  );
}
