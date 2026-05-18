# Shiplo

A pixel-faithful replica of the Shiplo dashboard modules from Figma file `7d1Ged8LHQYBV9abYhNhxG`. Includes Shipments and Pick and Pack modules in both React and Angular.

## React App (port 5000)

### Stack
- React 18 + TypeScript + Vite (client)
- Express + Drizzle ORM + Postgres (server)
- Tailwind CSS + shadcn/ui components
- Wouter for routing, TanStack Query v5 for data
- Roboto + Montserrat fonts; brand primary `#2B64CB`, secondary teal `#008280`

### Layout
- `client/src/components/AppShell.tsx` — shared shell with collapsible sidebar and content slot.
- `client/src/pages/ShipmentsPage.tsx` — Shipments module. Mounted at `/` and `/shipments`.
- `client/src/pages/OrdersDataGrid.tsx` — wrapper for `PickPackDashboardSection`. Mounted at `/pick-and-pack`.
- `client/src/pages/sections/PickPackDashboardSection.tsx` — Pick and Pack dashboard.
- `client/src/pages/CodeViewerPage.tsx` — Source Code viewer. Mounted at `/code`.
- `client/src/pages/sections/NavigationSidebarSection.tsx` — collapsible sidebar.
- `shared/schema.ts` — shared types.
- `client/src/index.css` — design tokens (HSL custom properties).
- `tailwind.config.ts` — Tailwind color utilities.

### Workflow
- `Start application` runs `npm run dev` (Express + Vite on port 5000).

---

## Angular App (port 4200)

A complete Angular 18 migration of the React app. Lives in `angular-app/` — React project untouched.

### Stack
- Angular 18 standalone components (no NgModules)
- Angular Router with lazy-loaded routes
- Angular Signals for reactive state
- Tailwind CSS 3 with identical design tokens
- TypeScript 5.4
- Roboto + Montserrat + JetBrains Mono fonts

### Folder Structure
```
angular-app/
  src/
    app/
      core/
        models/       shipment.model.ts, pick-pack.model.ts
        services/     shipment.service.ts, pick-pack.service.ts
      layout/
        app-shell/    app-shell.component.{ts,html}
        nav-sidebar/  nav-sidebar.component.{ts,html}
      pages/
        shipments/
          shipment-detail-panel/  (Label, Details w/ Documents + POD, Products, Notes tabs)
          shipments.component.{ts,html}
        pick-and-pack/
          pick-and-pack.component.{ts,html}
        not-found/
          not-found.component.ts
      app.component.ts
      app.config.ts
      app.routes.ts
    styles.scss           (design tokens, Tailwind base)
    index.html
    main.ts
    environments/
      environment.ts
  angular.json
  tsconfig.json
  tailwind.config.js
  postcss.config.js
  package.json
```

### Routes
- `/` → redirects to `/shipments`
- `/shipments` → ShipmentsComponent (lazy loaded)
- `/pick-and-pack` → PickAndPackComponent (lazy loaded)
- `**` → NotFoundComponent

### Workflow
- `Start Angular app` runs `NG_CLI_ANALYTICS=false npx ng serve --port 4200 --host 0.0.0.0 --disable-host-check`

---

## Design Tokens (shared between React and Angular)

- `--status-picking` (`#FFEAC0`) — Picking status pill.
- Shipment status pill tokens: `--status-shipped`, `--status-label-created`, `--status-delayed`, `--status-delivered`, `--status-on-hold`, `--status-needs-review`, `--status-cancelled`. Available as `bg-status-*` Tailwind utilities.

## Conventions

- Every interactive or meaningful element has a stable `data-testid`.
- Forbidden changes: do not edit `package.json`, `vite.config.ts`, `server/vite.ts`, or `drizzle.config.ts`.

## User Preferences

- **Primary codebase is Angular** (`angular-app/`). All future feature requests, fixes, and UI changes must be applied to the Angular app by default.
- The React app (`client/`) is a secondary reference — do not modify it unless the user explicitly asks.
- The main `Start application` workflow runs the Angular app on port 5000.
