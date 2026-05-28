# Shiplo Frontend

Angular 18 application for the Shiplo shipping dashboard.

## Stack

- Angular 18 standalone components (no NgModules)
- Angular Router with lazy-loaded routes
- Angular Signals for reactive state
- Tailwind CSS 3 + SCSS design tokens
- TypeScript 5.4

## Quick start

```bash
npm install
npm start
```

Dev server: **http://localhost:4200**

For address autocomplete/validation (New Shipment wizard), start the USPS proxy in a second terminal:

```bash
npm run server
```

The dev server proxies `/api` to port 3001 via `proxy.conf.json`.

## Project structure

```
src/app/
  core/          models, services, repositories, API
  layout/        app-shell, nav-sidebar
  pages/         route-level feature pages
  shared/        reusable UI components
public/          static assets (figmaAssets, etc.)
server/          USPS address proxy (dev only)
docs/            UX workflows and test plan
scripts/         feature-sandbox workflow
```

## Routes

| Path | Page |
|------|------|
| `/shipments` | Shipments list + detail panel |
| `/pick-and-pack` | Pick and pack |
| `/inventory` | Inventory catalog |
| `/wallet` | Wallet & transactions |
| `/marketplace` | Integrations marketplace |
| `/settings/automations` | Automation rules |
| `/settings/branded-tracking` | Branded tracking config |
| `/settings/defaults/*` | Packaging, tags, brand assets |
| `/track/preview` | Customer tracking preview (no shell) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server (`ng serve` on port 4200) |
| `npm run build` | Production build → `dist/shiplo-angular` |
| `npm run server` | USPS address proxy on port 3001 |
| `./scripts/feature-sandbox.sh check` | Build gate for feature branches |

## Conventions

- Standalone components only; no NgModules
- Stable `data-testid` on interactive elements
- Design tokens in `src/styles.scss` and `tailwind.config.js`
- Mock/fixture data in `core/fixtures/` and services — not embedded in UI components

## Documentation

- [UX workflows & test plan](docs/ux-workflows-and-test-plan.md)
- [Feature sandbox workflow](.cursor/SANDBOX-WORKFLOW.md)
