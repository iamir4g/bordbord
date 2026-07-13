"use client";

import * as React from "react";

import { AuthProvider } from "@/components/organisms/auth-provider";
import { Header } from "@/components/organisms/header";
import { PageTransition } from "@/components/organisms/page-transition";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </AuthProvider>
  );
}
