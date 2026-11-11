#!/usr/bin/env bash
# truth_write_guard.sh — write-protection + receipt protocol for the design truth dir (#96)
#
# The ONLY legal write flow for the truth dir:
#   unlock -> precheck (stop on mismatch) -> write -> seal -> lock
#
# Subcommands:
#   unlock    chmod -R u+w  the truth dir
#   lock      chmod -R a-w  the truth dir
#   precheck  verify truth vs the effective ratified baseline (see below), then
#             drop a self-contained pre-write snapshot + declare the authorized
#             write scope (allow-list of relpaths or globs, via args and/or
#             $TRUTH_ALLOW). Re-run precheck to refresh scope/snapshot.
#   seal      1) drift check CURRENT TRUTH vs PRE-WRITE SNAPSHOT (not the repo
#                anchor — v1.8 first-batch chicken-egg fix, 2026-11-11):
#                  - snapshot missing                       -> REFUSE
#                  - snapshot older than 24h                -> REFUSE (rerun precheck)
#                  - drift outside the declared allow-list  -> REFUSE (names each file)
#                drift inside the allow-list is listed as AUTHORIZED and passes.
#                The old repo-anchor comparison is kept as WARNING-level info.
#             2) repack design-handoff-v1.zip (zip -r + testzip self-check).
#                IDEMPOTENT RE-SEAL: when drift vs snapshot is exactly zero
#                (and the zip exists and the sealed manifest draft is current),
#                the zip already represents the truth byte-for-byte; repacking
#                is SKIPPED so the zip (and its sha256 receipt) stays stable
#                across zero-change re-seals. The existing zip is still
#                integrity-verified (unzip -t).
#             3) emit new manifest draft build/truth-manifest.sha256.new
#                (downstream sync ticket MUST copy it into the repo in the same commit)
#             4) append one receipt line to build/truth-receipts.log
#                (ISO time / actor=$TRUTH_ACTOR / note=$TRUTH_NOTE / changed files / ZIP sha256)
#
# Snapshot coverage: the FULL truth tree (sha256sum-format lines, same format as
# truth-manifest — 同构), excluding __pycache__ / *.pyc. Full-tree (not just the
# manifest coverage set) so seal can distinguish "zero-change re-seal" from
# "out-of-coverage artifacts changed" (screenshots, build scripts) and only
# skip the repack for the former.
#
# Effective ratified baseline for precheck: build/truth-manifest.sha256.new when
# present (latest sealed state not yet synced into the repo), else the
# repo-anchored manifest. This keeps precheck fail-closed against #94-class
# rollbacks while allowing the sealed-but-unsynced window between batches.
#
# Snapshot lives at $FACTS/.truth-pre-write.snapshot — OUTSIDE the truth dir on
# purpose: inside build/ it would be packed into the zip and would bump the
# build/ dir mtime, both breaking zip_sha256 reproducibility across re-seals.
#
# NOTE: chmod is a workflow speed-bump, not a permission wall (same user can reverse it).
# It exists to stop UNCONSCIOUS old-baseline overwrites, not malice.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${TRUTH_GUARD_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"          # design-handoff-v1
FACTS="${TRUTH_GUARD_FACTS:-$(cd "$ROOT/.." && pwd)}"               # facts dir (zip lives here)
BUILD_DIR="$ROOT/build"
ZIP="$FACTS/design-handoff-v1.zip"
REPO_MANIFEST="${TRUTH_GUARD_REPO_MANIFEST:-/home/ubuntu/projects/cleanpaths/design-source/build/truth-manifest.sha256}"
MANIFEST_PY="${TRUTH_GUARD_MANIFEST_PY:-/home/ubuntu/projects/cleanpaths/design-source/build/truth_manifest.py}"
NEW_MANIFEST="$BUILD_DIR/truth-manifest.sha256.new"
RECEIPTS="$BUILD_DIR/truth-receipts.log"
SNAPSHOT="${TRUTH_GUARD_SNAPSHOT:-$FACTS/.truth-pre-write.snapshot}"
MAX_SNAPSHOT_AGE_SECONDS=$((24*3600))

