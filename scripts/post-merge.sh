#!/usr/bin/env bash
set -euo pipefail

if [ -f package.json ]; then
  npm install --no-audit --no-fund
fi

if [ -f angular-app/package.json ]; then
  (cd angular-app && npm install --no-audit --no-fund)
fi
