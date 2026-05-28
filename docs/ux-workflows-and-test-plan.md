# Shiplo Angular App — UX Architecture & Test Specification

**Scope:** `src/app/` routes and implemented UI  
**Audience:** Product, QA, Engineering  
**Method:** Workflow inventory → formal use cases → edge cases → executable test cases

---

## 1. Application map

| Route | Page | Shell | Primary persona |
|-------|------|-------|-----------------|
| `/` → `/shipments` | Shipments (default) | Yes | Ops / Shipper |
| `/shipments` | Shipments list + detail panel | Yes | Ops / Shipper |
| `/pick-and-pack` | Pick & Pack | Yes | Warehouse picker |
| `/inventory` | Inventory catalog | Yes | Catalog manager |
| `/wallet` | Wallet & transactions | Yes | Finance / Admin |
| `/marketplace` | Integrations marketplace | Yes | Admin |
| `/settings/automations` | Automation rules | Yes | Admin |
| `/settings/branded-tracking` | Branded tracking config | Yes | Brand / Admin |
| `/settings/defaults/*` | Defaults (Packaging, Tags, Brand Assets) | Yes | Admin |
| `/track/preview` | Customer tracking preview | No | End customer (preview) |
| `/**` | 404 | No | Any |

**Global navigation (sidebar):** Shipments, Wallet, Pick and Pack, Inventory, Settings → Automations, Branded Tracking, Defaults, Marketplace.

**Implementation notes (affects testing scope):**

- New Shipment wizard: Steps 1–4 exist; Step 1 + customer address validation are most complete.
- Defaults rail items Label, Add Ons, Printer, Documents are **disabled**.
- Brand Assets Save/Cancel are **stubs** (no persistence).
- Several Filters buttons are **presentational** (no logic wired).
- Data is largely **in-memory / localStorage** (mock boundaries).

---

## 2. Global workflows (App Shell)

### 2.1 Possible user workflows

1. Land on app → auto-redirect to Shipments.
2. Navigate between primary modules via sidebar links.
3. Collapse/expand sidebar (manual toggle; auto-collapses below 1024px).
4. Expand/collapse Resources and Settings groups in sidebar.
5. Deep-link directly to any route (e.g. `/settings/branded-tracking`).
6. Open customer preview in new tab from Branded Tracking (leaves shell).
7. Hit unknown URL → 404 → return to Shipments.

---

## 3. Page-by-page workflow inventories

### 3.1 Shipments (`/shipments`)

**Purpose:** Monitor, filter, create, split/merge, and inspect shipments.

#### Workflows

**List & discovery**

1. View shipment grid with sample data.
2. Switch tabs: All | Orders | Returns.
3. Filter by status (All + 8 statuses).
4. Search by shipment ID, order ref, source, warehouse, customer.
5. Click Filters (UI only — no filter panel).
6. Select/deselect individual rows (checkbox).
7. Select/deselect all visible rows.
8. Open row action menu (⋮): Unmerge, Unsplit (when applicable).
9. See merge-opportunity alert icon on eligible rows.
10. Open/close shipment detail panel (row click / toggle).

**Create shipment**

11. Click “Create New Shipment” → open 4-step wizard modal.
12. Complete Step 1 (Shipment Details): type, freight, package, warehouse, products, materials, etc.
13. Navigate wizard steps 2–4 (Customer, Carrier, Label & Pickup).
14. Use Back / Continue / Submit.
15. Save draft as Quote → toast + close modal.
16. Open Quotes dropdown → resume saved quote.
17. Delete saved quote from dropdown.
18. Cancel wizard → close modal, restore focus.

**Detail panel (when shipment selected)**

19. Switch tabs: Label | Details | Products | Notes | Shipment Log.
20. Change status via status dropdown (UI state; not persisted to service).
21. Open panel ⋮ menu → Split | Merge | Edit | View Receipt | View Label (last three noop).
22. Act on split recommendation banner → open split modal or dismiss.
23. Act on merge recommendation banner → open merge modal or dismiss.
24. Upload/remove documents (Label tab).
25. Upload/remove POD images (Details tab).
26. Add notes (Notes tab — shared component).
27. Close panel.

