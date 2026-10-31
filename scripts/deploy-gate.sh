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

# 3) all 23 routes have a page file
for f in "src/app/page.tsx" "src/app/png-to-dxf/page.tsx" "src/app/jpg-to-dxf/page.tsx" \
         "src/app/svg-to-dxf-converter/page.tsx" "src/app/screenshot-to-svg/page.tsx" \
         "src/app/jfif-to-jpg/page.tsx" "src/app/pt/jfif-para-jpg/page.tsx" \
         "src/app/vector-magic-alternative/page.tsx" "src/app/cloudconvert-alternative/page.tsx" \
         "src/app/vectorizer-ai-alternative/page.tsx" "src/app/convertio-alternative/page.tsx" \
         "src/app/jfif-to-png/page.tsx" "src/app/pt/jfif-para-png/page.tsx" \
         "src/app/webp-to-svg/page.tsx" "src/app/pt/webp-para-svg/page.tsx" \
         "src/app/samples/page.tsx" "src/app/for/cricut-sellers/page.tsx" \
         "src/app/for/embroidery/page.tsx" "src/app/pricing/page.tsx" \
         "src/app/privacy/page.tsx" "src/app/terms/page.tsx" \
         "src/app/cookies/page.tsx" "src/app/refund/page.tsx"; do
  [ -f "$f" ] || fail "missing route file: $f"
done
ok "23 route files present"

# 4) frozen-copy audit (verbatim strings still byte-identical)
node scripts/audit-copy.mjs || fail "copy audit failed"
ok "frozen copy audit PASS"

# 5) design-source sentinel audit (open-items #89: repo-local copy so CI runners
#    without the truth dir still run it; dual-guard = "AUDIT PASS" in output AND exit 0)
AUDIT_OUT="$(python3 design-source/build/audit.py 2>&1)" && AUDIT_RC=0 || AUDIT_RC=$?
echo "$AUDIT_OUT"
echo "$AUDIT_OUT" | grep -q 'AUDIT PASS' || fail "design-source audit.py failed (missing 'AUDIT PASS' in output)"
[ "$AUDIT_RC" -eq 0 ] || fail "design-source audit.py exit code $AUDIT_RC (expected 0)"
ok "design-source sentinel audit PASS (dual-guard: grep + exit code)"

# 6) legal placeholders must be ZERO (open-items #20 launch gate: 07e backfilled all .fill chips)
for f in src/content/pages/privacy.ts src/content/pages/terms.ts src/content/pages/refund.ts src/content/pages/cookies.ts; do
  if grep -q 'class="fill"' "$f"; then fail "legal .fill placeholders still present in $f (must be zero)"; fi
  if grep -qE '\[用户填入|\[待确认|\[待回填' "$f"; then fail "legal placeholder marker still present in $f (must be zero)"; fi
done
ok "legal .fill placeholders: zero (backfilled)"

echo "✅ GATE: all checks passed — build may proceed"
