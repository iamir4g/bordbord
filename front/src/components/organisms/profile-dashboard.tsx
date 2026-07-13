"use client";

import Link from "next/link";
import * as React from "react";

import type { Game } from "@/services/strapi";
import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { GameGrid } from "@/components/organisms/game-grid";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ProfileUser = {
  id: number;
  username?: string;
  email?: string;
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
  if (comment.isApproved) return <Badge variant="accent">Approved</Badge>;
  if (comment.isRejected) return <Badge variant="amber">Rejected</Badge>;
  return <Badge>Pending</Badge>;
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
        ? "Someone replied to your comment."
        : type === "like"
          ? "Someone liked your comment."
          : "Someone disliked your comment.";
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
  const [section, setSection] = React.useState<
    "wishlist" | "comments" | "notifications"
  >("wishlist");
  const [notifications, setNotifications] = React.useState<LocalNotification[]>(
    [],
  );

  React.useEffect(() => {
    const t = setTimeout(() => {
      setNotifications(maybeSeedNotifications(user.id, comments));
    }, 0);
    return () => clearTimeout(t);
  }, [comments, user.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAsRead(id: string) {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(user.id, next);
      return next;
    });
  }

  function markAllAsRead() {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(user.id, next);
      return next;
    });
  }

  const displayName = user.username ?? user.email ?? `User #${user.id}`;

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
              Dashboard
            </CardHeader>
            <CardContent className="space-y-2">
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
                My Wishlist
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
                My Comments
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
                Notifications
                {unreadCount > 0 ? (
                  <Badge variant="amber">{unreadCount}</Badge>
                ) : null}
              </button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            {section === "wishlist" ? (
              <div>
                <Heading className="text-xl">My Wishlist</Heading>
                <div className="mt-4">
                  {wishlistGames.length === 0 ? (
                    <Card>
                      <CardContent className="pt-4 text-sm text-slate-300">
                        Your wishlist is empty.
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
                <Heading className="text-xl">My Comments</Heading>
                <div className="mt-4 space-y-3">
                  {comments.length === 0 ? (
                    <Card>
                      <CardContent className="pt-4 text-sm text-slate-300">
                        No comments yet.
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
                                <span>{c.game?.title ?? "Unknown game"}</span>
                              )}
                              {c.createdAt ? (
                                <span className="ml-2 text-xs text-slate-500">
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
                  <Heading className="text-xl">Notification Center</Heading>
                  <Button
                    onClick={markAllAsRead}
                    variant="outline"
                    disabled={notifications.length === 0}
                  >
                    Mark all as read
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {notifications.length === 0 ? (
                    <Card>
                      <CardContent className="pt-4 text-sm text-slate-300">
                        No notifications yet.
                      </CardContent>
                    </Card>
                  ) : (
                    notifications
                      .slice()
                      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                      .map((n) => (
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
                                <Badge>Read</Badge>
                              ) : (
                                <Badge variant="amber">Unread</Badge>
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
                                  Mark as read
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
          </div>
        </div>
      </Container>
    </div>
  );
}
