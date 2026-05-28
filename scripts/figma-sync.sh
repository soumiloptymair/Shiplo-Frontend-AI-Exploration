#!/usr/bin/env bash
# Figma feature sync — status and Cursor prompt helpers.
#
# Usage:
#   ./scripts/figma-sync.sh init
#   ./scripts/figma-sync.sh status
#   ./scripts/figma-sync.sh prompt inventory
#   ./scripts/figma-sync.sh prompt plan
#   ./scripts/figma-sync.sh prompt sync [--next N | <feature-id> ...]
#
# The agent skill `.agents/skills/figma-feature-sync/` performs the actual
# Figma MCP inventory and code updates. This script prepares config and
# prints copy-paste prompts for Cursor.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FIGMA_DIR="$ROOT/docs/figma"
CONFIG="$FIGMA_DIR/config.json"
EXAMPLE="$FIGMA_DIR/config.example.json"
REGISTRY="$FIGMA_DIR/feature-registry.json"
STATE="$FIGMA_DIR/sync-state.json"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }

require_config() {
  if [[ ! -f "$CONFIG" ]]; then
    red "Missing $CONFIG"
    echo "Run: ./scripts/figma-sync.sh init"
    exit 1
  fi
}

cmd_init() {
  if [[ ! -f "$EXAMPLE" ]]; then
    red "Missing $EXAMPLE"
    exit 1
  fi
  if [[ -f "$CONFIG" ]]; then
    yellow "Config already exists: $CONFIG"
  else
    cp "$EXAMPLE" "$CONFIG"
    green "Created $CONFIG"
  fi
  cat <<EOF

Next steps:
  1. Edit docs/figma/config.json — set fileKey and fileUrl to your Shiplo Figma file.
  2. In Cursor, run: ./scripts/figma-sync.sh prompt inventory
  3. Paste the printed prompt into a new agent chat (attach figma-feature-sync skill).

EOF
}

cmd_status() {
  require_config
  local file_key
  file_key="$(python3 -c "import json; print(json.load(open('$CONFIG')).get('fileKey',''))" 2>/dev/null || echo "")"

  echo "=== Figma sync status ==="
  echo "Config:     $CONFIG"
  echo "File key:   ${file_key:-<not set>}"
  echo "Registry:   $REGISTRY"
  echo "Sync state: $STATE"
  echo

  if [[ -f "$REGISTRY" ]]; then
    python3 - "$REGISTRY" <<'PY'
import json, sys
path = sys.argv[1]
data = json.load(open(path))
features = data.get("features", [])
print(f"Registry features: {len(features)}")
for f in sorted(features, key=lambda x: (x.get("priority", 99), x.get("id", ""))):
    nid = (f.get("figma") or {}).get("nodeId") or "—"
    print(f"  [{f.get('priority', '?')}] {f.get('id')}: nodeId={nid} route={f.get('route') or '—'}")
PY
    echo
  fi

  if [[ -f "$STATE" ]]; then
    python3 - "$STATE" <<'PY'
import json, sys
path = sys.argv[1]
data = json.load(open(path))
print(f"Last inventory: {data.get('lastInventoryAt') or 'never'}")
print(f"Last sync run:  {data.get('lastSyncRunAt') or 'never'}")
feats = data.get("features") or {}
if not feats:
    print("Per-feature sync state: (empty — run inventory first)")
else:
    print("Per-feature sync state:")
    for fid, st in sorted(feats.items()):
        print(f"  {fid}: {st.get('syncStatus', '?')} (synced: {st.get('lastSyncedAt') or 'never'})")
PY
  fi
}

read_file_key() {
  python3 -c "import json; print(json.load(open('$CONFIG')).get('fileKey',''))"
}

cmd_prompt() {
  local mode="${1:-}"
  shift || true
  require_config
  local file_key
  file_key="$(read_file_key)"
  if [[ -z "$file_key" || "$file_key" == "YOUR_FIGMA_FILE_KEY" ]]; then
    red "Set a real fileKey in docs/figma/config.json first."
    exit 1
  fi

  case "$mode" in
    inventory)
      cat <<EOF
Use the **figma-feature-sync** skill. Mode: **inventory**.

1. Read docs/figma/config.json, feature-registry.json, sync-state.json.
2. Call Figma MCP get_metadata on fileKey \`$file_key\` (no nodeId) to list all pages.
3. Drill into each page; match frames to docs/figma/feature-registry.json entries.
4. Update feature-registry.json with figma.nodeId bindings.
5. Update sync-state.json with lastInventoryAt and per-feature inventory records.
6. Report unmatched Figma frames as new feature candidates — do not implement yet.

Do not change application code in inventory mode.
EOF
      ;;
    plan)
      cat <<EOF
Use the **figma-feature-sync** skill. Mode: **plan**.

1. Read docs/figma/config.json, feature-registry.json, sync-state.json.
2. If nodeIds are missing, run inventory first (or ask me to run inventory).
3. For each registered feature, compare Figma (get_design_context + get_screenshot) to code in codePaths.
4. Produce a prioritized sync plan table. Do not change code yet.

File key: \`$file_key\`
EOF
      ;;
    sync)
      local targets=""
      local next_n=""
      while [[ $# -gt 0 ]]; do
        case "$1" in
          --next)
            shift
            next_n="${1:-3}"
            shift || true
            ;;
          *)
            targets="$targets $1"
            shift || true
            ;;
        esac
      done

      if [[ -n "$next_n" ]]; then
        targets="the next $next_n highest-priority drifted features from the sync plan"
      elif [[ -z "${targets// /}" ]]; then
        targets="the next 3 highest-priority drifted features from the sync plan"
      fi

      cat <<EOF
Use the **figma-feature-sync** skill. Mode: **sync**.

Sync $targets from Figma into Angular (src/app/).

1. Read docs/figma/config.json, feature-registry.json, sync-state.json.
2. For each feature: spec first (04-figma-to-code), then implement on a sandbox branch per feature.
3. Reuse existing components and design tokens. Follow data-grid rules for tables.
4. Run \`npm run build\` after each feature.
5. Update sync-state.json and give the run report.

File key: \`$file_key\`
Respect syncPolicy.maxFeaturesPerRun in config.json.
Do not commit unless I ask.
EOF
      ;;
    *)
      red "Unknown prompt mode: $mode"
      echo "Use: inventory | plan | sync"
      exit 1
      ;;
  esac
}

usage() {
  cat <<EOF
Usage: $(basename "$0") <command> [args]

Commands:
  init                    Copy config.example.json → config.json
  status                  Show registry and sync-state summary
  prompt inventory        Print Cursor prompt to scan entire Figma file
  prompt plan             Print Cursor prompt for drift plan (no code)
  prompt sync [--next N]  Print Cursor prompt to implement updates
  prompt sync <id> ...    Print Cursor prompt for specific feature IDs

Skill: .agents/skills/figma-feature-sync/SKILL.md
Playbook: .cursor/FIGMA-SYNC-WORKFLOW.md

EOF
}

main() {
  local cmd="${1:-}"
  shift || true
  case "$cmd" in
    init) cmd_init ;;
    status) cmd_status ;;
    prompt) cmd_prompt "$@" ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
