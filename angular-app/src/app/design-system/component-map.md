# Figma → Code Component Map

Living document mapping Figma components / instances to Angular components.

| Figma component                       | Angular component / pattern                                          | Notes |
|---------------------------------------|----------------------------------------------------------------------|-------|
| Title Bar                             | `app-shell` page-header slot                                         | 68 px tall, 20 px gutter, title at y=17 |
| KPI Cards / Current Balance           | `pages/wallet` inline `<article data-testid="card-current-balance">` | Reuses `text-heading-5-md` + Montserrat 56 px for value |
| KPI Cards / Auto-topup                | `pages/wallet` inline `<article data-testid="card-auto-topup">`      | Edit button 69×26, Toggle 48×28; body on plain `bg-surface` per Figma node `24950:231111` (no tint); Funding method row uses a 131×40 bordered Select-style field |
| KPI Cards / Funding Methods           | `pages/wallet` inline `<article data-testid="card-funding-methods">` | 3 rows × 40 px in `bg-surface-light-primary` |
| Wallet Chips (status pill)            | `shared/components/status-pill`                                       | Single component, `tone` prop maps to `chip.*` tokens |
| Toggle (on/off)                       | inline (Wallet card only — keep until a 2nd consumer exists)         | 48×28 track, 24 px knob |
| Select field (date range)             | inline `<button>` + dropdown menu in Wallet                          | h=36, w=148 from Figma |
| Search field                          | inline `<input>` in Wallet filter bar                                | h=36, w=196 |
| Filters button                        | inline `<button>` in Wallet filter bar                               | h=36, w=92 |
| Download Report button (text)         | inline `<button>` in Wallet filter bar                               | h=36, ghost style |
| Column header / Grid cell             | Native `<thead>` / `<tbody>` rows                                    | Column widths copied from Figma column-header instances |
| Configure Store wizard (5 steps)      | `pages/marketplace/configure-store-modal`                            | Figma node `27841-533726` (frames 1171276832 → 1171276836). 720×~700 modal: left-rail stepper + step pane + footer (Cancel ‖ Back · Continue · Save Draft (step 1) · Connect). Steps: 1 Connect Account, 2 Shipping Accounts, 3 Warehouse Settings, 4 Addresses, 5 Extras. Opens for `category === 'ecommerce'` only; other categories still use `connect-modal`. |
| Toast (action completion)             | `shared/toast/toast.component` + `core/services/toast.service`       | Figma node `25949-1336122`. 384×84 green `#2e7d32`, check icon, message + optional detail, X close, bottom progress bar that shrinks over 5s. Mounted once globally in `app.component`; pages call `inject(ToastService).show(msg, detail?)`. |
| Split recommendation banner           | `pages/shipments/split-recommendation-banner`                        | Figma node `23008-101023`. Peach `#FDE2D4` panel inside the detail panel, just below the ORDER bar. Title + body switched on `splitRecommendation.reason` (`low-inventory` / `faster-delivery` / `lower-cost`), white "Split Shipment" pill, X dismiss (session-only). |
| Split Shipment header quick-icon      | inline in `shipment-detail-panel` header                             | Figma node `23008-101045`. Between the kebab menu and close-X icons. Hover shows a dark tooltip "Split Shipment"; click opens the split modal. |
| Split Shipment modal                  | `pages/shipments/split-shipment-modal`                               | Figma node `23008-101209` (file `unEpC0FcuWKbB5yO1m7OyX`). 1324×812 dialog. Left 320 px column = 3 recommendation presets (Rec 1 selected by default, bg `#e0f5f0` + 2 px `#008572` border) + divider + "Manual split". Right area on `#f6f9fb` shows the active recommendation as two 472 px shipment cards (warehouse picker + Product/Qty table with row checkboxes + per-card "Move to Shipment N" action menu) plus an "Add Shipment" pill. Footer Cancel + teal Split Shipment; Confirm disabled if any shipment is empty. Confirm still fires the global toast `Shipment split into 2`. |
| Products tab table + Materials        | inline in `shipment-detail-panel` (Products tab)                     | Figma node `23008-101023`. 4-col table (Item / Qty / Value / Total) with a "only N left ●" red badge for low-inventory SKUs and a footer total row. Materials section below lists 5 handling flags with red (present) / green (absent) dots. |
| Shipment Log tab                      | inline in `shipment-detail-panel` (Shipment Log tab)                 | Figma node `23008-101023`. Vertical timeline of `ShipmentLogEntry` records (label + timestamp) connected by hairlines. |

When a new Figma component shows up, add a row before writing code.
