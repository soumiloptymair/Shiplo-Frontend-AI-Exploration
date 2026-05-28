# Figma Feature Sync — Reference

## Config schema (`docs/figma/config.json`)

| Field | Required | Description |
|-------|----------|-------------|
| `fileKey` | yes | Figma file key from `/design/:fileKey/...` |
| `fileUrl` | no | Canonical URL for humans |
| `branchKey` | no | Use instead of `fileKey` for branched files |
| `syncPolicy.maxFeaturesPerRun` | no | Default 3 |
| `syncPolicy.requireSandboxBranch` | no | Default true |

## Registry entry schema

```json
{
  "id": "kebab-case slug",
  "name": "Human name",
  "route": "/app/route or null for shell-only",
  "codePaths": ["src/app/pages/..."],
  "figma": {
    "pageNamePatterns": ["substring matches, lowercase"],
    "nodeId": "123:456",
    "frameNamePatterns": ["substring matches"]
  },
  "status": "implemented | design-only | blocked",
  "priority": 1,
  "notes": "optional"
}
```

## Sync-state entry schema

```json
{
  "figmaNodeId": "123:456",
  "figmaFrameName": "Shipments — All",
  "lastInventoriedAt": "2026-05-28T12:00:00Z",
  "lastSyncedAt": "2026-05-28T12:30:00Z",
  "syncStatus": "pending | in-sync | minor-drift | major-drift | failed",
  "driftLevel": "none | minor | major",
  "lastSyncNotes": "free text"
}
```

## Name matching algorithm

1. Normalize: lowercase, trim, collapse whitespace, strip `—`, `-`, `_`.
2. Page score: +10 if any `pageNamePatterns` substring matches page name.
3. Frame score: +20 if any `frameNamePatterns` matches frame name; +5 partial word overlap.
4. Tie-break: prefer `FRAME` over `SECTION`; prefer names containing route keyword (e.g. "shipments").
5. Minimum score 15 to auto-bind; below that → manual review in plan output.

## MCP tool sequence

### Inventory pass

```
get_metadata(fileKey)                    → pages[]
for page in pages:
  get_metadata(fileKey, nodeId=page.id) → frames[]
match frames → registry
write feature-registry.json + sync-state.json
```

### Single feature sync

```
get_design_context(fileKey, nodeId=feature.figma.nodeId)
get_screenshot(fileKey, nodeId=feature.figma.nodeId)
read codePaths/*
implement diff
npm run build
update sync-state.json[feature.id]
```

## Figma URL parsing

| URL pattern | fileKey source |
|-------------|----------------|
| `figma.com/design/ABC123/File` | `ABC123` |
| `figma.com/design/ABC123/branch/DEF456/File` | `DEF456` |
| `?node-id=12-34` | nodeId = `12:34` |

## Angular mapping conventions

| Figma area | Code location |
|------------|---------------|
| Full page | `src/app/pages/<feature>/<feature>.component.ts/html` |
| Modal / wizard | `src/app/pages/<feature>/*-modal/` |
| Side panel | `src/app/pages/<feature>/*-panel/` |
| Settings sub-page | `src/app/pages/defaults/<section>/` |
| Customer-facing (no shell) | route without `app-shell` in `app.routes.ts` |

## Related docs

- Routes: `docs/ux-workflows-and-test-plan.md` section 1
- Sandbox branches: `.cursor/SANDBOX-WORKFLOW.md`
- Design translation: `.cursor/rules/04-figma-to-code.mdc`
