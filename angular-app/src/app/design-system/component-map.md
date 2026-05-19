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

When a new Figma component shows up, add a row before writing code.
