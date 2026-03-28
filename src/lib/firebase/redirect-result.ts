import {
  browserPopupRedirectResolver,
  getRedirectResult,
  type Auth,
  type UserCredential,
} from "firebase/auth";

let cached: Promise<UserCredential | null> | null = null;

/**
 * Una sola promesa de `getRedirectResult` por carga de página. No resetear tras resolver: un segundo
 * `getRedirectResult` en la misma carga devolvería null (URL ya consumida) y rompería el flujo.
 */
export function consumeGetRedirectResult(auth: Auth): Promise<UserCredential | null> {
  if (!cached) {
    cached = getRedirectResult(auth, browserPopupRedirectResolver).catch((e) => {
      cached = null;
      throw e;
    });
  }
  return cached;
}
