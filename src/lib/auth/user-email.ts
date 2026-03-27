import { getIdTokenResult, type User } from "firebase/auth";

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

function emailFromClaims(claims: Record<string, unknown>): string | null {
  const candidates = [
    claims.email,
    claims.preferred_username,
    claims.upn,
    claims.unique_name,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.includes("@")) {
      return c.trim();
    }
  }
  return null;
}

/**
 * Tras OAuth redirect, el perfil a veces llega sin email hasta refrescar token o `reload()`.
 * Sin esto, cerraríamos sesión por "no email" y el usuario vería un bucle de login.
 */
export async function resolveSignInEmailAsync(user: User): Promise<string | null> {
  let email = resolveSignInEmail(user);
  if (email) return email;

  try {
    const { claims } = await getIdTokenResult(user, false);
    email = emailFromClaims(claims as Record<string, unknown>);
    if (email) return email;
  } catch {
    /* seguir */
  }

  try {
    await user.reload();
  } catch {
    /* seguir */
  }

  email = resolveSignInEmail(user);
  if (email) return email;

  try {
    const { claims } = await getIdTokenResult(user, true);
    return emailFromClaims(claims as Record<string, unknown>);
  } catch {
    return null;
  }
}