**Split shipment**

28. Open split modal from banner or menu.
29. Pick recommended split or manual split.
30. Assign products/qty across 2+ shipment buckets.
31. Change warehouse per bucket.
32. Add/remove shipment cards (min 2).
33. Move selected items between buckets.
34. Confirm split → grid updates, new rows selected, panel closes, toast.

**Merge shipments**

35. Open merge modal when candidates exist.
36. Review source cards.
37. Choose kept warehouse.
38. Confirm merge → combined row in grid, toast.

**Undo split/merge**

39. Row menu → Unsplit (restores original).
40. Row menu → Unmerge (restores sources).

---

### 3.2 Pick and Pack (`/pick-and-pack`)

**Purpose:** Build pick lists from orders and manage warehouse picking.

#### Workflows

**Pick list table**

1. View all pick lists.
2. Select/deselect a pick list (row click or radio).
3. Change warehouse filter (PA / KS — affects new list metadata).
4. Change time filter (UI only).
5. Click Search / Filters (UI only).

**Orders (shipments) table**

6. View orders; when pick list selected, filter pill shows + clear.
7. Expand/collapse shipment row to see line items.
8. Select/deselect eligible shipments (not already on selected pick list).
9. Select all eligible shipments.
10. See low-inventory warning on product rows.

**Detail panel (3 modes)**

11. **Pick list mode:** view pick list summary when list selected, no shipment selection.
12. **Shipments mode:** multiple shipments selected → create new pick list.
13. **Add shipments mode:** pick list + additional shipments selected → add to existing list.
14. Enter picker name.
15. Create pick list from selected shipments.
16. Add selected shipments to active pick list.
17. Dismiss low-inventory banner.
18. Close panel.

---

### 3.3 Inventory (`/inventory`)

**Purpose:** Browse/sync product catalog and inspect SKU details.

#### Workflows

**Header**

1. Switch tabs: SKUs | Products (both render product tree today).
2. View warning badge count.
3. View “Last synced” label.
4. Search products by name, ext ID, type, HS code.
5. Click Filters / Edit / Export (presentational).
6. Start catalog sync → progress dialog.
7. Cancel sync mid-progress.

**Product tree**

8. Expand/collapse product row (disabled while syncing).
9. Select product row → product detail panel.
10. Select variant row → variant detail panel.
11. Close detail panel.

**Sync dialog**

12. Watch progress bar 0→100%.
13. On complete → toast “Sync complete”.
14. Cancel → reset progress, no completion toast.

---

### 3.4 Wallet (`/wallet`)

**Purpose:** View balance, funding, and transaction history.

#### Workflows

**Summary cards**

1. View current balance.
2. Click Withdraw (disabled at $0; toast when initiated).
3. Click Deposit (toast).
4. Toggle auto top-up on/off.
5. View funding methods list.

**Transactions**

6. Search transactions (type, status, txn ID, shipment ID, label ID, carrier).
7. Pick date range preset (Last 7/30/90 days, All time).
8. View filtered transaction table.
9. Cancel pending withdrawal (when eligible) → toast.

---

### 3.5 Marketplace (`/marketplace`)

**Purpose:** Connect/disconnect integrations by category.

#### Workflows

**Browse**

1. Select category: Carriers, Stores, ERP, OMS, WMS, TMS, Accounting.
2. Switch tab: Connected | Available.
3. Search by account name, brand, installed by.
4. Select connector row → detail panel.

**Connected integrations**

5. View connection metadata in panel.
6. Open row ⋮ menu → Disconnect.
7. Disconnect → moves to Available, toast.

**Available integrations**

8. **Connect bucket:** select row → Connect → modal flow.
9. **Request bucket:** Request Access → status becomes Requested, toast.
10. For ecommerce (Stores): Configure Store modal (draft save or confirm connect).
11. For other categories: Connect Integration modal (account name + confirm).
12. Close detail panel.

---

### 3.6 Automation Rules (`/settings/automations`)

