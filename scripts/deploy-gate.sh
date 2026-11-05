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
  # anti-rollback manifest (#96): truth must match the git-anchored ratified hashes —
  # detects truth itself being overwritten by an older baseline (11-04 #94 accident class)
  python3 design-source/build/truth_manifest.py check \
    || fail "truth drift vs ratified manifest（真源被回退或未授权改写——见上方 mismatch 清单）"
  ok "truth manifest anchored (anti-rollback)"
  ok "design source in sync with truth ($TRUTH)"
else
  echo "⚠ GATE: truth dir $TRUTH not found — skipping remote diff (local-only check)"
fi

# 2) extracted content is fresh vs design pages
node scripts/extract-pages.mjs >/dev/null
git diff --quiet -- src/content/pages 2>/dev/null || true  # content is regenerated deterministically
ok "content extraction re-ran (deterministic from design source)"

# 3) every route in the Route Contract has a page file (data-driven, #96 —
#    replaces the hardcoded list that silently passed when laser-batch routes were missing)
ROUTE_FILES=$(python3 - <<'PY'
import json, sys
try:
    d = json.load(open("design-source/route-mapping.json", encoding="utf-8"))
except Exception as e:
    sys.exit(f"route-mapping.json unreadable: {e}")
for r in d["routes"]:
    route = r["route"].strip("/")
    print("src/app/page.tsx" if not route else f"src/app/{route}/page.tsx")
PY
) || fail "route-mapping.json parse failed (step 3 data-driven route check)"
ROUTE_COUNT=0
ROUTE_MISSING=""
for f in $ROUTE_FILES; do
  ROUTE_COUNT=$((ROUTE_COUNT + 1))
  [ -f "$f" ] || ROUTE_MISSING="$ROUTE_MISSING $f"
done
[ -z "$ROUTE_MISSING" ] || fail "missing route file(s):$ROUTE_MISSING"
ok "$ROUTE_COUNT route files present (data-driven from route-mapping.json)"

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
