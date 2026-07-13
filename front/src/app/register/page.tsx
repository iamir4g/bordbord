"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Container } from "@/components/atoms/container";
import { Heading } from "@/components/atoms/heading";
import { useAuth } from "@/components/organisms/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();

  const redirectTo = searchParams.get("redirect") ?? "/";

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(json?.error ?? "Registration failed.");
        return;
      }

      await refresh();
      router.push(redirectTo);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Container className="py-10">
        <div className="mx-auto w-full max-w-md">
          <Heading className="text-2xl">Register</Heading>
          <div className="mt-2 text-sm text-slate-300">
            Already have an account?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-indigo-300 hover:underline">
              Sign in
            </Link>
            .
          </div>

          <Card className="mt-6">
            <CardHeader className="text-sm font-semibold text-zinc-100">
              Create account
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-200">Username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    placeholder="thinksygeek"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-200">Email</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-200">Password</label>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {error ? (
                  <div className="text-sm text-amber-200">{error}</div>
                ) : null}

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Creating…" : "Create account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}