**Purpose:** Manage LTL assignment automation rules and default fallback.

#### Workflows

**Rules table**

1. Search rules by name, condition/action labels, values.
2. Click Filters (presentational).
3. Add Rule → builder modal (create).
4. Row ⋮ → Edit | Duplicate | Move Up | Move Down | Disable/Enable | Delete.
5. Delete → inline confirmation → confirm/cancel.

**Rule builder modal**

6. Set rule name.
7. Add/edit/remove IF conditions (field, operator, value).
8. Add/edit/remove THEN actions.
9. Save → toast, list updates.
10. Cancel/close modal.

**Default fallback card**

11. Expand/collapse card.
12. Edit fallback carrier + service.
13. Save or cancel fallback edits.

---

### 3.7 Branded Tracking (`/settings/branded-tracking`)

**Purpose:** Configure customer-facing tracking page branding.

#### Workflows

**Brand configuration (left panel)**

1. Upload logo via button or drag-and-drop (PNG/JPG/SVG ≤5MB).
2. Reject invalid file type or oversize file → toast error.
3. Remove uploaded logo.
4. Edit logo URL/domain (strips protocol/www).
5. Set primary and background colors (color picker).
6. Toggle “Display documents on tracking page”.
7. Add/edit/remove reason codes.
8. Reset brand to defaults (draft only until Save).
9. Save brand → persists to localStorage, disables Save/Reset until next edit.
10. Save/Reset buttons disabled when draft equals saved.

**Live preview (right panel)**

11. See embedded tracking page preview (compact mode).
12. Click “Open in new window” → stages draft to sessionStorage, opens `/track/preview`.

---

### 3.8 Customer Tracking Preview (`/track/preview`)

**Purpose:** Standalone customer-facing preview (no app shell).

#### Workflows

1. Load staged draft from sessionStorage (or saved config fallback).
2. View branded header (logo, colors, domain link).
3. View shipment status timeline and map.
4. View shipment info, carrier, delivery details.
5. Browse document carousel (scroll prev/next).
6. Open document lightbox preview.
7. Navigate prev/next document in lightbox.
8. Close document preview.

---

### 3.9 Defaults shell (`/settings/defaults`)

**Purpose:** Settings sub-navigation for operational defaults.

#### Workflows

1. Navigate sub-rail: Brand Assets | Packaging | Tags (active).
2. Attempt disabled items (Label, Add Ons, Printer, Documents) — should not navigate.
3. Default redirect: `/settings/defaults` → Packaging.

---

### 3.10 Defaults → Packaging (`/settings/defaults/packaging`)

#### Workflows

1. View packaging configurations table + pre-defined carrier section.
2. Add Packaging → modal.
3. Edit packaging via row ⋮.
4. Toggle enable/disable per row.
5. Delete packaging → inline confirm → confirm/cancel.
6. Save create/edit in modal.

---

### 3.11 Defaults → Tags (`/settings/defaults/tags`)

#### Workflows

1. Search tags (filters table + footer count).
2. Add Tag → modal (name, category, color, live preview pill).
3. Edit tag via row ⋮.
4. Delete tag → inline confirm.
5. View empty state when no tags match search.

---

### 3.12 Defaults → Brand Assets (`/settings/defaults/brand-assets`)

#### Workflows

1. Upload logo (PNG/JPG only, drag-drop or picker).
2. Change/delete logo.
3. Edit account info fields (company, address, city, state, ZIP, phone, email).
4. Set primary/background colors.
5. Cancel (stub — no reset behavior).
6. Save (stub — toast only, no persistence).

---

### 3.13 Not Found (`/**`)

#### Workflows

1. See 404 message.
2. Click “Go to Shipments” → navigate to `/shipments`.

---

## 4. Use cases (derived from workflows)

