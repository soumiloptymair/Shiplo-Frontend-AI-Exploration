# Cursor Rules Pack

Production-grade guidance for building from **Figma frames** into this repo’s **Angular-only** app.

## Always on

| Rule | Purpose |
|------|---------|
| `00-master-rule.mdc` | Product-minded senior frontend defaults |
| `angular-only.mdc` | All UI work in `src/app/` |

## Context rules (`src/**/*`)

Applied when working in the Angular app:

- `01-product-intent` — States, edge cases, user goals
- `03-frontend-architecture` — Pages, components, services, signals
- `04-figma-to-code` — Spec before code
- `05-accessibility` — A11y requirements
- `06-responsive-design` — Breakpoints and layout
- `07-state-management` — State categories and async
- `08-interactions` — Hover, focus, loading, overlays

## On-demand rules

Loaded when the task matches (review, debug, ship, etc.):

- `02-code-review` — PR-style review format
- `09-production-readiness` — Build, env, deployment
- `10-refactoring` — Safe refactor sequence
- `11-debugging` — Systematic debug
- `12-qa-checklist` — Manual QA
- `13-production-scorecard` — 1–10 scoring
- `14-replit-generated-code-review` — Generated code first draft

## Skill + prompts

- **Skill:** `.agents/skills/production-frontend/` — attach or mention `production-frontend`
- **Skill:** `.agents/skills/figma-feature-sync/` — scan entire Figma file, plan drift, batch-sync features into `src/app/`
- **Prompts:** `.cursor/prompt-library.md` — copy-paste templates
- **Figma sync playbook:** `.cursor/FIGMA-SYNC-WORKFLOW.md` — inventory → plan → sync pipeline

## Workflow

1. Ask Cursor to **review before editing** (rule `14` or prompt library).
2. Refactor into reusable Angular components.
3. Add states, a11y, responsiveness.
4. Run build; compare to Figma.
5. Commit when scorecard / QA pass.

**Principle:** Generated code is a draft. Cursor enforces production quality.
