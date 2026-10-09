#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.local/bin:$PATH"

if ! command -v agy >/dev/null 2>&1; then
  printf 'Antigravity CLI (agy) is not installed or is not on PATH.\n' >&2
  exit 127
fi

if ! command -v script >/dev/null 2>&1; then
  printf 'The script command is required to provide Antigravity with a terminal.\n' >&2
  exit 127
fi

nohup flock -n "$HOME/.agy-remote-control.lock" \
  script -q -f -c 'agy --remote-control' "$HOME/.agy-remote-control.typescript" \
  </dev/null >>"$HOME/.agy-remote-control.log" 2>&1 &