| ID | Title | Actor | Goal | Primary page |
|----|-------|-------|------|--------------|
| UC-01 | Browse shipments | Shipper | Find shipments by tab, status, search | Shipments |
| UC-02 | Inspect shipment | Shipper | Review label, details, products, notes, log | Shipments |
| UC-03 | Create shipment | Shipper | Complete wizard and submit new shipment | Shipments |
| UC-04 | Save/resume quote | Shipper | Persist incomplete shipment as quote | Shipments |
| UC-05 | Split shipment | Shipper | Divide products across warehouses | Shipments |
| UC-06 | Merge shipments | Shipper | Combine eligible shipments | Shipments |
| UC-07 | Undo split/merge | Shipper | Restore prior shipment structure | Shipments |
| UC-08 | Create pick list | Picker | Group orders for warehouse picking | Pick & Pack |
| UC-09 | Add to pick list | Picker | Append orders to existing list | Pick & Pack |
| UC-10 | Sync inventory | Catalog mgr | Refresh product catalog | Inventory |
| UC-11 | Inspect SKU | Catalog mgr | View product/variant details | Inventory |
| UC-12 | Manage wallet funds | Finance | Deposit, withdraw, auto top-up | Wallet |
| UC-13 | Audit transactions | Finance | Search/filter/cancel withdrawals | Wallet |
| UC-14 | Connect integration | Admin | Connect carrier/store/ERP/etc. | Marketplace |
| UC-15 | Disconnect integration | Admin | Remove active connector | Marketplace |
| UC-16 | Request integration access | Admin | Request unavailable connector | Marketplace |
| UC-17 | Manage automation rules | Admin | CRUD + reorder + enable/disable | Automations |
| UC-18 | Configure fallback carrier | Admin | Set default when no rule matches | Automations |
| UC-19 | Brand tracking page | Brand admin | Logo, colors, URL, reason codes | Branded Tracking |
| UC-20 | Preview customer tracking | Brand admin | Validate branded experience | Branded Tracking / Preview |
| UC-21 | Manage packaging defaults | Admin | CRUD packaging configs | Defaults/Packaging |
| UC-22 | Manage tag defaults | Admin | CRUD shipment tags | Defaults/Tags |
| UC-23 | Configure brand assets | Admin | Logo + company info (partial) | Defaults/Brand Assets |
| UC-24 | Recover from bad URL | Any user | Return to app from 404 | Not Found |

---

## 5. Edge cases

### 5.1 Cross-cutting

| ID | Edge case | Expected behavior |
|----|-----------|-------------------|
| EC-G01 | Direct URL to invalid route | 404 page with escape link |
| EC-G02 | Sidebar collapse on resize | Sidebar collapses <1024px without breaking nav |
| EC-G03 | Rapid double-click on primary CTAs | No duplicate modals/toasts (idempotent UI) |
| EC-G04 | Keyboard-only navigation | Focus visible; modals trap focus; Esc closes overlays |
| EC-G05 | Long search strings / special chars | No crash; empty results where appropriate |
| EC-G06 | Session refresh mid-flow | In-memory state resets; localStorage configs persist |

### 5.2 Shipments

| ID | Edge case | Expected behavior |
|----|-----------|-------------------|
| EC-S01 | Split shipment with no products | Toast error; modal blocked |
| EC-S02 | Merge with zero candidates | Toast “No merge candidates…” |
| EC-S03 | Split into single non-empty bucket | Confirm disabled (`canConfirm` false) |
| EC-S04 | Resume deleted quote | Modal does not open |
| EC-S05 | Quotes dropdown empty | Empty state copy shown |
| EC-S06 | Filter + tab yields zero rows | Empty grid (no errors) |
| EC-S07 | Unmerge/Unsplit on ineligible row | Menu item hidden or noop |
| EC-S08 | Address validation API failure (Step 2) | `failed` state; user can continue |
| EC-S09 | Invalid address with submit attempted | Inline errors on all required fields |
| EC-S10 | Dismiss split/merge banner then re-select row | Banner stays dismissed for session |

### 5.3 Pick and Pack

| ID | Edge case | Expected behavior |
|----|-----------|-------------------|
| EC-P01 | Create pick list without picker name | Create blocked |
| EC-P02 | Create with zero shipments selected | Create blocked |
| EC-P03 | Select shipment already on active pick list | Checkbox disabled; row greyed |
| EC-P04 | Toggle same pick list twice | Deselects list; clears shipment selection |
| EC-P05 | Low inventory on related products | Banner shown until dismissed |

