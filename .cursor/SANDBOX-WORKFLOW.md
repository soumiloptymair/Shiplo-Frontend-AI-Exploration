# Feature Sandbox Workflow

Use this playbook when building features with Cursor **without publishing until you are ready**.

## Quick start

```bash
chmod +x scripts/feature-sandbox.sh
./scripts/feature-sandbox.sh start feature/branded-tracking-sandbox
```

Then implement in Cursor on that branch only.

## Pipeline stages

| Stage | What you do | Command / prompt |
|-------|-------------|------------------|
| **1. Sandbox** | Isolate work on a feature branch | `./scripts/feature-sandbox.sh start my-feature` |
| **2. Build** | Cursor implements from Figma + repo patterns | Master prompt + Figma link |
| **3. Review** | Compare diff + design fidelity | `./scripts/feature-sandbox.sh review` |
| **4. Iterate** | Manual tweaks via chat | *"Move the preview header 8px down"* / *"Use fg-link for tracking ID"* |
| **5. Verify** | Build + lint gate | `./scripts/feature-sandbox.sh check` |
| **6. Publish** | Commit, push, open PR — only when satisfied | `./scripts/feature-sandbox.sh publish --push` |

## Cursor prompts for iteration

**Design review pass** (after first implementation):

```text
Review your implementation against the Figma frame and the existing design system.
Fix spacing, typography, token misuse, hardcoded values, responsiveness, and a11y
without changing unrelated code. Summarize what you corrected.
```

**Production readiness** (before PR):

```text
Perform a final production-readiness pass. Run build, lint, and tests if configured.
List files changed, components reused, tokens used, a11y/responsive notes, and known gaps.
Do not make further code changes unless a check fails.
```

## Branded Tracking — manual QA

1. Open `/settings/branded-tracking` from Settings → Branded Tracking.
2. Upload a logo (PNG/JPG/SVG); confirm preview updates.
3. Edit URL, primary color, background color; confirm live preview reflects changes.
4. Click **Preview in New Window** — customer page should match inline preview.
5. **Save Brand** persists after reload; **Reset Brand** restores Figma defaults.
6. Keyboard: tab through config controls; verify focus rings.

## Rules

- Do **not** merge to `main` until `check` passes and you have reviewed the diff.
- Keep iteration on the sandbox branch; ask Cursor to avoid touching unrelated routes.
- Commits and PRs are **your** decision — the script never auto-commits.

## Current sandbox branch

This feature was started on: `feature/branded-tracking-sandbox`
