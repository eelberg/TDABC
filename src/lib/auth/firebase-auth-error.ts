/**
 * Texto legible del error de Firebase Auth (para depuración en pantalla).
 */
export function formatFirebaseAuthError(e: unknown): string {
  if (e == null) return "";
  if (typeof e === "string") return e;
  if (typeof e !== "object") return String(e);
  const o = e as {
    code?: string;
    message?: string;
    customData?: { _serverResponse?: unknown };
  };
  const parts: string[] = [];
  if (o.code) parts.push(o.code);
  if (o.message) parts.push(o.message);
  const sr = o.customData?._serverResponse;
  if (sr != null) {
    try {
      parts.push(typeof sr === "string" ? sr : JSON.stringify(sr));
    } catch {
      parts.push(String(sr));
    }
  }
  return parts.join(" — ") || String(e);
}