### 5.4 Inventory

| ID | Edge case | Expected behavior |
|----|-----------|-------------------|
| EC-I01 | Expand row during sync | Expand blocked |
| EC-I02 | Cancel sync at 90% | Progress resets; no success toast |
| EC-I03 | Search with no matches | Empty list; count reflects 0 |
| EC-I04 | Select variant then parent product | Variant deselected; product panel shown |

### 5.5 Wallet

| ID | Edge case | Expected behavior |
|----|-----------|-------------------|
| EC-W01 | Withdraw at $0 balance | Withdraw no-op |
| EC-W02 | Search matches nothing | Empty table |
| EC-W03 | Cancel non-cancellable txn | Action hidden/disabled |
| EC-W04 | Date menu open + outside click | Menu closes |

### 5.6 Marketplace

| ID | Edge case | Expected behavior |
|----|-----------|-------------------|
| EC-M01 | Connect on already-connected row | Connect disabled in panel |
| EC-M02 | Switch category with panel open | Panel closes |
| EC-M03 | Disconnect selected row | Panel closes; row moves to Available |
| EC-M04 | Request access twice | Idempotent status “Requested” |
| EC-M05 | Empty search in category | Empty list state |

### 5.7 Automations

| ID | Edge case | Expected behavior |
|----|-----------|-------------------|
| EC-A01 | Delete only rule | Confirmation → empty table |
| EC-A02 | Move first rule up / last rule down | No-op or disabled |
| EC-A03 | Search with no matches | Empty filtered list |
| EC-A04 | Save rule with empty name | Modal validation blocks save |
| EC-A05 | Cancel delete confirmation | Rule preserved |

### 5.8 Branded Tracking

| ID | Edge case | Expected behavior |
|----|-----------|-------------------|
| EC-B01 | Upload .gif or .pdf | Toast: unsupported type |
| EC-B02 | Upload >5MB | Toast: size limit |
| EC-B03 | Save without changes | Save/Reset disabled |
| EC-B04 | Reset then navigate away without Save | Saved config unchanged on reload |
| EC-B05 | Open preview without staging | Falls back to saved config |
| EC-B06 | Corrupt sessionStorage JSON | Graceful fallback to saved config |
| EC-B07 | Remove all reason codes | Allowed in draft; Save persists empty list |

### 5.9 Defaults

| ID | Edge case | Expected behavior |
|----|-----------|-------------------|
| EC-D01 | Delete last packaging config | Table empty state |
| EC-D02 | Delete tag while search filtered | Footer count updates |
| EC-D03 | Brand Assets Save | Stub — no persistence after reload |
| EC-D04 | Click disabled defaults rail item | No navigation |

---

## 6. Test cases

**Conventions**

- **Priority:** P0 = release blocker, P1 = core path, P2 = secondary, P3 = polish/a11y
- **Type:** Manual (M), E2E (E), Unit/Component (U) — map to your test stack
- Preconditions assume app running with default seed data unless noted

### 6.1 Global navigation

| ID | UC | Priority | Steps | Expected result |
|----|-----|----------|-------|-----------------|
| TC-G-001 | — | P0 | Load `/` | Redirect to `/shipments`; shipments page visible |
| TC-G-002 | — | P1 | Click each sidebar link | Correct route loads; active state highlights |
| TC-G-003 | EC-G02 | P2 | Resize window to 900px | Sidebar collapsed; nav still usable |
| TC-G-004 | UC-24 | P1 | Navigate to `/does-not-exist` | 404 shown; “Go to Shipments” works |

### 6.2 Shipments

