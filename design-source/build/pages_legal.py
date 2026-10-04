#!/usr/bin/env python3
"""Legal pages: /privacy /terms /cookies /refund.
Container intro copy verbatim from 05 §0.9; body verbatim from 03-compliance-v1/*.md
(simple markdown→HTML; [用户填入]/[待回填] placeholders rendered as visible .fill chips)."""
import re, os
from components import page

SRC = "/home/ubuntu/demand-signals/2026-09-22-format-friction/03-compliance-v1"

def md_to_html(md_text, skip_title=True):
    lines = md_text.split("\n")
    html, i = [], 0
    in_table = False
    list_type = None

    def inline(t):
        t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
        t = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", t)
        t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
        t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', t)
        # mark placeholders
        t = re.sub(r"\[(?:用户填入|待回填|待确认)[^\]]*\]", r'<span class="fill">\g<0></span>', t)
        return t

    def close_list():
        nonlocal list_type
        if list_type:
            html.append(f"</{list_type}>")
            list_type = None

    def close_table():
        nonlocal in_table
        if in_table:
            html.append("</tbody></table></div>")
            in_table = False

    while i < len(lines):
        ln = lines[i].rstrip()
        if skip_title and ln.startswith("# "):
            i += 1
            continue
        if ln.startswith("> ⚠️") or ln.startswith("> 与 "):
            i += 1
            continue  # internal notes, not page copy
        if re.match(r"^\|.*\|$", ln):
            close_list()
            cells = [c.strip() for c in ln.strip("|").split("|")]
            if all(re.match(r"^:?-{2,}:?$", c) for c in cells):
                i += 1
                continue
            if not in_table:
                html.append('<div class="table-scroll"><table><tbody>')
                in_table = True
                html.append("<tr>" + "".join(f"<th>{inline(c)}</th>" for c in cells) + "</tr>")
            else:
                html.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in cells) + "</tr>")
            i += 1
            continue
        close_table()
        if ln.startswith("### "):
            close_list(); html.append(f"<h3>{inline(ln[4:])}</h3>")
        elif ln.startswith("## "):
            close_list(); html.append(f"<h2>{inline(ln[3:])}</h2>")
        elif ln.startswith("- "):
            if list_type != "ul":
                close_list(); html.append("<ul>"); list_type = "ul"
            html.append(f"<li>{inline(ln[2:])}</li>")
        elif re.match(r"^\d+\.\s", ln):
            if list_type != "ol":
                close_list(); html.append("<ol>"); list_type = "ol"
            item_text = re.sub(r"^\d+\.\s", "", ln)
            html.append(f"<li>{inline(item_text)}</li>")
        elif ln.strip() == "" or ln.strip() == "---":
            close_list()
        else:
            close_list()
            html.append(f"<p>{inline(ln)}</p>")
        i += 1
    close_list(); close_table()
    return "\n".join(html)

CONTAINER = {
    "/privacy": "The one-line version: your files never leave your device — conversion happens in your browser, and there is no upload step. The details below are written to be read, not hidden.",
    "/terms": "The honest version of our quality boundaries lives here in plain English (§1), along with the usual legal terms. Short version: flat-color graphics are designed for cut-ready output, photos come out stylized, and you always test-cut before production.",
}

TITLES = {
    "/privacy": ("Privacy Policy | CleanPaths", "Privacy Policy", "How cleanpaths.io handles data — short version: your files never leave your device."),
    "/terms": ("Terms of Service | CleanPaths", "Terms of Service", "The terms for using cleanpaths.io, including our honest quality boundaries in plain English."),
    "/cookies": ("Cookie Policy | CleanPaths", "Cookie Policy", "No tracking cookies, no consent banner — what your browser stores and why."),
    "/refund": ("Refund Policy | CleanPaths", "Refund Policy", "30-day, no-questions-asked refunds on one-time purchases; Monthly Pass terms."),
}

FILES = {
    "/privacy": "privacy-policy-en.md",
    "/terms": "terms-of-service-en.md",
    "/cookies": "cookie-policy-en.md",
    "/refund": "refund-policy-en.md",
}

def build_legal(route):
    with open(os.path.join(SRC, FILES[route]), encoding="utf-8") as f:
        md = f.read()
    body_html = md_to_html(md)
    title, h1, desc = TITLES[route]
    intro = CONTAINER.get(route)
    intro_html = f'<div class="intro-line">{intro}</div>' if intro else ""
    body = f"""
<section class="section">
  <div class="wrap">
    <div class="legal">
      <span class="spec">Legal · plain English</span>
      <h1 style="margin-top:12px">{h1}</h1>
      {intro_html}
      {body_html}
    </div>
  </div>
</section>"""
    return page(title, desc, body, active_route=route)
