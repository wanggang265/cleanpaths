#!/usr/bin/env python3
"""Render desktop+mobile screenshots for every page via headless Chrome."""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.path.join(os.path.dirname(__file__), "..", "pages")
SLUGS = ["home", "png-to-dxf", "jpg-to-dxf", "svg-to-dxf-converter", "screenshot-to-svg",
         "jfif-to-jpg", "pt-jfif-para-jpg", "samples", "for-cricut-sellers",
         "for-embroidery", "pricing", "privacy", "terms", "cookies", "refund",
         "vector-magic-alternative", "cloudconvert-alternative",
         "vectorizer-ai-alternative", "convertio-alternative",
         "jfif-to-png", "pt-jfif-para-png", "webp-to-svg", "pt-webp-para-svg",
         "webp-to-png", "pt-webp-para-png", "webp-to-jpg", "pt-webp-para-jpg",
         "svg-to-png", "pt-svg-para-png", "jpeg-to-jpg", "pt-jpeg-para-jpg",
         "svg-to-jpg", "pt-svg-para-jpg", "gif-to-jpg", "pt-gif-para-jpg",
         "bmp-to-jpg", "pt-bmp-para-jpg", "jpeg-to-dxf", "pt-jpeg-para-dxf"]

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/google-chrome",
                                    args=["--no-sandbox", "--force-device-scale-factor=1"])
        for slug in SLUGS:
            path = os.path.abspath(os.path.join(BASE, slug, "code.html"))
            if not os.path.exists(path):
                print("MISSING", slug); continue
            # desktop
            pg = browser.new_page(viewport={"width": 1440, "height": 900})
            pg.goto("file://" + path, wait_until="networkidle")
            pg.wait_for_timeout(400)
            pg.screenshot(path=os.path.join(BASE, slug, "screen.png"), full_page=True)
            pg.close()
            # mobile
            pg = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True)
            pg.goto("file://" + path, wait_until="networkidle")
            pg.wait_for_timeout(400)
            pg.screenshot(path=os.path.join(BASE, slug, "screen-mobile.png"), full_page=True)
            pg.close()
            print("shot", slug)
            # states board (desktop only)
            spath = os.path.abspath(os.path.join(BASE, slug, "states.html"))
            if os.path.exists(spath):
                pg = browser.new_page(viewport={"width": 1440, "height": 900})
                pg.goto("file://" + spath, wait_until="networkidle")
                pg.wait_for_timeout(400)
                pg.screenshot(path=os.path.join(BASE, slug, "states.png"), full_page=True)
                pg.close()
                print("shot", slug, "states")
        browser.close()

if __name__ == "__main__":
    main()