| ID | UC | Priority | Steps | Expected result |
|----|-----|----------|-------|-----------------|
| TC-S-001 | UC-01 | P0 | Open Shipments; verify grid loads | Rows visible with status pills |
| TC-S-002 | UC-01 | P1 | Click tab “Returns” | Only return-kind rows shown |
| TC-S-003 | UC-01 | P1 | Set status filter “Delivered” | Grid filters correctly |
| TC-S-004 | UC-01 | P1 | Search partial shipment ID | Matching rows only |
| TC-S-005 | UC-01 | P2 | Combine tab + status + search | Intersection filter works |
| TC-S-006 | UC-02 | P0 | Click shipment row | Detail panel opens |
| TC-S-007 | UC-02 | P1 | Cycle panel tabs Label→Log | Each tab content renders |
| TC-S-008 | UC-02 | P2 | Upload doc on Label tab | File appears in list; removable |
| TC-S-009 | UC-02 | P2 | Upload POD on Details tab | Image thumbnail appears |
| TC-S-010 | UC-03 | P0 | Open Create New Shipment | Wizard modal opens; step 1 active |
| TC-S-011 | UC-03 | P1 | Fill step 1 required fields; Continue through steps | Steps advance; summary updates |
| TC-S-012 | UC-03 | P0 | Complete wizard; Submit | New row at top of grid; success toast |
| TC-S-013 | UC-04 | P1 | Save as Quote mid-wizard | Quote in dropdown; badge count +1 |
| TC-S-014 | UC-04 | P1 | Resume quote from dropdown | Wizard reopens with prior draft |
| TC-S-015 | UC-04 | P2 | Delete quote | Quote removed; badge decrements |
| TC-S-016 | EC-S04 | P2 | Resume after delete | Nothing opens |
| TC-S-017 | UC-05 | P0 | Open split on multi-product shipment | Split modal opens with products |
| TC-S-018 | UC-05 | P1 | Apply recommended split; Confirm | Original replaced by N rows; toast |
| TC-S-019 | EC-S01 | P1 | Split shipment with no products | Error toast; modal blocked |
| TC-S-020 | EC-S03 | P1 | Manual split with 1 bucket only | Confirm disabled |
| TC-S-021 | UC-06 | P0 | Open merge on eligible shipment | Merge modal with candidate cards |
| TC-S-022 | UC-06 | P1 | Confirm merge | Single merged row; sources gone |
| TC-S-023 | EC-S02 | P1 | Merge with no candidates | Error toast |
| TC-S-024 | UC-07 | P1 | Unsplit split child via row menu | Original shipment restored |
| TC-S-025 | UC-07 | P1 | Unmerge merged row | Source shipments restored |
| TC-S-026 | EC-S10 | P2 | Dismiss merge banner; re-open same shipment | Banner stays hidden |
| TC-S-027 | EC-S08 | P2 | Simulate USPS validation failure on step 2 | Failed state; Continue still possible |
| TC-S-028 | EC-S09 | P1 | Continue step 2 with empty required fields | Inline validation shown |
| TC-S-029 | — | P2 | Esc in wizard | Modal closes; focus restored |
| TC-S-030 | — | P2 | Select all checkbox | All visible rows selected |

### 6.3 Pick and Pack

| ID | UC | Priority | Steps | Expected result |
|----|-----|----------|-------|-----------------|
| TC-P-001 | UC-08 | P0 | Select 2+ shipments; enter picker; Create | New pick list row; shipments tagged |
| TC-P-002 | EC-P01 | P1 | Create without picker name | No pick list created |
| TC-P-003 | EC-P02 | P1 | Create with zero selection | No pick list created |
| TC-P-004 | UC-09 | P1 | Select pick list + extra shipments; Add | Orders count increases; assignments updated |
| TC-P-005 | EC-P03 | P1 | Try selecting locked-in shipment | Checkbox disabled |
| TC-P-006 | UC-08 | P1 | Expand shipment row | Product sub-table visible |
| TC-P-007 | EC-P05 | P2 | Select pick list with low-inventory items | Warning banner appears |
| TC-P-008 | — | P2 | Clear pick list filter pill | Full order list returns |
| TC-P-009 | EC-P04 | P2 | Click same pick list twice | Deselected; panel closes |

### 6.4 Inventory