# hash_tree — full-truth-tree hashes, sha256sum format (excludes __pycache__ / *.pyc)
hash_tree() {
python3 - "$ROOT" <<'PY'
import os, sys, hashlib
root = sys.argv[1]
out = []
for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = sorted(d for d in dirnames if d != "__pycache__")
    for fn in sorted(filenames):
        if fn.endswith(".pyc"):
            continue
        full = os.path.join(dirpath, fn)
        rel = os.path.relpath(full, root).replace(os.sep, "/")
        h = hashlib.sha256()
        with open(full, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
        out.append((rel, h.hexdigest()))
for rel, h in sorted(out):
    print(f"{h}  {rel}")
PY
}

check_repo_anchor() {
  python3 "$MANIFEST_PY" check --truth "$ROOT" --manifest "$REPO_MANIFEST"
}

cmd_unlock() {
  chmod -R u+w "$ROOT"
  echo "UNLOCKED: $ROOT (u+w) — remember: precheck -> write -> seal -> lock"
}

cmd_lock() {
  chmod -R a-w "$ROOT"
  echo "LOCKED: $ROOT (a-w)"
}

# precheck [authorized-relpath-or-glob ...]   (also reads $TRUTH_ALLOW, whitespace-separated)
cmd_precheck() {
  local -a allow=("$@")
  if [ -n "${TRUTH_ALLOW:-}" ]; then
    # shellcheck disable=SC2206
    allow+=($TRUTH_ALLOW)
  fi
  local a
  for a in ${allow[@]+"${allow[@]}"}; do
    [ -n "$a" ] || continue
    case "$a" in
      /*|*..*) echo "PRECHECK FAIL — allow-list entry must be a relative path inside the truth dir: $a" >&2; exit 1 ;;
    esac
  done

  local baseline baseline_kind
  if [ -f "$NEW_MANIFEST" ]; then
    baseline="$NEW_MANIFEST"; baseline_kind="sealed-draft (build/truth-manifest.sha256.new)"
  else
    baseline="$REPO_MANIFEST"; baseline_kind="repo-anchor"
  fi

  echo "precheck: verifying truth vs $baseline_kind"
  if ! python3 "$MANIFEST_PY" check --truth "$ROOT" --manifest "$baseline"; then
    echo "PRECHECK FAIL — truth drifted vs $baseline_kind. STOP. Report to zhongshu before touching anything." >&2
    if [ "$baseline" != "$REPO_MANIFEST" ]; then
      echo "---- diagnostics: truth vs repo anchor ----" >&2
      check_repo_anchor >&2 || true
      echo "--------------------------------------------" >&2
    fi
    exit 1
  fi

  # WARNING-level repo-anchor comparison (informational, non-blocking).
  if [ "$baseline" != "$REPO_MANIFEST" ]; then
    if check_repo_anchor >/dev/null 2>&1; then
      echo "info: truth also matches repo anchor"
    else
      echo "WARNING (non-blocking): truth drifted vs repo anchor — expected while a sealed draft awaits repo sync (07 batch2 ticket)."
    fi
  fi

  {
    echo "#snapshot-v1"
    echo "#created_at: $(date -Iseconds)"
    echo "#created_epoch: $(date +%s)"
    echo "#actor: ${TRUTH_ACTOR:-unknown}"
    echo "#truth: $ROOT"
    echo "#baseline_kind: $baseline_kind"
    echo "#baseline_path: $baseline"
    for a in ${allow[@]+"${allow[@]}"}; do
      [ -n "$a" ] && echo "#allow: $a"
    done
    hash_tree
  } > "$SNAPSHOT.tmp"
  mv "$SNAPSHOT.tmp" "$SNAPSHOT"
  echo "PRECHECK PASS — truth matches $baseline_kind"
  echo "  pre-write snapshot: $SNAPSHOT (authorized scope: ${#allow[@]} pattern(s); valid ${MAX_SNAPSHOT_AGE_SECONDS}s)"
}

cmd_seal() {
  local actor="${TRUTH_ACTOR:-unknown}"
  local note="${TRUTH_NOTE:-(no note)}"
  echo "seal: step 1/4 — drift check vs pre-write snapshot (refuse to seal undeclared drift)"
  if [ ! -f "$SNAPSHOT" ]; then
    echo "SEAL REFUSED — no pre-write snapshot at $SNAPSHOT." >&2
    echo "  Sealing without a precheck is forbidden. Run: truth_write_guard.sh precheck [authorized files...]" >&2
    exit 1
  fi
  local cur_hashes verdict
  cur_hashes=$(mktemp)
  hash_tree > "$cur_hashes"
  verdict=$(python3 - "$SNAPSHOT" "$ROOT" "$cur_hashes" "$MAX_SNAPSHOT_AGE_SECONDS" <<'PY'
import fnmatch, sys, time

snap_path, truth, cur_path, max_age = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])

lines = open(snap_path, encoding="utf-8").read().splitlines()
hdr, snap_hashes = {}, {}
for line in lines:
    if line.startswith("#"):
        body = line[1:]
        if ":" in body:
            k, v = body.split(":", 1)
            hdr.setdefault(k.strip(), []).append(v.strip())
    elif line.strip():
        h, rel = line.split("  ", 1)
        snap_hashes[rel.strip()] = h

if hdr.get("truth", [""])[0] != truth:
    print(f"SEAL REFUSED — snapshot was taken for a different truth dir: {hdr.get('truth',['?'])[0]}", file=sys.stderr)
    sys.exit(1)

try:
    created = int(hdr["created_epoch"][0])
except Exception:
    print("SEAL REFUSED — snapshot header corrupt (no created_epoch). Rerun precheck.", file=sys.stderr)
    sys.exit(1)
age = int(time.time()) - created
if age > max_age:
    print(f"SEAL REFUSED — pre-write snapshot is stale (age {age}s > {max_age}s). Rerun precheck.", file=sys.stderr)
    sys.exit(1)

allow = hdr.get("allow", [])
def is_allowed(rel):
    return any(fnmatch.fnmatchcase(rel, pat) for pat in allow)

cur_hashes = {}
for line in open(cur_path, encoding="utf-8").read().splitlines():
    if line.strip():
        h, rel = line.split("  ", 1)
        cur_hashes[rel.strip()] = h

authorized, unauthorized = [], []
for rel in sorted(set(snap_hashes) | set(cur_hashes)):
    if snap_hashes.get(rel) == cur_hashes.get(rel):
        continue
    if rel not in snap_hashes:
        entry = f"UNTRACKED {rel}  (new vs pre-write snapshot)"
    elif rel not in cur_hashes:
        entry = f"MISSING   {rel}  (deleted vs pre-write snapshot)"
    else:
        entry = f"MISMATCH  {rel}  (modified vs pre-write snapshot)"
    (authorized if is_allowed(rel) else unauthorized).append(entry)

for e in authorized:
    print(f"  AUTHORIZED-DRIFT {e}")
if unauthorized:
    print("SEAL REFUSED — drift outside the authorized scope declared at precheck:", file=sys.stderr)
    for e in unauthorized:
        print(f"  {e}", file=sys.stderr)
    print("  Restore these files, or rerun precheck with a corrected authorized scope (report zhongshu first).", file=sys.stderr)
    sys.exit(1)
print(f"  snapshot OK (age {age}s, authorized drift {len(authorized)} file(s), undeclared drift 0)")
print(f"VERDICT drift={len(authorized)}")
PY
) || { rm -f "$cur_hashes"; exit 1; }
  rm -f "$cur_hashes"
  printf '%s\n' "$verdict" | grep -v '^VERDICT '
  local drift
  drift=$(printf '%s\n' "$verdict" | sed -n 's/^VERDICT drift=//p')
  # WARNING-level repo-anchor comparison (informational, non-blocking).
  if check_repo_anchor >/dev/null 2>&1; then
    echo "  info: truth matches repo anchor"
  else
    echo "  WARNING (non-blocking): truth drifted vs repo anchor — reminder: sync build/truth-manifest.sha256.new into the repo with the next design-source sync commit."
  fi
  rm -f "$SNAPSHOT"   # single-use: a successful step-1 consumes the snapshot
  local zip_sha
  if [ "$drift" = "0" ] && [ -f "$ZIP" ] && [ -f "$NEW_MANIFEST" ] && \
     python3 "$MANIFEST_PY" gen --truth "$ROOT" | cmp -s - "$NEW_MANIFEST"; then
    echo "seal: step 2/4 — zero drift vs snapshot; existing zip already represents the truth, SKIP repack (idempotent re-seal)"
    unzip -t "$ZIP" >/dev/null && echo "  testzip OK (existing zip)"
    zip_sha=$(sha256sum "$ZIP" | awk '{print $1}')
  else
    echo "seal: step 2/4 — repack $ZIP"
    cd "$FACTS"
    zip -qr "$ZIP" "$(basename "$ROOT")"
    unzip -t "$ZIP" >/dev/null && echo "  testzip OK"
    zip_sha=$(sha256sum "$ZIP" | awk '{print $1}')
  fi
  echo "seal: step 3/4 — emit new manifest draft -> $NEW_MANIFEST"
  TRUTH_DIR="$ROOT" python3 "$MANIFEST_PY" gen --truth "$ROOT" > "$NEW_MANIFEST"
  echo "seal: step 4/4 — receipt"
  local changed
  changed=$(python3 - "$REPO_MANIFEST" "$NEW_MANIFEST" <<'PY'
import sys
def load(p):
    d = {}
    for line in open(p, encoding="utf-8"):
        line = line.rstrip("\n")
        if line.strip():
            h, rel = line.split("  ", 1)
            d[rel.strip()] = h
    return d
old, new = load(sys.argv[1]), load(sys.argv[2])
keys = set(old) | set(new)
print(sum(1 for k in keys if old.get(k) != new.get(k)))
PY
)
  printf '%s | actor=%s | note=%s | changed_files=%s | zip_sha256=%s\n' \
    "$(date -Iseconds)" "$actor" "$note" "$changed" "$zip_sha" >> "$RECEIPTS"
  echo "SEALED: changed_files=$changed zip_sha256=$zip_sha"
  echo "  receipt appended: $RECEIPTS"
  echo "  REMINDER: sync $NEW_MANIFEST into repo design-source/build/truth-manifest.sha256 (same commit as design-source sync) or the gate goes red — that is a feature, not a bug."
}

case "${1:-}" in
  unlock)   cmd_unlock ;;
  lock)     cmd_lock ;;
  precheck) shift; cmd_precheck "$@" ;;
  seal)     cmd_seal ;;
  *) echo "usage: $0 {unlock|lock|precheck [authorized-relpath-or-glob ...]|seal}" >&2; exit 2 ;;
esac
