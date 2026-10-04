#!/usr/bin/env bash
# deploy.sh — cleanpaths.io deployment (mirrors removepdfpages deploy.sh pattern).
# Gate first (design/copy drift = no build), then build, then Pages deploy.
set -euo pipefail
cd "$(dirname "$0")"

export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-$(cat /home/ubuntu/.cloudflare/api-token 2>/dev/null || true)}"
if [ -z "${CLOUDFLARE_API_TOKEN}" ]; then
  echo "❌ CLOUDFLARE_API_TOKEN missing (expected /home/ubuntu/.cloudflare/api-token)" >&2
  exit 1
fi

npm run build   # includes scripts/deploy-gate.sh

npx wrangler pages deploy out --project-name=cleanpaths --branch=main --commit-dirty=true
echo "✅ deployed → https://cleanpaths.pages.dev (custom domain binding requires user confirmation)"
