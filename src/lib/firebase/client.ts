import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  initializeAuth,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cachedAuth: Auth | null = null;
let cachedAuthAppName: string | null = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

/**
 * Persistencia en IndexedDB desde la creación de Auth. Con `initializeAuth` hay que pasar
 * `browserPopupRedirectResolver`; si no, `signInWithRedirect` / `getRedirectResult` fallan con
 * `auth/argument-error` (`getAuth` lo inyecta por defecto).
 */
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;

  const appName = app.name;
  if (cachedAuth && cachedAuthAppName === appName) {
    return cachedAuth;
  }

  try {
    cachedAuth = initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (e: unknown) {
    const code =
      e && typeof e === "object" && "code" in e ? String((e as { code: unknown }).code) : "";
    if (code === "auth/already-initialized") {
      cachedAuth = getAuth(app);
    } else {
      throw e;
    }
  }
  cachedAuthAppName = appName;
  return cachedAuth;
}

/** Mismo resolver que `initializeAuth`; pasarlo explícito a redirect evita fallos silenciosos en algunos entornos. */
export { browserPopupRedirectResolver };
