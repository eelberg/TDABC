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
    case "popup_closed":
      return es.auth.errors.popupClosed;
    case "unauthorized_domain":
      return es.auth.errors.unauthorizedDomain;
    case "operation_not_allowed":
      return es.auth.errors.operationNotAllowed;
    case "network":
      return es.auth.errors.network;
    case "invalid_credential":
      return es.auth.errors.invalidCredential;
    case "oauth_client_id":
      return es.auth.errors.oauthClientId;
    case "no_email":
      return es.auth.errors.noEmail;
    case "generic":
      return es.auth.errors.generic;
    default:
      return null;
  }
}

export function LoginScreen() {
  const { signInWithMicrosoft, authError, authErrorDetail, clearAuthError } = useAuth();
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
          <p className="text-center text-xs text-muted-foreground">{es.auth.signInHint}</p>
          {err ? (
            <div
              role="alert"
              className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              <p>{err}</p>
              {authErrorDetail ? (
                <div className="border-t border-destructive/20 pt-2 text-xs font-normal text-destructive/90">
                  <p className="mb-1 font-medium">{es.auth.errors.errorDetailLabel}</p>
                  <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all font-mono opacity-95">
                    {authErrorDetail}
                  </pre>
                </div>
              ) : null}
            </div>
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
