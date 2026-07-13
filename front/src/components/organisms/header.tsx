"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import {
  ArrowLeftRight,
  Award,
  BookOpen,
  Gamepad2,
  Landmark,
  LogOut,
  Menu,
  Search,
  User,
  Users,
  X,
} from "lucide-react";

import { Container } from "@/components/atoms/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/organisms/auth-provider";

const navItems = [
  {
    href: "/",
    label: "صفحه اصلی",
    icon: Gamepad2,
    match: (p: string) => p === "/",
  },
  {
    href: "/games",
    label: "بانک بازی‌ها",
    icon: Users,
    match: (p: string) => p === "/games" || p.startsWith("/games/"),
  },
  {
    href: "/rankings",
    label: "رنکینگ بازی‌ها",
    icon: Award,
    match: (p: string) => p.startsWith("/rankings"),
  },
  {
    href: "/publishers",
    label: "ناشران بازی",
    icon: Landmark,
    match: (p: string) => p.startsWith("/publishers"),
  },
  {
    href: "/articles",
    label: "مقالات و آموزش",
    icon: BookOpen,
    match: (p: string) => p.startsWith("/articles"),
  },
  {
    href: "/compare",
    label: "مقایسه بازی‌ها",
    icon: ArrowLeftRight,
    match: (p: string) => p.startsWith("/compare"),
  },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get("q") ?? "",
  );

  React.useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const loginHref = React.useMemo(() => {
    const redirect = pathname && pathname !== "/" ? pathname : "/";
    return `/login?redirect=${encodeURIComponent(redirect)}`;
  }, [pathname]);

  function handleSearch(value: string) {
    setSearchQuery(value);
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    const qs = params.toString();
    const target = qs ? `/games?${qs}` : "/games";
    if (pathname.startsWith("/games")) {
      router.replace(target);
    } else {
      router.push(target);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 shadow-lg shadow-amber-500/5 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" id="nav-brand">
            <div className="rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 p-2 text-slate-950 shadow-lg shadow-amber-500/30">
              <Gamepad2 className="h-6 w-6 animate-pulse" />
            </div>
            <div className="mr-1 flex flex-col items-start">
              <span className="text-xl font-bold leading-none tracking-tight text-amber-500">
                بوردبرد
              </span>
              <span className="mt-1 font-mono text-[10px] leading-none tracking-widest text-slate-500">
                BOARDBORD.COM
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  id={`nav-tab-${item.href.replace(/\//g, "") || "home"}`}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-300 lg:px-3 lg:text-sm",
                    isActive
                      ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-amber-300",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 lg:h-4 lg:w-4",
                      isActive ? "text-amber-400" : "text-slate-400",
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="absolute right-3 bottom-0 left-3 h-[2px] rounded-full bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="relative w-48 lg:w-56">
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                id="desktop-search-input"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="جستجوی بازی، ناشر..."
                dir="rtl"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-1.5 pr-8 pl-3 text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-all duration-300 hover:border-slate-700 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 border-r border-slate-800 pr-1">
              {loading ? null : user ? (
                <>
                  <Link
                    href="/profile"
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all duration-300",
                      pathname === "/profile"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                        : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-slate-100",
                    )}
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>{user.username ?? "پروفایل"}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    title="خروج از حساب کاربری"
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-1.5 text-slate-400 transition-all hover:border-rose-500/25 hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <Link
                  href={loginHref}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "font-black shadow shadow-amber-500/10 active:scale-95",
                  )}
                >
                  <User className="h-3.5 w-3.5 fill-slate-950" />
                  <span>ورود / عضویت</span>
                </Link>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="منوی اصلی"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </Container>

      {mobileOpen ? (
        <div className="space-y-3 border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 md:hidden">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              id="mobile-search-input"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="جستجو در بوردبرد (boardbord.com)..."
              dir="rtl"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pr-9 pl-3 text-xs text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-3 text-xs font-medium transition-all duration-300",
                    isActive
                      ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                      : "text-slate-300 hover:bg-slate-800/60",
                  )}
                  dir="rtl"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-800/85 pt-3" dir="rtl">
            {loading ? null : user ? (
              <div className="flex w-full items-center justify-between">
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-slate-300 hover:text-amber-400"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold leading-none">
                    {user.username ?? "پروفایل"} (پروفایل)
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <Link
                href={loginHref}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "w-full justify-center font-black",
                )}
              >
                <User className="h-4 w-4 fill-slate-950" />
                <span>ورود / عضویت</span>
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
