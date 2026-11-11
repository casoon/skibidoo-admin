# skibidoo-admin

Admin dashboard for Skibidoo, an e-commerce platform. It is a server-rendered Astro application whose pages talk to the Skibidoo API (`skibidoo-core`) from the browser: login over the REST endpoints under `/api/v1/admin/auth`, data over the tRPC endpoint under `/trpc`. The user interface is in German.

## Status

Early work in progress, version 0.1.0, not a finished product.

- 15 commits between 2025-11-29 and 2026-05-17. The last functional changes are from 2026-04-12 (TypeScript fixes, Docker build config, secretlint hook); the last commit on 2026-05-17 only sets `trailingSlash`.
- Products, orders, customers and admin users read and write through the API. The dashboard loads its latest orders and low-stock products from the API, but its stat tiles show hard-coded placeholder numbers.
- The settings pages and the discount codes page are UI only. They work on sample data held in the page, and their save actions wait for a timer and show a notification without calling the API (`settings/index.astro` carries the `TODO: Load from API` and `TODO: Save to API` markers).
- Authentication is client-side only: the access token is kept in `localStorage` and `AdminLayout` redirects to `/login` when it is missing. There is no server-side route guard or middleware.
- `e2e/admin-workflow.spec.ts` contains Playwright tests, but Playwright is not a dependency, and there is no Playwright config and no test script.
- The CI workflow installs with `pnpm install --frozen-lockfile`, while the repository only contains a `package-lock.json`.
- The repository does not show whether the dashboard is deployed or in use anywhere.

## What is in it

| Route | Content | Data source |
| --- | --- | --- |
| `/login` | Email and password login | `POST /api/v1/admin/auth/login` |
| `/` | Dashboard with stat tiles, latest orders, low-stock products | tRPC `order.list`, `product.list`; placeholder numbers for the tiles |
| `/products`, `/products/[id]` | Product list with search and delete, product form | tRPC `product.*`, `category.list`, `tax.listClasses`, `deliveryTime.list` |
| `/orders`, `/orders/[id]` | Order list, order detail with status update | tRPC `order.list`, `order.get`, `order.update` |
| `/customers`, `/customers/[id]` | Customer list, customer detail with groups and orders | tRPC `customer.*`, `order.list` |
| `/users` | Admin users: list, create, edit, delete | tRPC `adminUser.*` |
| `/marketing/discounts` | Discount codes | sample data in the page |
| `/settings`, `/settings/taxes`, `/settings/shipping`, `/settings/payments`, `/settings/emails`, `/settings/legal` | Shop settings | sample data in the page |

Other parts of `src/`:

- `layouts/`: `BaseLayout` (loads HTMX and Alpine.js, defines the Alpine stores), `AdminLayout` (sidebar, header, login redirect), `SettingsLayout` (settings sub-navigation).
- `components/`: `Sidebar`, `Header`, `Notifications`, and three HTMX fragments in `fragments/` (`DataTable`, `ConfirmModal`, `StatsWidget`) that no page imports yet.
- `lib/`: `trpc.ts` (typed tRPC client), `auth.ts` (login, logout, refresh, session check) and `alpine.ts` (Alpine stores with `@alpinejs/persist`). The pages currently do not import `trpc.ts` or `auth.ts`; they call the API with plain `fetch` in inline scripts.

## Stack

- Astro 6 with `output: "server"`
- Cloudflare adapter (`@astrojs/cloudflare`) in `astro.config.mjs`, Node standalone adapter (`@astrojs/node`) in `astro.config.docker.mjs`
- Alpine.js 3 for page state. It is loaded twice: through the `@astrojs/alpinejs` integration with `src/lib/alpine.ts`, and from the unpkg CDN in `BaseLayout`, which defines its own versions of the same stores.
- HTMX 2 from the unpkg CDN (`hx-boost` on the body, used by the fragments)
- Tailwind CSS 4 through `@tailwindcss/vite`, theme in `src/styles/global.css`
- TypeScript, `@trpc/client` and `superjson`
- secretlint as a pre-commit hook via `simple-git-hooks`

## Requirements and setup

- Node.js 24 or newer (`engines` in `package.json`)
- A checkout of `skibidoo-core` next to this repository. `package.json` references it as `@skibidoo/core` with `file:../skibidoo-core`; `src/lib/trpc.ts` imports the `AppRouter` type from it.
- A running Skibidoo API. The default address is `http://localhost:3000`.

```sh
git clone https://github.com/casoon/skibidoo-core.git
git clone https://github.com/casoon/skibidoo-admin.git
cd skibidoo-admin
npm install
cp .env.example .env
npm run dev
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | `astro dev` |
| `npm run build` | `astro build` with the Cloudflare adapter |
| `npm run build:docker` | `astro build` with the Node adapter (`astro.config.docker.mjs`) |
| `npm run preview` | `astro preview` |
| `npm run check` | `astro check` (type check) |
| `npm run secretlint` | Scans the repository for secrets |

There is no lint, test or deploy script.

The `Dockerfile` builds with `npm run build:docker` on `node:24-alpine` and starts `dist/server/entry.mjs` on port 4000. `wrangler.toml` describes a Cloudflare Worker named `skibidoo-admin` with an `ASSETS` binding and a dev port of 4322.

## Configuration

| Name | Where | Purpose |
| --- | --- | --- |
| `PUBLIC_API_URL` | `.env`, `[vars]` in `wrangler.toml` | Base URL of the Skibidoo API. Falls back to `http://localhost:3000`. |
| `ASSETS` | `wrangler.toml` | Static assets binding of the Worker |
| `HOST`, `PORT` | `Dockerfile` | Listen address of the Node build |

The browser stores `admin_token`, `admin_user` and the sidebar state in `localStorage`.

## Related repositories

Skibidoo consists of four repositories under [github.com/casoon](https://github.com/casoon):

- [skibidoo-core](https://github.com/casoon/skibidoo-core): API, workers and scheduler. This dashboard depends on it at runtime (REST auth and tRPC) and at build time (router types).
- [skibidoo-ui](https://github.com/casoon/skibidoo-ui): component library, published as `@casoon/skibidoo-ui`. This dashboard does not use it; its components are written directly with Tailwind classes.
- [skibidoo-storefront](https://github.com/casoon/skibidoo-storefront): shop front end.
- skibidoo-admin: this repository.

## Licence

MIT, see [LICENSE](LICENSE). Copyright (c) 2025 Jörn Seidel.
