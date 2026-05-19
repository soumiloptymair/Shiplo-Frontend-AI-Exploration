# Design Tokens Changelog

## 2026-05-19 — Merge Shipments capability (Figma file `unEpC0FcuWKbB5yO1m7OyX` / section `23011:103329`)

### Added (model + components + service method, no new tokens)
- `core/models/shipment.model.ts` — new `MergeRecommendation` interface (`peerCount`, `destination`, `savings`) and new `Shipment` fields: `destinationZip?`, `mergeRecommendation?`, `isMerged?`, `originalIds?`. Seeded **two mergeable pairs**: `s-15`+`s-17` (Carter, Mike, ZIP `73928`) and `s-18`+`s-19` (Carter, Mike, ZIP `30303` — different warehouses, so the modal's keep-warehouse radio has real choices). `s-15` also carries an explicit `mergeRecommendation` so the banner can use the seeded copy/savings string.
- `core/services/shipment.service.ts` — `mergeCandidatesFor(id)`: same customer + same `destinationZip`, compatible status (excludes Cancelled/Delivered/Delayed + already split/merged rows). `mergeShipments(sourceIds, keptWarehouse?)`: validates `keptWarehouse` is one of the source warehouses (falls back to the first source's), de-dupes products by SKU summing qty, replaces the first source row in place with one combined row (`shipmentId` suffixed `(merged)`, `orderRefKind: 'combined'`, `combinedCount`, status reset to `Pending`, value recomputed, kept warehouse applied), removes other sources, adds the new id to `selectedIds`, closes the side panel. `splitShipment` was updated to clear `isMerged` + `originalIds` + `mergeRecommendation` on children so badge state stays mutually exclusive when splitting a previously-merged row.
- `pages/shipments/merge-recommendation-banner` — peach `#FDE2D4` banner mirroring the split banner. Accepts a live `peerCount` + `destination` so the panel can drive it off `mergeCandidatesFor`; the optional pre-seeded `recommendation` only customizes the savings copy. Dismissal is session-scoped per shipment id.
- `pages/shipments/merge-shipment-modal` — 1024×680 dialog with the spec'd structure: **left summary pane** (destination, kept-warehouse radio group derived from the union of selected sources, and a teal-bordered "Merged preview" card showing the live de-duped product list with total qty + value + selected warehouse); **right scrollable list of source cards** each with a checkbox to include/exclude (primary is checked + locked; uncheck disabled at minimum 2). Confirm emits `{ sourceIds, keptWarehouse }` and is disabled when either constraint is unmet.
- `pages/shipments/shipment-detail-panel` — kebab menu gains "Merge Shipments" above Edit Shipment. The merge banner is **live** — it appears for any shipment with ≥1 eligible peer (not only seeded ones); destination text falls back to `ZIP {destinationZip}` when no `mergeRecommendation` is present. `confirmMerge` forwards the kept warehouse to the service and toasts `Shipments merged into {newId}`. Banner/candidates implemented as plain getters (not `computed`) so they re-evaluate when the parent swaps the `@Input` shipment.
- `pages/shipments/shipments.component.ts/html` — the existing 16px alert triangle in the 24px alert column now also renders for **live merge-opportunity** rows (`hasMergeOpportunity(id)` driven by `mergeCandidatesFor`), with `data-testid="icon-merge-opportunity-{id}"` and `aria-label="Merge opportunity"` to distinguish it from the existing needs-attention triangle. Mutually exclusive with `isSplit` / `isMerged`. New 16px filled merge badge (`data-testid="icon-merge-{id}"`) renders for `isMerged` rows.

### Tokens
- No new design tokens introduced. Banner reuses the existing peach `#FDE2D4` (chip.red) currently inline at the call site, matching the split banner. Modal accent + confirm button reuse `action.primary` (`#008572`).

## 2026-05-19 — Status pill-select in detail panel (Figma node `27437-68533`)

### Changed (component pattern, reuses existing `--status-*` tokens)
- `pages/shipments/shipment-detail-panel/shipment-detail-panel.component.html` — Status field in the panel header changed from a bordered 40px select to a pill-shaped chip that still functions as a dropdown. Pattern: `h-6 rounded-full pl-3 pr-1 py-1`, background driven by `STATUS_PILL_CLASS[status]` (reuses `bg-status-*` Tailwind utilities backed by `--status-shipped`, `--status-picking`, `--status-label-created`, `--status-delayed`, `--status-delivered`, `--status-on-hold`, `--status-needs-review`, `--status-cancelled`). Status label is shown on its own (no "Status" prefix word, no dot — the colored pill itself conveys status). Right cluster is a 1px vertical divider (`bg-[#0b1516]/30`) + 16px chevron-down that rotates 180° when the menu is open. No new color tokens; the existing status palette is reused.

## 2026-05-19 — Split badge on split rows (Figma node `24091-104124`)

### Added (model field + icon, no new tokens)
- `core/models/shipment.model.ts` — new optional `isSplit?: boolean` flag on `Shipment`. Set by `ShipmentService.splitShipment(...)` on every new child row.
- `pages/shipments/shipments.component.html` — render a small "split" git-branch icon (`text-[#5b6b72]`, `h-4 w-4`) in the existing 24px alert column between the checkbox and the Shipment ID whenever `s.isSplit`. Icon carries `title`/`aria-label="Split shipment"` and `data-testid="icon-split-{id}"`. Per Figma, the split badge replaces the orange `needsAttention` triangle on a split row (`*ngIf="s.needsAttention && !s.isSplit"`).

## 2026-05-19 — Split Shipment modal refinements (Task #16)

### Changed (behavior + layout, no new tokens)
- `pages/shipments/split-shipment-modal` — dialog frame is now fixed at 1324×812 (`h-[812px] w-[1324px]`, capped by `max-h-[95vh]` / `max-w-[calc(100vw-2rem)]`). Opening warehouse / move dropdowns, adding shipments, or showing the impact-preview banner no longer resizes the dialog; the right-hand cards area is the scroll container.
- `pages/shipments/split-shipment-modal` — shipment cards now use a strict 2-column CSS grid (`grid grid-cols-2 gap-5 content-start`) so they fill left→right then top→bottom with no gaps between columns; the cards area scrolls vertically while the header, subheader, and footer stay pinned. Card width changed from fixed `w-[472px] shrink-0` to `w-full` so each card matches its grid cell (still ≈472 px given the 964 px right area).
- `pages/shipments/split-shipment-modal` — `Add Shipment` moved out of the cards container into the subheader, sitting immediately left of `Reset`. Both buttons share the same compact pill style (`px-2 py-1`, `text-xs font-bold`).
- `pages/shipments/split-shipment-modal` — added a `dirty` signal that flips to true on any user mutation (move, qty change, warehouse pick, add/remove shipment) and resets in `applyRecommendation`. `Reset` is `[disabled]="!dirty()"` (`disabled:cursor-not-allowed disabled:opacity-50`).
- `pages/shipments/split-shipment-modal` — added `warehouseOptionsFor(sIdx)`: subtractive list of warehouses excluding those chosen by other cards, while always keeping the card's own current selection so its label still renders.
- `pages/shipments/split-shipment-modal` — `addShipment()` now picks the first unused warehouse so new cards land on a unique option; falls back to `originalWarehouse` once `BASE_WAREHOUSES` is exhausted.
- `pages/shipments/split-shipment-modal` — replaced the decorative info-circle (rendered when `shipments().length <= 2`) with the same trash-can button used at N≥3. The button is always present; when `!canRemoveShipment` it's `disabled` (opacity 40, `cursor-not-allowed`) with `title="At least 2 shipments are required"`. The delete-confirm popover only opens when `canRemoveShipment`.
- `pages/shipments/split-shipment-modal` — Qty column header gained `justify-end` so the "Qty" label sits above its numeric values in both stepper and read-only row modes.
- No new design tokens introduced.

## 2026-05-19 — Split Shipment workflow behavior (Figma workflow `27432-68529` / file `unEpC0FcuWKbB5yO1m7OyX`)

### Changed (behavior + supporting UI states, no new tokens)
- `pages/shipments/split-shipment-modal` — added the per-row editable Qty stepper (`qty / max` input shown when a row is checked) so a single source row can be partially moved between buckets; selecting a row no longer forces moving the whole line.
- `pages/shipments/split-shipment-modal` — added the orange impact-preview banner (`#fbe9e2` bg, `#f1b5a5` border) that appears above the shipment cards whenever any bucket ships from a non-original warehouse. Copy mirrors Figma: "This split could increase delivery time for Shipment {N} due to low inventory of product {SKU} at {warehouse}. This split could increase total cost by $3.80."
- `pages/shipments/split-shipment-modal` — Recommendation 1 now routes Shipment 2 to `PA Fulfillment Center` (matching the Figma reference) so the impact banner fires by default; Rec 3 routes the three buckets to KS / PA / TX.
- `pages/shipments/split-shipment-modal` — the per-card "Move to Shipment N" button becomes a "Move to ▾" dropdown listing every other shipment when N ≥ 3; selection counter copy is now `1 product, 2 items selected` (rows + units).
- `pages/shipments/split-shipment-modal` — the trash icon on extra shipments (N ≥ 3) opens a dark `#0b1516` popover "Delete Shipment? · No · Delete" (red `#cc2c2c` Delete) anchored to the icon; confirming re-homes the bucket's items to a sibling.
- `pages/shipments/split-shipment-modal` — `confirm` now emits a `SplitConfirmPayload` (bucket warehouses + items with `sku/name/qty/unitValue`) instead of `void`.
- `core/services/shipment.service.ts` — new `splitShipment(originalId, buckets)` method: replaces the original row at its grid index with N new `Pending` shipments labelled `${shipmentId} - 1 … N`, each with the bucket's warehouse, products (qty × unitValue → `value`), and reset annotations; the new ids are added to `selectedIds` so the grid highlights them, the side panel is closed, and the original row is removed in place.
- `pages/shipments/shipment-detail-panel` — `confirmSplit(payload)` now calls `ShipmentService.splitShipment(...)` and fires the global toast `Shipment ${shipmentId} split successfully` (replaces the previous `Shipment split into 2` UI-only toast).
- No new design tokens introduced; banner uses the existing peach `#fbe9e2`/`#f1b5a5` pair already in use elsewhere; delete popover reuses neutral `#0b1516` and chip-red `#cc2c2c`.

## 2026-05-19 — Split Shipment modal (Figma node `23008-101209` / file `unEpC0FcuWKbB5yO1m7OyX`)

### Changed (no new tokens)
- `pages/shipments/split-shipment-modal` — fully rewritten to match the Figma "Dialog template" pixel-for-pixel. Now a 1324×812 dialog: 320 px left column with 3 recommendation presets (Rec 1 selected by default with `#e0f5f0` background and 2 px `#008572` border) + Manual split, divided by a `#b8c6cc` hairline; 964 px right area on `#f6f9fb` with the "You can edit this recommendation…" copy and a Reset button, then two 472 px Shipment cards (warehouse dropdown defaulting to `KS Fulfillment Center`, Product/Qty table with row checkboxes, per-card "0 products selected" / "Move to Shipment N" action menu), plus an "Add Shipment" pill button. Selecting a recommendation rehydrates the buckets; checking rows enables "Move to Shipment N"; Reset re-applies the active recommendation; Add Shipment appends an extra bucket (warehouse-picker + remove control). Footer Cancel + teal "Split Shipment" still fires the global `Shipment split into 2` toast — UI-only, no grid mutation. All colors are the design tokens called out in the Figma context (`#0b1516`, `#5b6b72`, `#b8c6cc`, `#008572`, `#e0f5f0`, `#e4eaed`, `#f6f9fb`); no new design tokens added.

## 2026-05-19 — Split Shipment surfacing (Figma node `23008-101023` / file `unEpC0FcuWKbB5yO1m7OyX`)

### Added (components, no new tokens)
- `pages/shipments/split-recommendation-banner` — peach `#FDE2D4` banner that appears at the top of the detail panel when a shipment has a `splitRecommendation`. Title/body copy switches on `reason` (`low-inventory` / `faster-delivery` / `lower-cost`). Emits `split` and `dismiss`; dismissal is session-scoped per shipment id.
- `pages/shipments/split-shipment-modal` — self-designed two-column (Shipment A / B) split modal. Chevron buttons move whole items between columns; Confirm is disabled until both sides have ≥1 item; Confirm fires the global toast `Shipment split into 2`.
- `shipment-detail-panel` — adds a header quick-icon (between kebab and close-X) with hover tooltip "Split Shipment"; adds a `Shipment Log` tab (timeline of `ShipmentLogEntry`); replaces the Products tab placeholder with the spec table (Item / Qty / Value / Total + total row), an inline `only N left ●` red badge for low-inventory SKUs, and a Materials section (5 handling flags, red present / green absent dots).
- `core/models/shipment.model.ts` — new types `ShipmentProduct`, `MaterialFlags`, `SplitRecommendation` (discriminated union), `ShipmentLogEntry`. Seeded s-4 (low-inventory @ `ABC12345SBL`, `KS Fulfillment center`), s-5 (faster-delivery), s-6 (lower-cost, $4.50 savings) with shared default products / materials / log.

### Tokens
- No new tokens introduced. Banner background and "only N left" badge background both reuse the existing `chip.red` token value (`#FDE2D4`). These are currently written inline as the hex literal pending the broader migration away from raw hex; once that pass lands, both call sites should switch to the `bg-chip-red` Tailwind utility.
- Reused `action.primary` (`#008572`) for the modal Confirm button — also currently inline pending the same migration.

## 2026-05-19 — Global Toast component (Figma node `25949-1336122`)

### Added (component, no new tokens)
- `core/services/toast.service.ts` — single source of truth for action-completion toasts. Exposes `show(message, detail?)`, `dismiss()`, and a `TOAST_DURATION_MS = 5000` constant.
- `shared/toast/toast.component.ts` — Figma-spec toast (384×84, green `#2e7d32`, check icon, optional detail line, X dismiss, bottom progress bar that animates from full → 0 over 5s). Auto-vanishes after 5s; progress bar restarts when a new toast fires (DOM keyed by toast id).
- Mounted once globally in `app.component`. Inline page toasts in `pages/marketplace` and `pages/wallet` were removed; both now call `ToastService.show()`. `InventoryService.showToast/dismissToast` delegates to the same service so all action notifications share one queue and visual treatment.

## 2026-05-19 — Configure Store wizard (Figma node `27841-533726`)

### Changed
- Marketplace "E-Commerce" category label → **"Stores"** to match Figma copy.

### Added (components, no new tokens)
- `pages/marketplace/configure-store-modal` — 5-step Configure Store wizard. Uses existing semantic tokens only (`fg.*`, `surface.*`, `divider`, `action.*`, `radius-token`). No new design tokens introduced.


All tokens are defined as CSS custom properties in `src/styles.scss` and exposed
to Tailwind via `tailwind.config.js`. Component code references **semantic
Tailwind utilities** (e.g. `text-fg-primary`, `bg-surface-subtle`,
`border-divider`), never raw hex values.

---

## 2026-05-19 — Wallet (Figma node `24950:231029`)

### Added

#### Foreground / text
- `fg.primary`     `#0B1516` — On White Surface / High Emphasis
- `fg.secondary`   `#45565B` — On White Surface / Medium Emphasis
- `fg.tertiary`    `#B8C6CC` — On White Surface / Low Emphasis
- `fg.link`        `#328AC9` — Text / Link (Shipment ID cells)
- `fg.navigation`  `#103859` — Text / Navigation
- `fg.on-action`   `#FFFFFF` — On Primary
- `fg.positive`    `#4A9200` — Success / Main; used for `+` amounts
- `fg.negative`    `#D32F2F` — Used for `-` amounts

#### Surface / background
- `surface.DEFAULT`        `#FFFFFF`
- `surface.subtle`         `#F0F4F7` — reserved for tinted inset panels (currently unused on the Wallet page; Auto-topup body is plain white per Figma node `24950:231111`)
- `surface.light-primary`  `#F6F9FB` — Table header / inset rows

#### Border
- `divider` `#E4EAED` — On White Surface / Divider

#### Action
- `action.primary`        `#008572`
- `action.primary-hover`  `#006A5A`

#### Status pill backgrounds
- `chip.blue`    `#C2E3F2` — Initiated, Processing, Scheduled
- `chip.green`   `#C4EEE6` — Completed, Refunded, Approved
- `chip.red`     `#FDE2D4` — Failed, Voided, Cancelled, Declined
- `chip.yellow`  `#FFEAC0` — Needs Review

#### Typography (Figma styles)
- `text-heading-5-md`   Roboto 500 18 / 26
- `text-subtitle-1-md`  Roboto 500 16 / 23
- `text-subtitle-2-md`  Roboto 500 14 / 20
- `text-subtitle-2`     Roboto 400 14 / 20
- `text-body-md`        Roboto 500 12 / 18

#### Misc
- `radius-token` `4px` — Figma `borderRadius` variable (control radius)
- `shadow-tooltip` — Figma `Tooltip` effect

### Notes
- Brand teal `#008572` was previously defined as `--brand-secondary` at the
  closest HSL approximation (`hsl(179 100% 25%)` ≈ `#007F7F`). Added the
  exact-match `action.primary` instead of mutating the existing brand token,
  so existing surfaces are unaffected. Future work: deprecate
  `brand.secondary` in favour of `action.primary` once all call sites are
  migrated.
- No values from Figma were normalised — all hex values are exact.
