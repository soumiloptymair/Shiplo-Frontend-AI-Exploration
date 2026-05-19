# Design Tokens Changelog

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
