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
