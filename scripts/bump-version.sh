#!/usr/bin/env bash
set -euo pipefail

LEVEL="${1:-}"

if [[ "$LEVEL" != "patch" && "$LEVEL" != "minor" && "$LEVEL" != "major" ]]; then
  echo "Usage: bash scripts/bump-version.sh <patch|minor|major>"
  exit 1
fi

npm version "$LEVEL" --no-git-tag-version
pnpm -r exec npm version "$LEVEL" --no-git-tag-version

VERSION=$(node -p "require('./package.json').version")

git add -A
git commit -m "chore: bump version to $VERSION"
git tag "v$VERSION"
git push --follow-tags
