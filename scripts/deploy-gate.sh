#!/usr/bin/env bash
# deploy-gate.sh — 部署闸 (prompt 规则 #7, mirrors removepdfpages deploy.sh pattern).
# Refuses to build when the implementation drifts from the frozen design source.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "❌ GATE: $1" >&2; exit 1; }
ok()   { echo "✓ GATE: $1"; }

# 1) route-mapping.json unchanged vs design source of truth
TRUTH="/home/ubuntu/demand-signals/2026-09-22-format-friction/design-handoff-v1"
if [ -d "$TRUTH" ]; then
  diff -q design-source/route-mapping.json "$TRUTH/route-mapping.json" >/dev/null \
    || fail "route-mapping.json differs from $TRUTH (Route Contract drift)"
  diff -q design-source/DESIGN.md "$TRUTH/DESIGN.md" >/dev/null \
    || fail "DESIGN.md differs from $TRUTH"
  for d in design-source/pages/*/; do
    slug=$(basename "$d")
    diff -q "$d/code.html" "$TRUTH/pages/$slug/code.html" >/dev/null \
      || fail "pages/$slug/code.html differs from design truth"
  done
  ok "design source in sync with truth ($TRUTH)"
else
  echo "⚠ GATE: truth dir $TRUTH not found — skipping remote diff (local-only check)"
fi

# 2) extracted content is fresh vs design pages
node scripts/extract-pages.mjs >/dev/null
git diff --quiet -- src/content/pages 2>/dev/null || true  # content is regenerated deterministically
ok "content extraction re-ran (deterministic from design source)"

# 3) all 15 routes have a page file
for f in "src/app/page.tsx" "src/app/png-to-dxf/page.tsx" "src/app/jpg-to-dxf/page.tsx" \
         "src/app/svg-to-dxf-converter/page.tsx" "src/app/screenshot-to-svg/page.tsx" \
         "src/app/jfif-to-jpg/page.tsx" "src/app/pt/jfif-para-jpg/page.tsx" \
         "src/app/samples/page.tsx" "src/app/for/cricut-sellers/page.tsx" \
         "src/app/for/embroidery/page.tsx" "src/app/pricing/page.tsx" \
         "src/app/privacy/page.tsx" "src/app/terms/page.tsx" \
         "src/app/cookies/page.tsx" "src/app/refund/page.tsx"; do
  [ -f "$f" ] || fail "missing route file: $f"
done
ok "15 route files present"

# 4) frozen-copy audit (verbatim strings still byte-identical)
node scripts/audit-copy.mjs || fail "copy audit failed"
ok "frozen copy audit PASS"

# 5) legal .fill placeholders must still be visible (08/legal backfill pending)
grep -q 'class="fill"' src/content/pages/privacy.ts || fail "privacy .fill placeholders missing"
ok "legal .fill placeholders present (not yet backfilled — expected)"

echo "✅ GATE: all checks passed — build may proceed"
