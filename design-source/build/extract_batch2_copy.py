#!/usr/bin/env python3
"""Extract v1.15 batch-2 slot tables -> batch2_copy.json (key -> ordered string list).
Backtick-aware pipe splitting (frozen strings contain literal |)."""
import re, json, os, sys

PROJ = "/home/ubuntu/demand-signals/2026-09-22-format-friction"
SRC = os.path.join(PROJ, "05-copy-freeze-v1.15-batch2-format-pairs-addendum.md")
OUT = os.path.join(PROJ, "design-handoff-v1", "build", "batch2_copy.json")
DIG = os.path.join(PROJ, "design-handoff-v1", "build", "batch2_digest.txt")

def split_cells(line):
    cells, cur, inbt = [], [], False
    for ch in line.rstrip("\n"):
        if ch == "`":
            inbt = not inbt
            cur.append(ch)
        elif ch == "|" and not inbt:
            cells.append("".join(cur))
            cur = []
        else:
            cur.append(ch)
    cells.append("".join(cur))
    return [c.strip() for c in cells]

COPY = {}   # key -> list of frozen strings (order preserved)
SLOT = {}   # key -> slot description
lines = open(SRC, encoding="utf-8").read().splitlines()
section = None
for ln in lines:
    m = re.match(r"^###\s+(\d+[AB])\b", ln)
    if m:
        section = m.group(1)
    if not ln.startswith("|"):
        continue
    cells = split_cells(ln)
    if len(cells) < 5:
        continue
    num = cells[1] if cells[0] == "" else cells[0]
    # normalize: leading empty cell from leading pipe
    if cells and cells[0] == "":
        cells = cells[1:]
    if len(cells) < 4:
        continue
    if not re.match(r"^\d+$|^—$", cells[0]):
        continue
    km = re.search(r"`([^`]+)`", cells[1])
    if not km:
        continue
    key = km.group(1)
    strings = re.findall(r"`([^`]+)`", cells[3])
    slot = re.sub(r"\s+", " ", cells[2])
    if key in COPY:
        sys.exit(f"dup key {key}")
    COPY[key] = strings
    SLOT[key] = (section, slot)

COPY = {k: v for k, (s, _) in SLOT.items() if s is not None for v in [COPY[k]]}
SLOT = {k: v for k, v in SLOT.items() if v[0] is not None}
json.dump({"copy": COPY, "slot": SLOT}, open(OUT, "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)

# digest: key | section | slot | n_strings | preview of each string
with open(DIG, "w", encoding="utf-8") as f:
    for k, ss in COPY.items():
        sec, slot = SLOT[k]
        f.write(f"{k}\t[{sec}]\t{slot}\tn={len(ss)}\n")
        for i, s in enumerate(ss):
            f.write(f"    {i}: {s[:90]}{'...' if len(s) > 90 else ''}\n")

# expected key counts per page (from work order table)
EXPECT = {"1A": 31, "2A": 31, "3A": 31, "4A": 32, "5A": 31, "6A": 32, "7A": 31, "8A": 50}
cnt = {}
none_keys = []
for k, (sec, _) in SLOT.items():
    cnt[sec] = cnt.get(sec, 0) + 1
    if sec is None:
        none_keys.append(k)
print("sections:", {str(s): n for s, n in sorted(cnt.items(), key=lambda x: str(x[0]))})
print("keys outside A/B sections:", none_keys)
bad = {s: (cnt.get(s, 0), n) for s, n in EXPECT.items() if cnt.get(s, 0) != n}
print("MISMATCH:", bad if bad else "none (EN A-sections match)")
print("total keys:", len(COPY))
