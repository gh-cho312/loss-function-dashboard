#!/usr/bin/env bash
# Build and publish the site to the gh-pages branch (GitHub Pages deploy-from-branch).
# Requires push access to the repo (gh auth / git credential helper).
set -euo pipefail

REPO_URL="https://github.com/gh-cho312/loss-function-dashboard.git"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm run build
touch dist/.nojekyll

cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="deploy" -c user.email="deploy@local" commit -q -m "Deploy site"
git push -f "$REPO_URL" gh-pages
rm -rf .git

echo "Deployed gh-pages -> https://gh-cho312.github.io/loss-function-dashboard/"
