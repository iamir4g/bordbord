"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Container } from "@/components/atoms/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/organisms/auth-provider";

export function Header() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const loginHref = React.useMemo(() => {
    const redirect = pathname && pathname !== "/" ? pathname : "/";
    return `/login?redirect=${encodeURIComponent(redirect)}`;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-100">
          ThinksyGeek
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Games
          </Link>
          {loading ? null : user ? (
            <>
              <Link
                href="/profile"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Logout
              </button>
            </>
          ) : (
            <Link href={loginHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Login
            </Link>
          )}
        </nav>
      </Container>
    </header>
  );
}
