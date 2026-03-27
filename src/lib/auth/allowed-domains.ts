/** Correos deben terminar en uno de estos dominios (Microsoft 365 / TVUP). */
export const ALLOWED_EMAIL_DOMAINS = ["tvup.media", "thechannelstore.tv"] as const;

export function isEmailDomainAllowed(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  const at = email.lastIndexOf("@");
  if (at < 0 || at === email.length - 1) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  return (ALLOWED_EMAIL_DOMAINS as readonly string[]).includes(domain);
}
