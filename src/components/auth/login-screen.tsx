"use client";

import { useAuth, type AuthErrorCode } from "@/lib/auth/auth-context";
import { es } from "@/lib/i18n/es";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function errorMessage(code: AuthErrorCode): string | null {
  switch (code) {
    case "domain":
      return es.auth.errors.domain;
    case "not_configured":
      return es.auth.notConfigured;
    case "popup_blocked":
      return es.auth.errors.popupBlocked;
    case "no_email":
      return es.auth.errors.noEmail;
    case "generic":
      return es.auth.errors.generic;
    default:
      return null;
  }
}

export function LoginScreen() {
  const { signInWithMicrosoft, authError, clearAuthError } = useAuth();
  const err = errorMessage(authError);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-border/80 shadow-md">
        <CardHeader className="space-y-1 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {es.shell.kicker}
          </p>
          <CardTitle className="text-2xl">{es.auth.title}</CardTitle>
          <CardDescription className="text-pretty">{es.auth.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {err ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {err}
            </p>
          ) : null}
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              clearAuthError();
              void signInWithMicrosoft();
            }}
          >
            {es.auth.signInMicrosoft}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