| ID | UC | Priority | Steps | Expected result |
|----|-----|----------|-------|-----------------|
| TC-I-001 | UC-11 | P0 | Select product row | Product detail panel opens |
| TC-I-002 | UC-11 | P1 | Select variant under product | Variant detail panel opens |
| TC-I-003 | UC-10 | P0 | Click Sync | Progress dialog; completes with toast |
| TC-I-004 | EC-I02 | P1 | Cancel sync mid-way | Dialog closes; no success toast |
| TC-I-005 | EC-I01 | P2 | Try expand during sync | No expand |
| TC-I-006 | UC-01 | P1 | Search nonexistent SKU | Empty results |
| TC-I-007 | — | P2 | Switch SKUs/Products tabs | Tab state updates |

### 6.5 Wallet

| ID | UC | Priority | Steps | Expected result |
|----|-----|----------|-------|-----------------|
| TC-W-001 | UC-12 | P0 | View wallet page | Balance and transactions render |
| TC-W-002 | UC-12 | P1 | Click Deposit | “Deposit initiated” toast |
| TC-W-003 | UC-12 | P1 | Click Withdraw with balance > 0 | “Withdrawal initiated” toast |
| TC-W-004 | EC-W01 | P1 | Withdraw at $0 | No action |
| TC-W-005 | UC-12 | P1 | Toggle auto top-up | State toggles |
| TC-W-006 | UC-13 | P1 | Search by txn ID fragment | Filtered rows |
| TC-W-007 | UC-13 | P1 | Change date range preset | Label updates (filter UI) |
| TC-W-008 | UC-13 | P1 | Cancel eligible pending withdrawal | Status updates; toast |
| TC-W-009 | EC-W03 | P2 | Attempt cancel on completed txn | Action unavailable |

### 6.6 Marketplace

| ID | UC | Priority | Steps | Expected result |
|----|-----|----------|-------|-----------------|
| TC-M-001 | UC-14 | P0 | Category Carriers → Available → Connect row | Connect modal opens |
| TC-M-002 | UC-14 | P1 | Confirm connect | Row moves to Connected; toast |
| TC-M-003 | UC-14 | P1 | Stores category → Configure Store → Confirm | Connected with store name |
| TC-M-004 | UC-16 | P1 | Request Access on request-bucket row | Status Requested; toast |
| TC-M-005 | UC-15 | P0 | Connected row ⋮ → Disconnect | Row moves to Available; toast |
| TC-M-006 | EC-M02 | P2 | Switch category with panel open | Panel closes |
| TC-M-007 | UC-14 | P1 | Search brand name | Matching connectors only |
| TC-M-008 | EC-M01 | P2 | Connect button on Connected row | Disabled |

### 6.7 Automations

| ID | UC | Priority | Steps | Expected result |
|----|-----|----------|-------|-----------------|
| TC-A-001 | UC-17 | P0 | Add Rule with valid IF/THEN | Rule appears; toast |
| TC-A-002 | UC-17 | P1 | Edit existing rule | Updates in place |
| TC-A-003 | UC-17 | P1 | Duplicate rule | Copy appended |
| TC-A-004 | UC-17 | P1 | Move rule up/down | Order changes |
| TC-A-005 | UC-17 | P1 | Disable rule | Visual disabled state |
| TC-A-006 | UC-17 | P1 | Delete with confirm | Rule removed |
| TC-A-007 | EC-A05 | P2 | Cancel delete | Rule remains |
| TC-A-008 | UC-18 | P1 | Edit default fallback; Save | Toast; values persist in session |
| TC-A-009 | UC-17 | P1 | Search rule keyword | Filtered list |
| TC-A-010 | EC-A04 | P1 | Save rule without name | Blocked in modal |

### 6.8 Branded Tracking + Customer Preview

