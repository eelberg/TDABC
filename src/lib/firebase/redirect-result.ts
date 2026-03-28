import {
  browserPopupRedirectResolver,
  getRedirectResult,
  type Auth,
  type UserCredential,
} from "firebase/auth";

let inFlight: Promise<UserCredential | null> | null = null;

/**
 * Una sola llamada a `getRedirectResult` por oleada de redirección. Varios `await` comparten la misma
 * promesa (Strict Mode, doble montaje) y tras resolver se puede volver a llamar en la misma página.
 */
export function consumeGetRedirectResult(auth: Auth): Promise<UserCredential | null> {
  if (!inFlight) {
    inFlight = getRedirectResult(auth, browserPopupRedirectResolver).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}
