# TVUP · TDABC (costeo basado en actividades)

MVP en Next.js App Router para **TDABC** en las unidades de negocio **TVaaS**, **TCS** y **Tivify**. Los datos son de demostración en React Context; la interfaz está en **español**. La hoja de imputación recalcula el PyG al instante.

Repositorio: [github.com/eelberg/TDABC](https://github.com/eelberg/TDABC)

## Stack

- Next.js (App Router), React, TypeScript, Tailwind CSS v4
- [shadcn/ui](https://ui.shadcn.com/) (Base UI)
- [Recharts](https://recharts.org/) y Lucide
- [Firebase Authentication](https://firebase.google.com/docs/auth) con proveedor **Microsoft** y restricción de dominios corporativos

## Ejecución local

```bash
npm install
cp .env.example .env.local
# Rellena .env.local con la configuración de Firebase (ver abajo)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Sin variables de Firebase, verás un aviso en la pantalla de inicio de sesión.

## Autenticación (Firebase + Microsoft 365)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/), habilita **Authentication** → **Sign-in method** → **Microsoft** y guarda el **Application (client) ID** y el **Client secret** que te pide.
2. En [Microsoft Entra ID](https://entra.microsoft.com/) (Azure Portal) registra una aplicación y añade la **URI de redirección** que indica la [documentación oficial de Firebase para Microsoft](https://firebase.google.com/docs/auth/web/microsoft-oauth) (suele ser `https://<tu-proyecto>.firebaseapp.com/__/auth/handler`).
3. En Firebase → **Authentication** → **Settings** → **Authorized domains**, incluye `localhost` y el dominio de producción de **Vercel** (y `*.vercel.app` si usas previews).
4. Copia las claves del proyecto desde **Project settings** → **Your apps** (SDK snippet) a `.env.local` usando los nombres de [`.env.example`](.env.example).

**Dominios de correo permitidos** (tras el login, la app valida el email): `tvup.media` y `thechannelstore.tv`. La lógica está en [`src/lib/auth/allowed-domains.ts`](src/lib/auth/allowed-domains.ts).

El inicio de sesión usa **redirección completa** (`signInWithRedirect`), no ventana emergente, para evitar problemas con políticas del navegador (p. ej. COOP) en producción.

**Entra: una sola plataforma Web** — Microsoft **no permite** registrar la misma URI como Web y SPA a la vez. Es correcto dejar **solo Web** con `https://<project-id>.firebaseapp.com/__/auth/handler`. Los checkboxes de *implicit grant* (ID tokens) **no suelen ser necesarios** para Firebase; puedes dejarlos desmarcados.

**App "Solo mi organización"** — Si sigues viendo `400` / `signInWithIdp`, define en `.env.local` y en Vercel el **Directory (tenant) ID** de tu tenant (Entra → **Overview** del tenant o de la aplicación; es un GUID):

`NEXT_PUBLIC_MICROSOFT_TENANT_ID=<tu-tenant-id>`

La app lo envía como parámetro `tenant` en el OAuth de Microsoft (recomendado por Microsoft para inquilinos únicos). Vuelve a desplegar en Vercel tras añadir la variable.

**API permissions** — En el registro TDABC: **API permissions** → Microsoft Graph → *Delegated*: `openid`, `profile`, `email`, `User.Read` (a menudo ya vienen). **Grant admin consent** para el tenant si hace falta.

### Si en la consola ves `400` en `accounts:signInWithIdp`

Eso significa que Firebase no acepta la respuesta de Microsoft. Lo más habitual:

- **Client secret caducado o incorrecto** en Firebase (Authentication → Microsoft). En Entra: **Certificates & secrets** → crea un *New client secret*, cópialo en Firebase (el **Value**, no el Secret ID).
- **Application (client) ID** distinto entre Entra y Firebase.
- En Entra → **Authentication**, la **Redirect URI** en plataforma **Web** debe coincidir exactamente con la URL de Firebase (`https://<project-id>.firebaseapp.com/__/auth/handler`). No hace falta duplicarla en SPA (Entra no lo permite en muchos casos).
- Prueba **`NEXT_PUBLIC_MICROSOFT_TENANT_ID`** (ver arriba) si la app es de un solo tenant.

Tras cambiar el secreto en Firebase, prueba de nuevo (sin redesplegar Vercel salvo que solo toques la consola).

### Clave de API de Google Cloud con restricción por referrer

Si en [Google Cloud Console](https://console.cloud.google.com/) (elige el **mismo proyecto** que Firebase) → **APIs y servicios** → **Credenciales** la **clave de API del navegador** tiene restricción **Referrers HTTP**, deben existir referrers como:

- `https://tdabc.vercel.app/*` (o tu dominio real)
- `https://<project-id>.firebaseapp.com/*`
- `http://localhost:*/*` (desarrollo)

Si falta el dominio desde el que cargas la app, las llamadas a Identity Toolkit pueden fallar con `400` / `signInWithIdp`. También comprueba que la API **Identity Toolkit API** no esté bloqueada para esa clave.

La pantalla de login muestra ahora un **detalle técnico** copiable cuando Firebase devuelve error: úsalo para acotar la causa.

## Despliegue en Vercel

1. Importa el repositorio en [Vercel](https://vercel.com/new) con el preset **Next.js**.
2. En **Settings → Environment Variables**, define las mismas variables `NEXT_PUBLIC_FIREBASE_*` que en `.env.local` para *Production* (y *Preview* si quieres OAuth en ramas).
3. Añade el dominio de despliegue en **Authorized domains** de Firebase.

El hosting principal sigue siendo **Vercel**; Firebase se usa aquí solo para **Auth** (más adelante puedes añadir Firestore u otros servicios).

## Estructura del código

| Área | Ruta |
| --- | --- |
| Tipos y datos mock | [`src/lib/types.ts`](src/lib/types.ts), [`src/lib/mock-data.ts`](src/lib/mock-data.ts) |
| Motor TDABC | [`src/lib/cost-engine.ts`](src/lib/cost-engine.ts) |
| Estado ABC | [`src/lib/abc-context.tsx`](src/lib/abc-context.tsx) |
| Cadenas ES | [`src/lib/i18n/es.ts`](src/lib/i18n/es.ts) |
| Firebase (cliente) | [`src/lib/firebase/client.ts`](src/lib/firebase/client.ts) |
| Auth y dominios | [`src/lib/auth/auth-context.tsx`](src/lib/auth/auth-context.tsx) |
| UI | [`src/components/app-shell.tsx`](src/components/app-shell.tsx), pestañas y [`src/components/auth/login-screen.tsx`](src/components/auth/login-screen.tsx) |

## Más información

- [Next.js — despliegue](https://nextjs.org/docs/app/building-your-application/deploying)
- [Firebase Auth — Microsoft](https://firebase.google.com/docs/auth/web/microsoft-oauth)
