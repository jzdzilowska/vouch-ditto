#!/usr/bin/env bash
# Run this from the project root after the repo is built locally.
# Requires GitHub CLI (`brew install gh`) authenticated with `gh auth login`.

set -euo pipefail

REPO_NAME="${1:-vouch-ditto}"
VISIBILITY="${2:-public}"   # public | private

if ! command -v gh >/dev/null; then
  echo "❌ GitHub CLI (gh) is not installed. Run: brew install gh && gh auth login" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "❌ Not logged in to gh. Run: gh auth login" >&2
  exit 1
fi

echo "→ Creating $VISIBILITY repo: $REPO_NAME"
gh repo create "$REPO_NAME" --"$VISIBILITY" --source=. --remote=origin --push

echo "✅ Pushed. Open it:"
gh repo view --web
