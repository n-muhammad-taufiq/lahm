#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

nohup flock -n "$HOME/.lahm-backend.lock" \
  npm --prefix "$repo_root" run start:backend \
  >>"$HOME/.lahm-backend.log" 2>&1 </dev/null &
