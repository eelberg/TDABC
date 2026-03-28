"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getAdditionalUserInfo,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";

import { isEmailDomainAllowed } from "@/lib/auth/allowed-domains";
import { createMicrosoftOAuthProvider } from "@/lib/auth/microsoft-provider";
import { formatFirebaseAuthError } from "@/lib/auth/firebase-auth-error";
import { resolveSignInEmailWithRetries } from "@/lib/auth/user-email";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

export type AuthErrorCode =
  | "domain"
  | "not_configured"
  | "popup_blocked"
  | "popup_closed"
  | "unauthorized_domain"
  | "operation_not_allowed"
  | "network"
  | "invalid_credential"
  | "oauth_client_id"
  | "no_email"
  | "generic"
  | null;

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authError: AuthErrorCode;
  /** Mensaje crudo de Firebase (código + texto); copiar al informar incidencias. */
  authErrorDetail: string | null;
  signInWithMicrosoft: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function firebaseErrorMeta(e: unknown): { code?: string; message?: string } {
  if (!e || typeof e !== "object") return {};
  const o = e as { code?: string; message?: string };
  return { code: o.code, message: o.message };
}

function mapFirebaseError(code: string | undefined, message?: string): AuthErrorCode {
  if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
    return "popup_blocked";
  }
  if (code === "auth/popup-closed-by-user") {
    return "popup_closed";
  }
  if (code === "auth/unauthorized-domain") {
    return "unauthorized_domain";
  }
  if (code === "auth/operation-not-allowed") {
    return "operation_not_allowed";
  }
  if (code === "auth/network-request-failed") {
    return "network";
  }
  if (code === "auth/invalid-credential") {
    return "invalid_credential";
  }
  if (code === "auth/invalid-oauth-client-id") {
    return "oauth_client_id";
  }
  if (
    message &&
    /INVALID_IDP_RESPONSE|invalid.?idp|idp.?response/i.test(message)
  ) {
    return "invalid_credential";
  }
  return "generic";
}

function logAuthError(context: string, e: unknown) {
  const { code, message } = firebaseErrorMeta(e);
  console.error(`[auth] ${context}`, code ?? "(no code)", message ?? e);
}

type PendingIdpProfile = {
  uid: string;
  profile: Record<string, unknown> | null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseReady = isFirebaseConfigured();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => firebaseReady);
  const [authError, setAuthError] = useState<AuthErrorCode>(() =>
    firebaseReady ? null : "not_configured",
  );
  const [authErrorDetail, setAuthErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady) {
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      queueMicrotask(() => {
        setLoading(false);
        setAuthError("not_configured");
      });
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let authEventSeq = 0;

    void (async () => {
      let pendingIdp: PendingIdpProfile | null = null;

      try {
        const result = await getRedirectResult(auth);
        if (cancelled) return;
        if (result) {
          const extra = getAdditionalUserInfo(result);
          pendingIdp = {
            uid: result.user.uid,
            profile: extra?.profile ?? null,
          };
        }
        setAuthErrorDetail(null);
        setAuthError(null);
      } catch (e) {
        if (!cancelled) {
          const { code, message } = firebaseErrorMeta(e);
          logAuthError("getRedirectResult", e);
          setAuthErrorDetail(formatFirebaseAuthError(e));
          setAuthError(mapFirebaseError(code, message));
        }
      }

      if (cancelled) return;

      unsubscribe = onAuthStateChanged(auth, async (next) => {
        if (cancelled) return;
        const seq = ++authEventSeq;

        if (!next) {
          pendingIdp = null;
          if (seq !== authEventSeq || cancelled) return;
          setUser(null);
          setLoading(false);
          return;
        }

        let idpProfile: Record<string, unknown> | null | undefined;
        if (pendingIdp && next.uid === pendingIdp.uid) {
          idpProfile = pendingIdp.profile;
        }

        const email = await resolveSignInEmailWithRetries(next, { idpProfile });

        if (seq !== authEventSeq || cancelled) return;

        if (pendingIdp && next.uid === pendingIdp.uid) {
          pendingIdp = null;
        }

        if (!email) {
          console.warn("[auth] Sin email tras OAuth; revisa claims Microsoft / perfil.");
          await signOut(auth);
          if (!cancelled && seq === authEventSeq) {
            setUser(null);
            setAuthError("no_email");
            setLoading(false);
          }
          return;
        }
        if (!isEmailDomainAllowed(email)) {
          await signOut(auth);
          if (!cancelled && seq === authEventSeq) {
            setUser(null);
            setAuthError("domain");
            setLoading(false);
          }
          return;
        }

        if (!cancelled && seq === authEventSeq) {
          setUser(next);
          setLoading(false);
        }
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [firebaseReady]);

  const signInWithMicrosoft = useCallback(async () => {
    setAuthError(null);
    setAuthErrorDetail(null);
    if (!isFirebaseConfigured()) {
      setAuthError("not_configured");
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthError("not_configured");
      return;
    }

    const provider = createMicrosoftOAuthProvider();

    try {
      await signInWithRedirect(auth, provider);
    } catch (e: unknown) {
      const { code, message } = firebaseErrorMeta(e);
      logAuthError("signInWithRedirect", e);
      setAuthErrorDetail(formatFirebaseAuthError(e));
      setAuthError(mapFirebaseError(code, message));
    }
  }, []);

  const signOutUser = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setAuthError(null);
    setAuthErrorDetail(null);
    await signOut(auth);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
    setAuthErrorDetail(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      authErrorDetail,
      signInWithMicrosoft,
      signOutUser,
      clearAuthError,
    }),
    [
      user,
      loading,
      authError,
      authErrorDetail,
      signInWithMicrosoft,
      signOutUser,
      clearAuthError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
