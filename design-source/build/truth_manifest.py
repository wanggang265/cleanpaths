#!/usr/bin/env python3
"""truth_manifest.py — anti-rollback hash manifest for the design truth dir (#96).

Two subcommands (stdlib only):
  gen    compute manifest of the TRUTH dir, write sha256sum-format lines to stdout
  check  verify the truth dir against the repo-anchored manifest file;
         prints TRUTH MANIFEST PASS and exits 0 when every entry matches;
         lists every mismatch/missing/untracked file and exits 1 otherwise.

Coverage set = deploy-gate step 1 comparison set:
  route-mapping.json, DESIGN.md, build/audit.py, pages/*/code.html (globbed live).

Defaults (override via env or flags):
  truth dir : $TRUTH_DIR or the canonical design-handoff-v1 path
  manifest  : <this script's dir>/truth-manifest.sha256
"""
import sys, os, glob, hashlib

DEFAULT_TRUTH = "/home/ubuntu/demand-signals/2026-09-22-format-friction/design-handoff-v1"
HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_MANIFEST = os.path.join(HERE, "truth-manifest.sha256")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def coverage(truth):
    """Relative paths (posix) that the manifest covers, globbed live from truth."""
    rels = ["route-mapping.json", "DESIGN.md", "build/audit.py"]
    rels += sorted(
        os.path.relpath(p, truth) for p in glob.glob(os.path.join(truth, "pages", "*", "code.html"))
    )
    return [r.replace(os.sep, "/") for r in rels]


def cmd_gen(truth):
    for rel in coverage(truth):
        full = os.path.join(truth, rel)
        if not os.path.exists(full):
            print(f"gen: coverage file missing in truth: {rel}", file=sys.stderr)
            sys.exit(1)
        print(f"{sha256(full)}  {rel}")


def cmd_check(truth, manifest):
    if not os.path.exists(manifest):
        print(f"TRUTH MANIFEST FAIL: manifest not found: {manifest}", file=sys.stderr)
        sys.exit(1)
    expected = {}
    with open(manifest, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line.strip():
                continue
            digest, rel = line.split("  ", 1)
            expected[rel.strip()] = digest
    problems = []
    for rel, digest in sorted(expected.items()):
        full = os.path.join(truth, rel)
        if not os.path.exists(full):
            problems.append(f"MISSING   {rel}  (in manifest, absent in truth)")
        elif sha256(full) != digest:
            problems.append(f"MISMATCH  {rel}  (truth drifted vs ratified manifest)")
    for rel in coverage(truth):
        if rel not in expected:
            problems.append(f"UNTRACKED {rel}  (present in truth, not in ratified manifest)")
    if problems:
        print("TRUTH MANIFEST FAIL:", file=sys.stderr)
        for p in problems:
            print(f"  {p}", file=sys.stderr)
        sys.exit(1)
    print(f"TRUTH MANIFEST PASS ({len(expected)} files anchored)")


def main():
    args = sys.argv[1:]
    if not args or args[0] not in ("gen", "check"):
        print(__doc__)
        sys.exit(2)
    truth = os.environ.get("TRUTH_DIR", DEFAULT_TRUTH)
    manifest = os.environ.get("TRUTH_MANIFEST", DEFAULT_MANIFEST)
    rest = args[1:]
    i = 0
    while i < len(rest):
        if rest[i] == "--truth":
            truth = rest[i + 1]; i += 2
        elif rest[i] == "--manifest":
            manifest = rest[i + 1]; i += 2
        else:
            print(f"unknown arg: {rest[i]}", file=sys.stderr)
            sys.exit(2)
    if args[0] == "gen":
        cmd_gen(truth)
    else:
        cmd_check(truth, manifest)


if __name__ == "__main__":
    main()
