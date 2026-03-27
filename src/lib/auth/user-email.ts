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

const PROFILE_EMAIL_KEYS = [
  "email",
  "mail",
  "preferred_username",
  "userPrincipalName",
  "upn",
  "unique_name",
] as const;

function isLikelyEmail(s: string): boolean {
  return s.includes("@") && !s.includes(" ") && s.length < 320;
}

/**
 * Perfil devuelto por `getAdditionalUserInfo(...).profile` tras OAuth; a veces trae UPN/mail
 * cuando Firebase aún no ha rellenado `user.email`.
 */
export function emailFromIdpProfile(
  profile: Record<string, unknown> | null | undefined,
): string | null {
  if (!profile) return null;

  for (const key of PROFILE_EMAIL_KEYS) {
    const v = profile[key];
    if (typeof v === "string" && isLikelyEmail(v)) {
      return v.trim();
    }
  }

  const signInNames = profile.signInNames;
  if (signInNames && typeof signInNames === "object") {
    for (const v of Object.values(signInNames as Record<string, unknown>)) {
      if (typeof v === "string" && isLikelyEmail(v)) {
        return v.trim();
      }
    }
  }

  for (const v of Object.values(profile)) {
    if (typeof v === "string" && isLikelyEmail(v)) {
      return v.trim();
    }
  }

  return null;
}

function emailFromClaims(claims: Record<string, unknown>): string | null {
  for (const key of PROFILE_EMAIL_KEYS) {
    const c = claims[key];
    if (typeof c === "string" && isLikelyEmail(c)) {
      return c.trim();
    }
  }
  for (const v of Object.values(claims)) {
    if (typeof v === "string" && isLikelyEmail(v)) {
      return v.trim();
    }
  }
  return null;
}

export type ResolveSignInEmailOptions = {
  /** Perfil de `getAdditionalUserInfo` justo después de `getRedirectResult`. */
  idpProfile?: Record<string, unknown> | null;
};

/**
 * Tras OAuth redirect, el perfil a veces llega sin email hasta refrescar token o `reload()`.
 * Sin esto, cerraríamos sesión por "no email" y el usuario vería un bucle de login.
 */
export async function resolveSignInEmailAsync(
  user: User,
  options?: ResolveSignInEmailOptions,
): Promise<string | null> {
  const fromIdp = emailFromIdpProfile(options?.idpProfile ?? null);
  if (fromIdp) return fromIdp;

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
