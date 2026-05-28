#!/usr/bin/env bash
# Feature sandbox workflow — branch, review, iterate, publish.
#
# Usage:
#   ./scripts/feature-sandbox.sh start [branch-name]
#   ./scripts/feature-sandbox.sh status
#   ./scripts/feature-sandbox.sh review
#   ./scripts/feature-sandbox.sh check
#   ./scripts/feature-sandbox.sh publish [--push]
#
# Workflow:
#   1. start   — create/switch to an isolated feature branch
#   2. iterate — prompt Cursor for edits; re-run `review` / `check` anytime
#   3. publish — merge-ready verification; optionally push + open PR

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_BRANCH="${SANDBOX_BASE_BRANCH:-main}"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }

require_cleanish() {
  if ! git -C "$ROOT" diff-index --quiet HEAD -- 2>/dev/null; then
    yellow "Note: you have uncommitted changes (expected while iterating in the sandbox)."
  fi
}

cmd_start() {
  local branch="${1:-feature/sandbox-$(date +%Y%m%d-%H%M)}"
  git -C "$ROOT" fetch origin "$DEFAULT_BRANCH" 2>/dev/null || true
  if git -C "$ROOT" show-ref --verify --quiet "refs/heads/$branch"; then
    git -C "$ROOT" checkout "$branch"
    green "Switched to existing sandbox branch: $branch"
  else
    git -C "$ROOT" checkout -b "$branch" "$DEFAULT_BRANCH"
    green "Created sandbox branch: $branch"
  fi
  cat <<EOF

Sandbox ready on branch: $branch

Next steps:
  1. Ask Cursor to implement or refine the feature on this branch only.
  2. Run: ./scripts/feature-sandbox.sh review
  3. Run: ./scripts/feature-sandbox.sh check
  4. When satisfied: ./scripts/feature-sandbox.sh publish --push

Manual iteration:
  - Keep prompting Cursor with edits; do NOT publish until review + check pass.
  - Use ".cursor/SANDBOX-WORKFLOW.md" for the full playbook.

EOF
}

cmd_status() {
  git -C "$ROOT" status -sb
  echo
  git -C "$ROOT" log --oneline -5
}

cmd_review() {
  require_cleanish
  yellow "=== Sandbox review (git diff vs $DEFAULT_BRANCH) ==="
  git -C "$ROOT" diff --stat "$DEFAULT_BRANCH"...HEAD || git -C "$ROOT" diff --stat
  echo
  yellow "=== Changed files ==="
  git -C "$ROOT" diff --name-only "$DEFAULT_BRANCH"...HEAD 2>/dev/null || git -C "$ROOT" diff --name-only
  echo
  yellow "Prompt Cursor:"
  echo '  "Review your implementation against Figma and the design system. Fix spacing, tokens, a11y, and scope issues without unrelated changes."'
}

cmd_check() {
  yellow "=== Build ==="
  (cd "$ROOT" && npm run build)
  green "Sandbox checks passed."
}

cmd_publish() {
  local push=false
  for arg in "$@"; do
    [[ "$arg" == "--push" ]] && push=true
  done

  cmd_check
  yellow "=== Pre-publish review ==="
  cmd_review

  local branch
  branch="$(git -C "$ROOT" branch --show-current)"
  cat <<EOF

Publish checklist:
  [ ] Figma fidelity verified manually in the browser
  [ ] Preview in New Window tested
  [ ] Save / Reset Brand tested
  [ ] Only intended files changed

When ready, commit on branch: $branch
Then run: ./scripts/feature-sandbox.sh publish --push
Or ask Cursor: "Create a PR for this sandbox branch."

EOF

  if $push; then
    git -C "$ROOT" push -u origin HEAD
    if command -v gh >/dev/null 2>&1; then
      gh pr create --fill || yellow "Create the PR manually in GitHub."
    else
      yellow "Install GitHub CLI (gh) to open a PR from the terminal."
    fi
  fi
}

usage() {
  cat <<EOF
Usage: $(basename "$0") <command> [args]

Commands:
  start [branch]   Create or switch to a sandbox branch
  status           Show branch status and recent commits
  review           Show diff summary + review prompt
  check            Run Angular build
  publish [--push] Run checks, show publish checklist, optionally push + PR

EOF
}

main() {
  local cmd="${1:-}"
  shift || true
  case "$cmd" in
    start) cmd_start "$@" ;;
    status) cmd_status ;;
    review) cmd_review ;;
    check) cmd_check ;;
    publish) cmd_publish "$@" ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
