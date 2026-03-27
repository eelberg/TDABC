"use client";

import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/auth/login-screen";
import { useAuth } from "@/lib/auth/auth-context";
import { es } from "@/lib/i18n/es";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center text-muted-foreground">
        {es.common.loading}
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AppShell />;
}
