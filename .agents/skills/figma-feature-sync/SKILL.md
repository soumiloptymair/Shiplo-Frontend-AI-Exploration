---
name: figma-feature-sync
description: >-
  Inventories an entire Figma design file, maps frames to Angular features in
  src/app/pages/, detects design drift, and pulls Figma updates into code.
  Use when the user asks to sync Figma to code, scan the whole Figma file,
  batch-update features from design, run a Figma inventory, or keep the app
  aligned with the design file. Requires Figma MCP and docs/figma/config.json.
---

# Figma Feature Sync Agent

Batch agent for keeping **Angular 18** (`src/app/`) aligned with the Shiplo Figma file.

## Before starting

1. Read [docs/figma/config.json](../../../docs/figma/config.json) (copy from `config.example.json` if missing).
2. Read [docs/figma/feature-registry.json](../../../docs/figma/feature-registry.json).
3. Read [docs/figma/sync-state.json](../../../docs/figma/sync-state.json).
4. Confirm Figma MCP is available (`get_metadata`, `get_design_context`, `get_screenshot`).
5. Apply rules: `00-master-rule`, `angular-only`, `04-figma-to-code`, `15-data-grid`, `16-table-column-sizing`.
6. For implementation quality, also follow **production-frontend** skill.

If the user provides a Figma URL, extract `fileKey` (use `branchKey` when URL contains `/branch/`). Update `config.json` when the file key changes.

## Operating modes

| Mode | Trigger | Output |
|------|---------|--------|
| **inventory** | First run or "scan my Figma file" | Updated registry node IDs + sync-state inventory |
| **plan** | After inventory or "what needs updating?" | Prioritized sync plan, no code changes |
| **sync** | "Pull updates for X" or "sync next features" | Code changes + updated sync-state |
| **audit** | "Compare all features to Figma" | Drift report only |

Default to **plan** before **sync** unless the user explicitly asks to implement immediately.

## Phase 1 — File inventory

Goal: discover every Figma page and top-level feature frames; bind them to registry entries.

### 1.1 List pages

```
CallMcpTool: get_metadata
  fileKey: <from config>
  clientLanguages: typescript,html,scss
  clientFrameworks: angular
  (omit nodeId)
```

Returns top-level pages (id + name). Record in working notes.

### 1.2 Drill into each page

For each page, call `get_metadata` with that page's `nodeId`. Parse the XML for:

- `FRAME`, `SECTION`, `COMPONENT`, `COMPONENT_SET` nodes
- Names and node IDs
- Skip: hidden layers, obvious junk (`Rectangle`, `Group` with no product name), dev-only annotations

### 1.3 Match frames to registry

For each registry feature in `feature-registry.json`:

1. Score Figma nodes by normalized name match against `figma.pageNamePatterns` and `figma.frameNamePatterns`.
2. Prefer exact route/screen names over generic containers.
3. When multiple frames match, pick the largest meaningful screen frame (not a thumbnail or component spec).
4. Write winning `figma.nodeId` and `figma.pageName` back to the registry.
5. Unmatched Figma frames → candidate **new features** (report, do not auto-implement without user approval).

Update `sync-state.json`:

```json
"features": {
  "<feature-id>": {
    "figmaNodeId": "123:456",
    "figmaFrameName": "Shipments — All",
    "lastInventoriedAt": "<ISO8601>",
    "syncStatus": "pending"
  }
}
```

Set top-level `lastInventoryAt` and `fileKey`.

## Phase 2 — Drift detection & prioritization

For each inventoried feature (respect `syncPolicy.maxFeaturesPerRun`):

1. `get_design_context` on `figma.nodeId` — primary design reference.
2. `get_screenshot` on same node — visual truth for layout review.
3. Read all paths in `codePaths` (component `.ts`, `.html`, related services).
4. Compare: layout regions, new/removed controls, copy changes, table columns, modals, empty/loading/error states, tokens vs hardcoded values.

Classify each feature:

