#!/bin/zsh
set -euo pipefail

REPO_DIR="/Users/pranav/Documents/Playground"
TODAY="$(date +%F)"

cd "$REPO_DIR"

npm run sync:jobs

if git diff --quiet -- src/jobReportsData.generated.js; then
  echo "No job report changes detected for publishing."
  exit 0
fi

git add src/jobReportsData.generated.js
git commit -m "Update job reports for ${TODAY}"
git push
