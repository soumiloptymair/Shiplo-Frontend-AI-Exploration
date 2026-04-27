# Shiplo — Pick and Pack

A pixel-faithful replica of the Shiplo Pick and Pack module from Figma file `7d1Ged8LHQYBV9abYhNhxG`.

## Stack

- React 18 + TypeScript + Vite (client)
- Express + Drizzle ORM + Postgres (server)
- Tailwind CSS + shadcn/ui components
- Wouter for routing, TanStack Query v5 for data
- Roboto + Montserrat fonts; brand primary `#2B64CB`, secondary teal `#008280`

## Layout

- `client/src/pages/sections/PickPackDashboardSection.tsx` — main dashboard with Pick Lists table, Shipments table, and right detail panel with three modes (`pickList`, `shipments`, `addShipments`).
- `client/src/index.css` — design tokens (HSL custom properties).
- `tailwind.config.ts` — exposes tokens as Tailwind color utilities.
- `attached_assets/shiplo_design_system_extracted_*.md` — source-of-truth tokens.

## Design tokens (added)

- `--status-picking` (`#FFEAC0`) and `--status-picking-strong` for the Picking status pill in the pick-list detail panel. Available as `bg-status-picking` / `text-status-picking-strong` utilities.

## Dashboard behavior

- `pickPackRows` and `shipmentRows` are React state seeded from `INITIAL_*` constants so that:
  - "Create Pick List" prepends a new row with today's date and the current warehouse, validates ID + picker + selection, blocks case-insensitive duplicate IDs with an inline error, and reassigns selected shipments' `pickListId`.
  - "Add to Pick List" reassigns selected shipments and bumps `totalOrders`.
- Selecting a pick list filters the shipments table to show its shipments first; shipments already assigned to the selected list are visually disabled (grey row + grey checkbox) and not togglable.
- The right panel low-inventory alert is dismissible. Dismissal is reset whenever shipment selection changes (single, select-all, or pick-list switch) so context changes resurface the warning.

## Pick list detail panel

Built to match Figma node `27620-318582`:

1. Optional low-inventory alert (warning soft bg, lists distinct low-inventory product names from the related shipments).
2. ID heading + "Picking" status pill with chevron-down trigger.
3. Inline metadata lines (Picker / Created On / Warehouse).
4. 4-column stats row: Total Orders, Total Shipments, Shipped (`max(0, total-2)`), Remaining (`total - shipped`).
5. Products tab + table (Ext.ID, Name, Qty) with low-inventory triangle next to qty when applicable.
6. Footer shows `Selected Shipments: N` and `Quantity N` (mirrors shipments-mode footer).

## Workflow

- `Start application` runs `npm run dev` (Express + Vite on port 5000).

## Conventions

- Every interactive or meaningful element has a stable `data-testid` (e.g. `button-change-picklist-status`, `stat-total-orders`, `text-picklist-id`).
- Forbidden changes: do not edit `package.json`, `vite.config.ts`, `server/vite.ts`, or `drizzle.config.ts`.