| ID | UC | Priority | Steps | Expected result |
|----|-----|----------|-------|-----------------|
| TC-B-001 | UC-19 | P0 | Upload valid PNG logo | Preview updates; toast |
| TC-B-002 | EC-B01 | P1 | Upload unsupported type | Error toast; no change |
| TC-B-003 | EC-B02 | P1 | Upload 6MB file | Error toast |
| TC-B-004 | UC-19 | P1 | Change primary color | Preview reflects color |
| TC-B-005 | UC-19 | P1 | Add reason code; Save | Persists after reload |
| TC-B-006 | EC-B03 | P2 | Load page with no edits | Save/Reset disabled |
| TC-B-007 | UC-19 | P1 | Reset brand | Draft reverts to defaults |
| TC-B-008 | UC-20 | P0 | Open in new window | `/track/preview` shows staged branding |
| TC-B-009 | EC-B05 | P2 | Open preview tab without staging | Saved config used |
| TC-B-010 | UC-20 | P1 | Open document in preview | Lightbox with navigation |
| TC-B-011 | UC-20 | P2 | Toggle display documents off | Documents section hidden in preview |
| TC-B-012 | EC-B06 | P3 | Corrupt sessionStorage key | Page loads with fallback config |

### 6.9 Defaults

| ID | UC | Priority | Steps | Expected result |
|----|-----|----------|-------|-----------------|
| TC-D-001 | UC-21 | P0 | Add packaging via modal | Row appears; toast |
| TC-D-002 | UC-21 | P1 | Edit packaging | Values update |
| TC-D-003 | UC-21 | P1 | Toggle packaging off | Enabled state changes |
| TC-D-004 | UC-21 | P1 | Delete packaging (confirm) | Row removed |
| TC-D-005 | UC-22 | P0 | Add tag | Row with preview pill |
| TC-D-006 | UC-22 | P1 | Search tags | Filter + footer count update |
| TC-D-007 | UC-22 | P1 | Delete tag | Removed from list |
| TC-D-008 | UC-23 | P1 | Upload logo on Brand Assets | Preview in card |
| TC-D-009 | EC-D03 | P2 | Save Brand Assets; reload page | **Known gap:** changes lost |
| TC-D-010 | EC-D04 | P2 | Click disabled “Printer” rail item | No route change |
| TC-D-011 | — | P1 | Visit `/settings/defaults` | Redirect to Packaging |

---

## 7. Recommended test execution order

**Smoke (P0, ~30 min):** TC-G-001, TC-S-001, TC-S-006, TC-S-010, TC-P-001, TC-I-001, TC-W-001, TC-M-001, TC-A-001, TC-B-001, TC-B-008, TC-D-001, TC-D-005

**Regression (P0+P1):** Full tables per module before release

**Accessibility spot-check:** Tab through modals (Shipments wizard, Split/Merge, Automation builder); verify Esc, focus trap, aria labels on `data-testid` controls

**Responsive:** Shipments grid + detail panel, Branded Tracking split pane, Pick & Pack dual tables at 375px / 768px / 1280px

---

## 8. Known gaps to track separately

These are product/implementation gaps surfaced during workflow analysis — not failures if tests “fail” against intended future behavior:

1. **Filters buttons** (Shipments, Inventory, Automations, Pick & Pack) — no filter UI wired.
2. **Brand Assets Save/Cancel** — stub persistence.
3. **Shipment detail status change** — UI-only, not written back to `ShipmentService`.
4. **Edit Shipment / View Receipt / View Label** — menu noops.
5. **Pick & Pack time/search controls** — partially decorative.
6. **Wallet date range** — label changes; transaction list not date-filtered in service layer.
7. **Inventory SKUs vs Products tab** — same underlying view today.

---

## 9. Traceability matrix (summary)

| Module | Workflows | Use cases | Edge cases | Test cases |
|--------|-----------|-----------|------------|------------|
| Global | 7 | — | 6 | 4 |
| Shipments | 40 | 7 | 10 | 30 |
| Pick & Pack | 18 | 2 | 5 | 9 |
| Inventory | 14 | 2 | 4 | 7 |
| Wallet | 9 | 2 | 4 | 9 |
| Marketplace | 12 | 3 | 5 | 8 |
| Automations | 13 | 2 | 5 | 10 |
| Branded Tracking | 12 | 2 | 7 | 12 |
| Defaults | 17 | 3 | 4 | 11 |
| 404 | 2 | 1 | — | (in TC-G-004) |
