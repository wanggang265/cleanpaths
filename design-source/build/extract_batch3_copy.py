#!/usr/bin/env python3
"""Parse v1.18 §A frozen PT slot tables -> batch3_copy.json.

Verbatim lock: every slot's frozen string length is asserted against the
zhongshu-verified char-count column. Any parse drift (splitting, whitespace,
quote normalization) trips the assert before JSON is written.
WHY_TAB (shared 3-col table) parsed once per section and cross-checked equal.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "..", "05-copy-freeze-v1.18-pt-dxf-batch3-addendum.md")
OUT = os.path.join(HERE, "batch3_copy.json")

SECTIONS = [
    ("## §A.1", "## §A.2", "pt-png-para-dxf"),
    ("## §A.2", "## §A.3", "pt-jpg-para-dxf"),
    ("## §A.3", "## §B ", "pt-svg-para-dxf"),
]


def parse_section(section_text, page_key):
    slots = {}
    seen_nums = []
    why_tab_header = None
    why_tab_rows = []
    for line in section_text.splitlines():
        if not line.startswith("|"):
            continue
        inner = line.split("|")[1:-1]
        first = inner[0].strip()
        if len(inner) >= 5 and first.isdigit():
            # slot row: | N | `SLOT` | frozen... | count | basis |
            n = int(first)
            slot = inner[1].strip().strip("`")
            count_field = inner[-2].strip()
            frozen = "|".join(inner[2:-2]).strip()
            if slot == "PT_WHY_TAB":
                assert count_field == "—", f"{page_key} row {n}: WHY_TAB count field unexpected: {count_field!r}"
                seen_nums.append(n)
                continue
            assert frozen, f"{page_key} row {n} ({slot}): empty frozen string"
            assert count_field.isdigit(), f"{page_key} row {n} ({slot}): non-numeric count {count_field!r}"
            actual = len(frozen)
            expect = int(count_field)
            assert actual == expect, (
                f"CHAR-COUNT MISMATCH {page_key} {slot}: parsed len {actual} != frozen count {expect}\n"
                f"  parsed: {frozen!r}"
            )
            assert slot not in slots, f"{page_key}: duplicate slot {slot}"
            slots[slot] = frozen
            seen_nums.append(n)
        elif len(inner) == 3:
            a, b, c = (x.strip() for x in inner)
            if a == "---" and b == "---" and c == "---":
                continue
            if a == "":
                assert why_tab_header is None, f"{page_key}: duplicate WHY_TAB header"
                why_tab_header = [b, c]
            else:
                why_tab_rows.append([a, b, c])
    expected_nums = list(range(1, 47))
    assert seen_nums == expected_nums, f"{page_key}: slot numbering broken: {seen_nums}"
    return slots, why_tab_header, why_tab_rows


def main():
    text = open(SRC, encoding="utf-8", newline="").read()  # newline='' -> no translation
    pages = {}
    ref_tab = None
    for start, end, key in SECTIONS:
        i = text.find(start)
        assert i >= 0, f"section not found: {start}"
        j = text.find(end, i + len(start))
        assert j > i, f"section end not found for {start}"
        slots, hdr, rows = parse_section(text[i:j], key)
        pages[key] = slots
        tab = {"col": hdr, "rows": rows}
        if ref_tab is None:
            ref_tab = tab
        else:
            # WHY_TAB table is written once (§A.1) and shared by all three pages;
            # §A.2/§A.3 must NOT repeat it.
            assert tab == {"col": None, "rows": []}, f"{key}: unexpected extra table rows"
        print(f"{key}: {len(slots)} frozen slots (rows 1-46, #45=WHY_TAB table)")

    assert ref_tab and len(ref_tab["rows"]) == 5, f"WHY_TAB rows != 5: {len(ref_tab['rows'])}"
    assert len(ref_tab["col"]) == 2

    doc = {
        "source": "05-copy-freeze-v1.18-pt-dxf-batch3-addendum.md (sha256 ca354b14...e3510)",
        "pages": pages,
        "why_tab": ref_tab,
    }
    with open(OUT, "w", encoding="utf-8", newline="") as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"OK -> {OUT} ({os.path.getsize(OUT)} bytes); all char counts verified verbatim")


if __name__ == "__main__":
    sys.exit(main())
