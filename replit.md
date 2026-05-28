# Shiplo

Angular 18 frontend for the Shiplo shipping dashboard (Figma file `7d1Ged8LHQYBV9abYhNhxG` and related frames).

## Stack

- Angular 18 standalone components
- Angular Router with lazy-loaded routes
- Angular Signals for reactive state
- Tailwind CSS 3 + SCSS design tokens
- TypeScript 5.4
- Roboto + Montserrat fonts; brand primary `#2B64CB`, secondary teal `#008280`

## Layout

```
src/app/
  core/           models, services, fixtures
  layout/         app-shell, nav-sidebar
  pages/          feature pages (shipments, inventory, wallet, etc.)
  shared/         reusable components (toast, status-pill, color-picker, …)
```

Design tokens: `src/styles.scss`, `tailwind.config.js`

## Routes

- `/` → redirects to `/shipments`
- `/shipments`, `/pick-and-pack`, `/inventory`, `/wallet`, `/marketplace`
- `/settings/automations`, `/settings/branded-tracking`, `/settings/defaults/*`
- `/track/preview` — customer tracking preview (no app shell)
- `**` → NotFoundComponent

## Dev workflow

The **Start application** workflow runs:

1. USPS address proxy (`server/index.mjs`) on port 3001
2. Angular dev server on port 5000 with `proxy.conf.json`

From repo root: `npm install && npm start`

## Conventions

- Every interactive or meaningful element has a stable `data-testid`.
- All UI work belongs in `src/app/`.
- Mock data lives in services/fixtures, not inside presentation components.

## Figma MCP guardrails

- Always fetch a screenshot before generating code from Figma.
- Prefer `getDesignContext` over `getMetadata` for design-to-code work.
- Reconcile Figma output with existing design tokens and shared Angular components in `src/app/shared/`.
