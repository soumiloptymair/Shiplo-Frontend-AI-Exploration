# Figma Feature Sync Workflow

Keep the Angular app aligned with your **entire** Shiplo Figma file using the **figma-feature-sync** agent skill.

## One-time setup

```bash
chmod +x scripts/figma-sync.sh
./scripts/figma-sync.sh init
```

Edit `docs/figma/config.json`:

- Set `fileKey` from your Figma URL: `https://www.figma.com/design/<fileKey>/...`
- Set `fileUrl` to the full link you share with the team

Ensure the Figma plugin/MCP is connected in Cursor.

## Pipeline

| Step | What happens | Command |
|------|----------------|---------|
| **1. Inventory** | Agent scans all Figma pages/frames and binds them to features | `./scripts/figma-sync.sh prompt inventory` |
| **2. Plan** | Agent compares each feature to code; outputs drift report | `./scripts/figma-sync.sh prompt plan` |
| **3. Sync** | Agent implements updates (batched, sandboxed) | `./scripts/figma-sync.sh prompt sync --next 3` |
| **4. Verify** | Build + manual QA | `./scripts/feature-sandbox.sh check` |
| **5. Publish** | Commit/PR when satisfied | `./scripts/feature-sandbox.sh publish --push` |

Paste each printed prompt into a **new Cursor agent chat**. Mention the **figma-feature-sync** skill or attach it.

## Recommended cadence

- **After major Figma releases:** run inventory → plan → sync in batches of 3 features
- **Weekly:** `prompt plan` only — see what drifted without coding
- **Per feature:** `./scripts/figma-sync.sh prompt sync shipments`

## Files

| File | Purpose |
|------|---------|
| `docs/figma/config.json` | Figma file key + sync policy |
| `docs/figma/feature-registry.json` | Maps features ↔ routes ↔ code paths ↔ Figma frames |
| `docs/figma/sync-state.json` | Last inventory/sync timestamps per feature |
| `.agents/skills/figma-feature-sync/` | Agent instructions (MCP calls, guardrails) |

## Master prompt (full file sync)

```text
Use the figma-feature-sync skill.

My Figma file: <paste URL>

1. Run inventory — bind all pages/frames to docs/figma/feature-registry.json
2. Produce a prioritized drift plan (no code yet)
3. Wait for my approval, then sync the top 3 drifted features into src/app/
4. Use sandbox branches per feature; run npm run build after each
5. Update sync-state.json and give me the run report + manual QA checklist
```

## Adding a new feature

When inventory finds an unmatched Figma frame:

1. Agent proposes a registry entry (`status: design-only`)
2. You confirm route and scope
3. Run `./scripts/feature-sandbox.sh start feature/<name>`
4. Run `./scripts/figma-sync.sh prompt sync <feature-id>`

## Limits (by design)

- **3 features max per run** — avoids giant unreviewable diffs (change in `config.json`)
- **No auto-commit** — you control git
- **Design files only** — FigJam UML boards are out of scope for code sync
- **Spec before code** — every sync follows `04-figma-to-code`

## Status check

```bash
./scripts/figma-sync.sh status
```
