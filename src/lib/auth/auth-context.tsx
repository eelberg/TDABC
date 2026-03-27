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
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

import { isEmailDomainAllowed } from "@/lib/auth/allowed-domains";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

export type AuthErrorCode =
  | "domain"
  | "not_configured"
  | "popup_blocked"
  | "no_email"
  | "generic"
  | null;

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authError: AuthErrorCode;
  signInWithMicrosoft: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapFirebaseError(code: string | undefined): AuthErrorCode {
  if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
    return "popup_blocked";
  }
  return "generic";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseReady = isFirebaseConfigured();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => firebaseReady);
  const [authError, setAuthError] = useState<AuthErrorCode>(() =>
    firebaseReady ? null : "not_configured",
  );

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

    const unsub = onAuthStateChanged(auth, async (next) => {
      if (next) {
        const email = next.email;
        if (!email) {
          await signOut(auth);
          setUser(null);
          setAuthError("no_email");
          setLoading(false);
          return;
        }
        if (!isEmailDomainAllowed(email)) {
          await signOut(auth);
          setUser(null);
          setAuthError("domain");
          setLoading(false);
          return;
        }
      }
      setUser(next);
      setLoading(false);
    });

    return () => unsub();
  }, [firebaseReady]);

  const signInWithMicrosoft = useCallback(async () => {
    setAuthError(null);
    if (!isFirebaseConfigured()) {
      setAuthError("not_configured");
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthError("not_configured");
      return;
    }

    const provider = new OAuthProvider("microsoft.com");
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      const code =
        e && typeof e === "object" && "code" in e
          ? String((e as { code?: string }).code)
          : undefined;
      setAuthError(mapFirebaseError(code));
    }
  }, []);

  const signOutUser = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setAuthError(null);
    await signOut(auth);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      signInWithMicrosoft,
      signOutUser,
      clearAuthError,
    }),
    [user, loading, authError, signInWithMicrosoft, signOutUser, clearAuthError],
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
