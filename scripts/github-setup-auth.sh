#!/usr/bin/env bash
# One-time GitHub auth setup for commit/push from Cursor or terminal.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GH="${ROOT}/.local/bin/gh"

if [[ ! -x "$GH" ]]; then
  echo "Downloading GitHub CLI..."
  mkdir -p "${ROOT}/.local/bin"
  tmp="$(mktemp -d)"
  curl -fsSL -o "${tmp}/gh.zip" "https://github.com/cli/cli/releases/download/v2.69.0/gh_2.69.0_macOS_arm64.zip"
  unzip -qo "${tmp}/gh.zip" -d "${tmp}/extract"
  cp "${tmp}/extract/gh_2.69.0_macOS_arm64/bin/gh" "$GH"
  chmod +x "$GH"
  rm -rf "$tmp"
fi

echo "=== GitHub auth setup ==="
echo "This opens a browser login and configures git to push over SSH."
echo

"$GH" auth login --hostname github.com --git-protocol ssh --web
"$GH" auth setup-git
"$GH" auth status

echo
echo "SSH public key (already on disk at ~/.ssh/id_ed25519.pub):"
cat ~/.ssh/id_ed25519.pub
echo
echo "Testing GitHub SSH..."
ssh -T git@github.com || true

cd "$ROOT"
git remote set-url origin git@github.com:soumiloptymair/Shiplo-Frontend-AI-Exploration.git
echo
echo "Ready. Push with: git push -u origin HEAD"
