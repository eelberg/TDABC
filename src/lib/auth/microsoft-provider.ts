import { OAuthProvider } from "firebase/auth";

/**
 * Proveedor Microsoft para Firebase Auth.
 * Con apps Entra "solo mi organización", conviene fijar el tenant (GUID o dominio)
 * vía NEXT_PUBLIC_MICROSOFT_TENANT_ID para que el emisor del token coincida con lo que espera Firebase.
 */
export function createMicrosoftOAuthProvider(): OAuthProvider {
  const provider = new OAuthProvider("microsoft.com");
  provider.addScope("openid");
  provider.addScope("profile");
  provider.addScope("email");

  const tenantId = process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID?.trim();
  const params: Record<string, string> = {};
  if (tenantId) {
    params.tenant = tenantId;
  }
  // No forzar `prompt=select_account`: en algunos tenants provoca bucle en la pantalla de Microsoft.
  if (Object.keys(params).length > 0) {
    provider.setCustomParameters(params);
  }
  return provider;
}
