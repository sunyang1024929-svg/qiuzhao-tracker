#!/bin/zsh
set -euo pipefail

REPO="/Users/sunyangsunshine/Documents/秋招网站链接/qiuzhao-tracker"
NODE="/Users/sunyangsunshine/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
PYTHON="/Users/sunyangsunshine/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"

cd "$REPO"

# Never overwrite a change that has not yet been committed by the user.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Skipped: repository has uncommitted changes."
  exit 0
fi

git pull --ff-only origin main
"$NODE" scripts/update-companies.mjs

# The updater must never publish private application data.
if ! git diff --quiet -- user-data.json; then
  echo "Refusing to publish: user-data.json changed."
  exit 1
fi

if git diff --quiet -- index.html; then
  echo "No new companies found."
  exit 0
fi

"$PYTHON" -m unittest tests/test_tracker_static.py -v
git add index.html
git commit -m "chore: daily company list update"
git push origin main
