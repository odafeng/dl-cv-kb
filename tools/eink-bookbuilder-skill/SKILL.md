---
name: eink-bookbuilder
description: Compile online articles, GitHub README files, and Jupyter notebooks into a single e-ink-optimized PDF for BOOX, reMarkable, Kindle, or similar e-readers. Use this skill whenever the user asks to "make a PDF from articles", "compile articles for offline reading", "丟進 BOOX 看", "整理成 e-ink 格式", "做成 e-ink 友善 PDF", or wants to package multiple URLs into one readable PDF. Triggers on mentions of BOOX, e-ink readers, reMarkable, "compile these articles", "make a reading list PDF", "convert these to e-ink format", or batched URL→PDF requests. Use this even when the user only mentions one source — single-article e-ink PDFs are still valid use cases.
---

# eink-bookbuilder

Compile a list of online articles / GitHub READMEs / Jupyter notebooks into a single e-ink-friendly PDF — A5 portrait, large-print serif body, monospace code blocks with stripped syntax highlighting, generous line spacing, page numbers, chapter headers, and a TOC that supports tier groups.

## When to use

The user wants to **read something on an e-reader** (BOOX, reMarkable, Kindle, Pocketbook, etc.) and either:

- They've given you URLs to compile, or
- They've asked you to recommend articles AND package them as one PDF, or
- They want to convert a single long article to e-ink-friendly format.

If the deliverable is "a PDF I can sync to my e-reader" or "something I can read offline", this is the skill.

If the deliverable is "render this notebook for desktop viewing" or "make a printable PDF for office printing", this skill still works but the e-ink optimizations (large fonts, monochrome) may be wasted — mention this and offer a non-e-ink alternative.

## Workflow

1. **Classify each source** the user provides:
   - URLs ending in `.md` (especially `raw.githubusercontent.com/.../README.md`) → markdown
   - URLs ending in `.ipynb` (especially `raw.githubusercontent.com/.../foo.ipynb`) → notebook
   - All other web URLs → HTML article
   - Local file paths → use `add_local_markdown` or `add_local_notebook`

2. **Pick a style**:
   - `"prose"` for articles, blog posts, essays (default)
   - `"code"` for source-code-heavy content (notebooks, READMEs, technical docs)

3. **Write a recipe** — a Python script that imports `Book` from this skill's `eink_book.py`, configures the book, calls `build()`. See `examples/` for templates.

4. **Run the recipe** — output goes to `/mnt/user-data/outputs/`.

5. **Present the file** with `present_files`.

## Recipe template

```python
import sys
sys.path.insert(0, "<path-to-this-skill>/scripts")
from eink_book import Book

book = Book(
    title="Main Title",
    subtitle="Subtitle line",
    style="prose",  # or "code"
    meta_lines=[
        "A description line",
        "Compiled <month> <year>",
        "",
        "All content reproduced from original sources",
        "Copyrights remain with respective authors",
    ],
)

# Optional: hand-written intro chapter (HTML body, no source URL shown)
book.add_intro_html(
    "<h2>Why this collection</h2><p>...</p>",
    title="Reading Guide",
)

# Add chapters — order here = order in PDF
book.add_html_article(
    title="1. Some Article",
    url="https://example.com/post",
    selector="article",  # CSS selector for main content
)

book.add_markdown_url(
    title="2. A README",
    url="https://raw.githubusercontent.com/x/y/main/README.md",
)

book.add_notebook_url(
    title="3. A Notebook",
    url="https://raw.githubusercontent.com/x/y/main/foo.ipynb",
    tagline="One-line description shown above the content",
)

# Optional: organize TOC into tier groups (indices are 0-based,
# referring to non-intro chapters)
book.set_toc_groups([
    ("Tier 1 — Articles", [0, 1]),
    ("Tier 2 — Notebooks", [2]),
])

book.build("/mnt/user-data/outputs/my_book.pdf")
```

## Selector hints for HTML articles

The `selector` parameter accepts a comma-separated list, tried in order. The first match with >500 chars of text wins. Reasonable defaults by site:

| Site pattern | Selector |
|---|---|
| Anthropic engineering blog | `article` |
| Substack / blog platforms | `article, div.post-content, div.entry` |
| Mintlify docs | `div.prose, div#content-container, main` |
| Lil'Log (Lilian Weng) | `article, div.post-content` |
| Simon Willison's blog | `div.entry` |
| Generic fallback | `article, main, div.prose, div.entry` (the library default) |

If extraction comes out short (under 500 chars when the article is clearly longer), try a different selector. The library has a fallback that picks the largest div, but it's a last resort.

## What the skill handles automatically

- **Image fetching** during render (weasyprint pulls remote `<img src>` automatically — note this requires network access)
- **Original `<h1>` removal** (the chapter title injected by the skill replaces it)
- **Heading demotion** (h2 → h3, h3 → h4, etc., so the chapter title is the only h1)
- **Code block desyntax-highlighting** (e-ink renders best in pure black; CSS forces `color: #000`)
- **Notebook image output skipping** (base64 PNG outputs are dropped — they balloon file size and look bad on e-ink; markdown discussion of the image stays)
- **Long stream output truncation** (over 3000 chars gets truncated to first 1500 + last 1000)
- **Cover page, TOC, page numbers, chapter headers** — fully automatic

## Things to ask the user about

If the request is ambiguous, ask before building:

- **Title and subtitle** if they're not obvious (e.g. user said "compile these")
- **Style choice** (prose vs code) if the content mix is unclear
- **TOC grouping** if there are 5+ chapters — offer to organize into tiers

If the request is unambiguous (clear sources, clear topic, ≤4 chapters), just go.

## Examples

`examples/01_reading_list.py` — multi-tier reading list of essays
`examples/02_mcp_servers.py` — collection of GitHub READMEs
`examples/03_cookbook.py` — Jupyter notebook compilation

Each example is a standalone runnable recipe — read them before writing your own.

## Defaults the user might want to override

- **A5 portrait** — fixed in CSS. Edit `_CSS_BASE` in `scripts/eink_book.py` to change. A4 doubles the page area; A6 halves it.
- **11.5pt body** — fixed. Older readers may want 12.5pt+; smaller readers (Kindle Oasis) may want 10pt.
- **Image rendering** — enabled by default (weasyprint fetches them). For pure-text PDFs that are smaller and faster, the user can skip image-heavy notebooks.

If the user explicitly requests A4 or different fonts, edit the CSS in `eink_book.py` for that one build (don't permanently change the file).

## Dependencies

The skill uses Python packages: `beautifulsoup4`, `lxml`, `markdown`, `weasyprint`, `pypdf`. The Claude execution environment may need:

```bash
pip install --break-system-packages beautifulsoup4 lxml markdown weasyprint pypdf
```

`Book.build()` will raise an `ImportError` with this hint if anything is missing.

## Output

`build()` returns the output path. Always copy to `/mnt/user-data/outputs/` (the function will write directly there if you give it that path) and present with `present_files`.
