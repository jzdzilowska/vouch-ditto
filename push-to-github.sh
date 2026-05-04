#!/usr/bin/env bash
# Run this from the project root on your Mac to push the full commit
# history to a new GitHub repo.
#
# The repo was built inside a sandbox with no GitHub access, so the git
# history travels as a bundle file in .git-bundle/vouch.bundle.
# This script restores it and pushes via `gh`.
#
# Prereqs:
#   brew install gh
#   gh auth login

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
if [ ! -f ".git-bundle/vouch.bundle" ]; then
  echo "❌ Missing .git-bundle/vouch.bundle (the packaged commit history)." >&2
  exit 1
fi

echo "→ Restoring git history from bundle"
rm -rf .git
git init -q
git config user.email "$(gh api user --jq .email 2>/dev/null || echo you@example.com)"
git config user.name  "$(gh api user --jq .name  2>/dev/null || echo You)"
git fetch -q ./.git-bundle/vouch.bundle main:main
git checkout -q main
rm -rf .git-bundle

echo "→ Creating $VISIBILITY repo: $REPO_NAME"
gh repo create "$REPO_NAME" --"$VISIBILITY" --source=. --remote=origin --push

echo "✅ Pushed. Opening it…"
gh repo view --web
