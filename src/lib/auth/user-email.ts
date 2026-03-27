import type { User } from "firebase/auth";

/**
 * Microsoft a veces deja `user.email` vacío pero sí envía el correo en `providerData`.
 */
export function resolveSignInEmail(user: User): string | null {
  if (user.email) return user.email;
  for (const p of user.providerData) {
    if (p.email) return p.email;
  }
  return null;
}
