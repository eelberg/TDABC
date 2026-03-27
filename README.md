# TVUP · Time-driven ABC (TDABC)

Next.js App Router MVP for **time-driven activity-based costing** across TVUP business units: **TVaaS**, **TCS**, and **Tivify**. State is mock-only and held in React Context so edits in the timesheet recalculate the P&amp;L immediately.

## Stack

- Next.js (App Router), React, TypeScript, Tailwind CSS v4
- [shadcn/ui](https://ui.shadcn.com/) (Base UI primitives)
- [Recharts](https://recharts.org/) and Lucide icons

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

| Area | Path |
| --- | --- |
| Domain types &amp; mock data | [`src/lib/types.ts`](src/lib/types.ts), [`src/lib/mock-data.ts`](src/lib/mock-data.ts) |
| Pure TDABC math | [`src/lib/cost-engine.ts`](src/lib/cost-engine.ts) |
| App state | [`src/lib/abc-context.tsx`](src/lib/abc-context.tsx) |
| UI tabs | [`src/components/app-shell.tsx`](src/components/app-shell.tsx), `team-table`, `time-allocator`, `drivers-table`, `pl-dashboard` |

## Deploy on Vercel

1. Push this folder to a Git repository.
2. In [Vercel](https://vercel.com/new), import the repo and use the default **Next.js** preset.
3. Build command: `next build`; output: Next.js managed automatically.

No environment variables are required for the mock MVP.

## Firebase (optional, next steps)

A common setup is **Vercel for hosting** the Next.js app and **Firebase** for persistence or auth later (Firestore to replace in-memory Context, Firebase Auth for roles, Analytics). This repo does not include Firebase SDK wiring yet; add `firebase` / `firebase-admin` when you are ready to sync state.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Next.js deployment](https://nextjs.org/docs/app/building-your-application/deploying)
