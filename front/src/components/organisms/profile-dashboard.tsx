"use client";

import Link from "next/link";
import * as React from "react";

import { useAuth } from "@/components/organisms/auth-provider";

import type { Game } from "@/services/strapi";
import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { GameGrid } from "@/components/organisms/game-grid";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ProfileUser = {
  id: number;
  username?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
};

export type ProfileComment = {
  id: number;
  content: string;
  isApproved: boolean;
  isRejected: boolean;
  createdAt: string | null;
  game: { title: string | undefined; slug: string | undefined } | null;
};

type NotificationType = "reply" | "like" | "dislike";

type LocalNotification = {
  id: string;
  type: NotificationType;
  message: string;
  gameSlug?: string | null;
  createdAt: string;
  read: boolean;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? (parts[1]?.[0] ?? "") : "";
  return (first + second).toUpperCase() || "?";
}

function formatIsoDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function statusBadge(comment: ProfileComment) {
  if (comment.isApproved) return <Badge variant="accent">تایید شده</Badge>;
  if (comment.isRejected) return <Badge variant="amber">رد شده</Badge>;
  return <Badge>در انتظار</Badge>;
}

function notificationsKey(userId: number) {
  return `notifications:${userId}`;
}

function loadNotifications(userId: number): LocalNotification[] {
  try {
    const raw = localStorage.getItem(notificationsKey(userId));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is LocalNotification => {
      return (
        n &&
        typeof n === "object" &&
        typeof (n as Record<string, unknown>)["id"] === "string" &&
        typeof (n as Record<string, unknown>)["type"] === "string" &&
        typeof (n as Record<string, unknown>)["message"] === "string" &&
        typeof (n as Record<string, unknown>)["createdAt"] === "string" &&
        typeof (n as Record<string, unknown>)["read"] === "boolean"
      );
    });
  } catch {
    return [];
  }
}

function saveNotifications(userId: number, list: LocalNotification[]) {
  try {
    localStorage.setItem(notificationsKey(userId), JSON.stringify(list));
  } catch {}
}

function maybeSeedNotifications(userId: number, comments: ProfileComment[]) {
  const existing = loadNotifications(userId);
  if (existing.length > 0) return existing;

  const now = new Date();
  const seeded: LocalNotification[] = comments.slice(0, 3).map((c, idx) => {
    const type: NotificationType =
      idx === 0 ? "like" : idx === 1 ? "reply" : "dislike";
    const msg =
      type === "reply"
        ? "به نظر شما پاسخ داده شد."
        : type === "like"
          ? "نظر شما پسندیده شد."
          : "نظر شما نپسندیده شد.";
    return {
      id: `${userId}-${c.id}-${type}`,
      type,
      message: msg,
      gameSlug: c.game?.slug ?? null,
      createdAt: new Date(now.getTime() - idx * 60_000).toISOString(),
      read: false,
    };
  });

  saveNotifications(userId, seeded);
  return seeded;
}

