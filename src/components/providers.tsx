"use client";

import type { ReactNode } from "react";

import { AbcProvider } from "@/lib/abc-context";
import { AuthProvider } from "@/lib/auth/auth-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AbcProvider>{children}</AbcProvider>
    </AuthProvider>
  );
}