| Status | Meaning | Action |
|--------|---------|--------|
| `in-sync` | No meaningful drift | Skip |
| `minor-drift` | Spacing, copy, token fixes | Sync in one pass |
| `major-drift` | New sections, flows, columns | Sync + call out risks |
| `missing-in-code` | Figma frame, no implementation | Propose new page/component |
| `missing-in-figma` | Code route, no frame | Report only |
| `blocked` | Ambiguous design | Ask user |

Sort queue: `missing-in-code` → `major-drift` → `minor-drift` → by `priority` field.

Write the plan to the user before syncing:

```markdown
## Figma sync plan

| Feature | Status | Figma frame | Code paths | Notes |
|---------|--------|-------------|------------|-------|
| ... | major-drift | 123:456 | src/app/pages/... | New filter row |

**This run:** sync up to N features: [ids]
**Deferred:** [ids + reason]
```

## Phase 3 — Per-feature sync (implementation)

Process **one feature at a time**. Never rewrite unrelated routes.

### 3.1 Sandbox (when `requireSandboxBranch` is true)

```bash
./scripts/feature-sandbox.sh start feature/figma-sync-<feature-id>
```

### 3.2 Spec before code

Per `04-figma-to-code`, document for the current feature:

- Screen purpose, layout regions, reusable components
- Interactions and all states (empty, loading, error, success)
- Data assumptions, a11y, responsive behavior, risks

### 3.3 Implement

- Map to existing `src/app/pages/` components; extend, do not duplicate.
- Reuse design tokens (`src/styles.scss`, Tailwind config).
- Tables: `data-grid--scroll` pattern; sticky headers (`15-data-grid`).
- Preserve `data-testid` on interactive elements.
- Mock data stays in services/fixtures, not in templates.
- Modals/panels: match Figma hierarchy with existing modal/panel patterns in the feature folder.

### 3.4 Verify

```bash
npm run build
```

Fix build errors before moving to the next feature.

### 3.5 Update sync-state

```json
"<feature-id>": {
  "syncStatus": "in-sync",
  "lastSyncedAt": "<ISO8601>",
  "lastSyncNotes": "Aligned filter row and status chips to Figma 27686:…",
  "driftLevel": "none"
}
```

Set `lastSyncRunAt` at end of run.

## Phase 4 — Run report

Always end with:

```markdown
## Figma sync run complete

**File:** <fileKey>
**Mode:** inventory | plan | sync | audit
**Features processed:** N

### Updated in code
- [feature-id]: summary

### Registry changes
- New node bindings / new feature candidates

### Still pending
- [feature-id]: reason

### Manual QA
- [ ] Route loads in browser
- [ ] Key interactions from Figma work
- [ ] Responsive at 1024px and mobile
- [ ] Keyboard / focus visible

### Next run
Suggest: `./scripts/figma-sync.sh prompt sync --next 3`
```

## New features from Figma

When inventory finds unmatched frames:

1. Add a draft entry to `feature-registry.json` with `"status": "design-only"`.
2. Propose route, `codePaths`, and implementation scope.
3. **Do not implement** until the user confirms scope (avoid surprise large features).

## Guardrails

- Max `syncPolicy.maxFeaturesPerRun` features per conversation (default 3).
- Do not sync FigJam (`/board/`) or Slides — design files only (`/design/`).
- Do not bulk-commit; user decides when to commit.
- Do not replace working behavior unless Figma clearly supersedes it — note conflicts.
- If `get_design_context` returns sparse output, use `get_screenshot` and ask the user to confirm ambiguous regions.
- Skip features with `status: "blocked"` or listed in `syncPolicy.skipStatuses`.

## Quick commands (user-facing)

User can run:

```bash
cp docs/figma/config.example.json docs/figma/config.json   # first-time setup
./scripts/figma-sync.sh status
./scripts/figma-sync.sh prompt inventory
./scripts/figma-sync.sh prompt plan
./scripts/figma-sync.sh prompt sync --next 3
./scripts/figma-sync.sh prompt sync shipments
```

## Additional reference

- MCP call patterns and registry schema: [reference.md](reference.md)
- Human playbook: [.cursor/FIGMA-SYNC-WORKFLOW.md](../../../.cursor/FIGMA-SYNC-WORKFLOW.md)