export function ProfileDashboard({
  user,
  wishlistGames,
  comments,
}: {
  user: ProfileUser;
  wishlistGames: Game[];
  comments: ProfileComment[];
}) {
  const { refresh } = useAuth();
  const [section, setSection] = React.useState<
    "profile" | "wishlist" | "comments" | "notifications" | "security"
  >("profile");
  const [notifications, setNotifications] = React.useState<LocalNotification[]>(
    [],
  );
  const [firstName, setFirstName] = React.useState(user.firstName ?? "");
  const [lastName, setLastName] = React.useState(user.lastName ?? "");
  const [username, setUsername] = React.useState(user.username ?? "");
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = React.useState<string | null>(
    null,
  );
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    const t = setTimeout(() => {
      setNotifications(maybeSeedNotifications(user.id, comments));
    }, 0);
    return () => clearTimeout(t);
  }, [comments, user.id]);

  const unreadCount = notifications.filter(
    (n: LocalNotification) => !n.read,
  ).length;

  function markAsRead(id: string) {
    setNotifications((prev: LocalNotification[]) => {
      const next = prev.map((n: LocalNotification) =>
        n.id === id ? { ...n, read: true } : n,
      );
      saveNotifications(user.id, next);
      return next;
    });
  }

  function markAllAsRead() {
    setNotifications((prev: LocalNotification[]) => {
      const next = prev.map((n: LocalNotification) => ({ ...n, read: true }));
      saveNotifications(user.id, next);
      return next;
    });
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, username }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!res.ok) {
        setProfileError(json?.error ?? "ذخیره پروفایل ناموفق بود.");
        return;
      }

      setProfileSuccess(json?.message ?? "پروفایل با موفقیت به‌روزرسانی شد.");
      await refresh();
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (password.length < 8) {
      setPasswordError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("تکرار رمز عبور با رمز اصلی یکسان نیست.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/password/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!res.ok) {
        setPasswordError(json?.error ?? "ذخیره رمز عبور ناموفق بود.");
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setPasswordSuccess(json?.message ?? "رمز عبور با موفقیت ذخیره شد.");
    } finally {
      setPasswordLoading(false);
    }
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const displayName =
    fullName ||
    user.username ||
    user.phone ||
    user.email ||
    `کاربر #${user.id}`;

  return (
    <div className="flex flex-1 flex-col">
      <Container className="py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-zinc-100">
              {getInitials(displayName)}
            </div>
            <div>
              <Heading className="text-2xl">{displayName}</Heading>
              {user.email ? (
                <div className="mt-1 text-sm text-slate-300">{user.email}</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-1">
            <CardHeader className="text-sm font-semibold text-zinc-100">
              پنل کاربری
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                type="button"
                onClick={() => setSection("profile")}
                className={cn(
                  buttonVariants({
                    variant: section === "profile" ? "default" : "outline",
                    size: "sm",
                  }),
                  "w-full justify-start",
                )}
              >
                اطلاعات کاربری
              </button>
              <button
                type="button"
                onClick={() => setSection("wishlist")}
                className={cn(
                  buttonVariants({
                    variant: section === "wishlist" ? "default" : "outline",
                    size: "sm",
                  }),
                  "w-full justify-start",
                )}
              >
                مورد علاقه
              </button>
              <button
                type="button"
                onClick={() => setSection("comments")}
                className={cn(
                  buttonVariants({
                    variant: section === "comments" ? "default" : "outline",
                    size: "sm",
                  }),
                  "w-full justify-start",
                )}
              >
                نظرات من
              </button>
              <button
                type="button"
                onClick={() => setSection("notifications")}
                className={cn(
                  buttonVariants({
                    variant:
                      section === "notifications" ? "default" : "outline",
                    size: "sm",
                  }),
                  "w-full justify-start gap-2",
                )}
              >
                اعلان‌ها
                {unreadCount > 0 ? (
                  <Badge variant="amber">{unreadCount}</Badge>
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => setSection("security")}
                className={cn(
                  buttonVariants({
                    variant: section === "security" ? "default" : "outline",
                    size: "sm",
                  }),
                  "w-full justify-start",
                )}
              >
                امنیت
              </button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            {section === "profile" ? (
              <div>
                <Heading className="text-xl">اطلاعات کاربری</Heading>
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <form
                      onSubmit={handleProfileSubmit}
                      className="space-y-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm text-slate-300">نام</label>
                          <Input
                            value={firstName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setFirstName(e.target.value)}
                            placeholder="نام"
                            autoComplete="given-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-300">
                            نام خانوادگی
                          </label>
                          <Input
                            value={lastName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setLastName(e.target.value)}
                            placeholder="نام خانوادگی"
                            autoComplete="family-name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">
                          نام کاربری
                        </label>
                        <Input
                          value={username}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => setUsername(e.target.value)}
                          placeholder="نام کاربری"
                          autoComplete="username"
                          dir="ltr"
                          className="text-start"
                        />
                        <p className="text-xs text-slate-500">
                          با نام کاربری می‌توانی با رمز عبور وارد شوی.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">
                          شماره موبایل
                        </label>
                        <Input
                          value={user.phone ?? ""}
                          disabled
                          dir="ltr"
                          className="text-start opacity-70"
                        />
                        <p className="text-xs text-slate-500">
                          شماره موبایل قابل تغییر نیست. برای ورود همیشه
                          می‌توانی از OTP استفاده کنی.
                        </p>
                      </div>

                      {profileError ? (
                        <div className="text-sm text-rose-400">
                          {profileError}
                        </div>
                      ) : null}
                      {profileSuccess ? (
                        <div className="text-sm text-emerald-400">
                          {profileSuccess}
                        </div>
                      ) : null}

                      <Button
                        type="submit"
                        disabled={profileLoading}
                        className="w-full sm:w-auto"
                      >
                        {profileLoading
                          ? "در حال ذخیره..."
                          : "ذخیره اطلاعات"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {section === "wishlist" ? (
              <div>
                <Heading className="text-xl">مورد علاقه</Heading>
                <div className="mt-4">
                  {wishlistGames.length === 0 ? (
                    <Card>
                      <CardContent className="pt-4 text-sm text-slate-300">
                        هنوز بازی‌ای به مورد علاقه اضافه نکرده‌ای.
                      </CardContent>
                    </Card>
                  ) : (
                    <GameGrid games={wishlistGames} />
                  )}
                </div>
              </div>
            ) : null}

            {section === "comments" ? (
              <div>
                <Heading className="text-xl">نظرات من</Heading>
                <div className="mt-4 space-y-3">
                  {comments.length === 0 ? (
                    <Card>
                      <CardContent className="pt-4 text-sm text-slate-300">
                        هنوز نظری ثبت نکرده‌ای.
                      </CardContent>
                    </Card>
                  ) : (
                    comments.map((c) => (
                      <Card key={c.id}>
                        <CardContent className="pt-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-sm text-slate-300">
                              {c.game?.slug ? (
                                <Link
                                  href={`/games/${c.game.slug}`}
                                  className="text-indigo-300 hover:underline"
                                >
                                  {c.game.title ?? c.game.slug}
                                </Link>
                              ) : (
                                <span>{c.game?.title ?? "بازی نامشخص"}</span>
                              )}
                              {c.createdAt ? (
                                <span className="ms-2 text-xs text-slate-500">
                                  {formatIsoDate(c.createdAt)}
                                </span>
                              ) : null}
                            </div>
                            {statusBadge(c)}
                          </div>
                          <div className="mt-3 whitespace-pre-wrap text-sm text-slate-200">
                            {c.content}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {section === "notifications" ? (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <Heading className="text-xl">مرکز اعلان‌ها</Heading>
                  <Button
                    onClick={markAllAsRead}
                    variant="outline"
                    disabled={notifications.length === 0}
                  >
                    همه را خوانده‌شده کن
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {notifications.length === 0 ? (
                    <Card>
                      <CardContent className="pt-4 text-sm text-slate-300">
                        هنوز اعلانی نداری.
                      </CardContent>
                    </Card>
                  ) : (
                    notifications
                      .slice()
                      .sort((a: LocalNotification, b: LocalNotification) =>
                        b.createdAt.localeCompare(a.createdAt),
                      )
                      .map((n: LocalNotification) => (
                        <Card key={n.id} className={n.read ? "opacity-80" : ""}>
                          <CardContent className="pt-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="text-sm text-slate-200">
                                {n.gameSlug ? (
                                  <Link
                                    href={`/games/${n.gameSlug}`}
                                    className="hover:underline"
                                  >
                                    {n.message}
                                  </Link>
                                ) : (
                                  n.message
                                )}
                              </div>
                              {n.read ? (
                                <Badge>خوانده‌شده</Badge>
                              ) : (
                                <Badge variant="amber">جدید</Badge>
                              )}
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <div className="text-xs text-slate-500">
                                {formatIsoDate(n.createdAt)}
                              </div>
                              {!n.read ? (
                                <Button
                                  onClick={() => markAsRead(n.id)}
                                  variant="outline"
                                  size="sm"
                                >
                                  علامت‌گذاری به‌عنوان خوانده‌شده
                                </Button>
                              ) : null}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </div>
            ) : null}

            {section === "security" ? (
              <div>
                <Heading className="text-xl">امنیت حساب</Heading>
                <div className="mt-4 grid gap-4">
                  <Card>
                    <CardHeader className="text-sm font-semibold text-zinc-100">
                      روش‌های ورود
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-300">
                      <div>
                        شماره موبایل:
                        <span className="mr-2 font-bold text-amber-400">
                          {user.phone ?? "نامشخص"}
                        </span>
                      </div>
                      <p className="text-slate-400">
                        با این شماره همیشه می‌توانی با کد OTP وارد شوی. اگر برای
                        ورودهای بعدی رمز عبور هم می‌خواهی، از فرم زیر برای تعیین
                        یا تغییر آن استفاده کن.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="text-sm font-semibold text-zinc-100">
                      تعیین یا تغییر رمز عبور
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handlePasswordSubmit}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-sm text-slate-300">
                            رمز عبور جدید
                          </label>
                          <Input
                            value={password}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setPassword(e.target.value)}
                            type="password"
                            autoComplete="new-password"
                            dir="ltr"
                            className="text-left"
                            placeholder="حداقل ۸ کاراکتر"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-slate-300">
                            تکرار رمز عبور
                          </label>
                          <Input
                            value={confirmPassword}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setConfirmPassword(e.target.value)}
                            type="password"
                            autoComplete="new-password"
                            dir="ltr"
                            className="text-left"
                            placeholder="تکرار رمز عبور"
                          />
                        </div>

                        {passwordError ? (
                          <div className="text-sm text-rose-400">
                            {passwordError}
                          </div>
                        ) : null}
                        {passwordSuccess ? (
                          <div className="text-sm text-emerald-400">
                            {passwordSuccess}
                          </div>
                        ) : null}

                        <Button
                          type="submit"
                          disabled={passwordLoading}
                          className="w-full sm:w-auto"
                        >
                          {passwordLoading
                            ? "در حال ذخیره..."
                            : "ذخیره رمز عبور"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </div>
  );
}
