#!/usr/bin/env python3
"""Build all 15 routes of the CleanPaths design handoff."""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
import pages_home, pages_dxf, pages_light, pages_samples, pages_people, pages_legal

BASE = os.path.join(os.path.dirname(__file__), "..", "pages")

PAGES = [
    ("home", pages_home.build, pages_home.build_states, "/"),
    ("png-to-dxf", pages_dxf.build_png, pages_dxf.build_png_states, "/png-to-dxf"),
    ("jpg-to-dxf", pages_dxf.build_jpg, pages_dxf.build_jpg_states, "/jpg-to-dxf"),
    ("svg-to-dxf-converter", pages_dxf.build_svg, pages_dxf.build_svg_states, "/svg-to-dxf-converter"),
    ("screenshot-to-svg", pages_light.build_shot, pages_light.build_shot_states, "/screenshot-to-svg"),
    ("jfif-to-jpg", pages_light.build_jfif, pages_light.build_jfif_states, "/jfif-to-jpg"),
    ("pt-jfif-para-jpg", pages_light.build_pt, pages_light.build_pt_states, "/pt/jfif-para-jpg"),
    ("samples", pages_samples.build, None, "/samples"),
    ("for-cricut-sellers", pages_people.build_cricut, None, "/for/cricut-sellers"),
    ("for-embroidery", pages_people.build_embroidery, None, "/for/embroidery"),
    ("pricing", pages_people.build_pricing, None, "/pricing"),
    ("privacy", lambda: pages_legal.build_legal("/privacy"), None, "/privacy"),
    ("terms", lambda: pages_legal.build_legal("/terms"), None, "/terms"),
    ("cookies", lambda: pages_legal.build_legal("/cookies"), None, "/cookies"),
    ("refund", lambda: pages_legal.build_legal("/refund"), None, "/refund"),
]

def main():
    for slug, builder, states_builder, route in PAGES:
        d = os.path.join(BASE, slug)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "code.html"), "w", encoding="utf-8") as f:
            f.write(builder())
        print("built", route, "->", slug + "/code.html")
        if states_builder:
            with open(os.path.join(d, "states.html"), "w", encoding="utf-8") as f:
                f.write(states_builder())
            print("built", route, "->", slug + "/states.html")

if __name__ == "__main__":
    main()
