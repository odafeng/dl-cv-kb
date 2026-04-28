# eink-bookbuilder

A Claude Skill that compiles online articles, GitHub READMEs, and Jupyter notebooks into single e-ink-optimized PDFs for offline reading on BOOX, reMarkable, Kindle, or similar e-readers.

## What this is

This is a [Claude Skill](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — a packaged capability that Claude loads on demand when relevant tasks come up. With this skill installed, asking Claude something like *"compile these articles into a PDF I can read on my BOOX"* will trigger an automated pipeline that:

1. Fetches each source URL (HTML article / raw markdown / `.ipynb` notebook)
2. Extracts main content, strips chrome (nav, sidebar, share buttons)
3. Demotes original headings so the chapter title is the only h1
4. Renders to A5 PDF with cover, TOC (with optional tier groups), page numbers, chapter headers
5. Strips syntax-highlighting colors from code (e-ink reads best in pure black)
6. Skips image outputs in notebooks (they balloon file size on e-ink)
7. Truncates verbose stream outputs (first 1500 + last 1000 chars)

## Why a skill, not a Python package

A pip-installable package would require remembering an API, writing a script, importing things, every time. As a skill it's invoked by natural language:

> "Compile [URL1, URL2, URL3] into a reading list PDF for my BOOX, with the first two grouped under 'Foundations' and the third as 'Background'"

…and Claude writes the recipe, runs it, and hands you back a PDF.

## Files

```
eink-bookbuilder-skill/
├── SKILL.md                       # Instructions Claude reads to use this
├── README.md                      # This file
├── scripts/
│   └── eink_book.py               # The Book class + extractors + CSS (~530 lines)
└── examples/
    ├── 01_reading_list.py         # 8 essays with 4-tier TOC
    ├── 02_mcp_servers.py          # 11 GitHub READMEs (markdown sources)
    └── 03_cookbook.py             # 12 Jupyter notebooks
```

The library (`scripts/eink_book.py`) is also usable directly without invoking the skill — see the examples for standalone usage.

## How to install as a Skill

Copy this directory's contents to your skills location. For Claude.ai personal skills, that's wherever your environment looks for user skills (e.g. `/mnt/skills/user/eink-bookbuilder/`):

```bash
cp -r tools/eink-bookbuilder-skill/* /path/to/your/skills/eink-bookbuilder/
```

The `SKILL.md` filename and YAML frontmatter (`name:`, `description:`) are what Claude uses to discover and trigger the skill. Don't rename them.

## Direct usage (without the skill harness)

If you just want to call the library from Python:

```python
import sys
sys.path.insert(0, "tools/eink-bookbuilder-skill/scripts")
from eink_book import Book

book = (
    Book(title="My Reading", subtitle="April 2026", style="prose")
    .add_html_article(
        title="1. Article Name",
        url="https://example.com/post",
        selector="article",
    )
    .add_markdown_url(
        title="2. README",
        url="https://raw.githubusercontent.com/x/y/main/README.md",
    )
    .add_notebook_url(
        title="3. Notebook",
        url="https://raw.githubusercontent.com/x/y/main/foo.ipynb",
    )
)
book.build("/tmp/out.pdf")
```

The `Book` class supports method chaining. See the docstring in `scripts/eink_book.py` for the full API.

## Dependencies

```bash
pip install --break-system-packages beautifulsoup4 lxml markdown weasyprint pypdf
```

The skill checks these on `Book.build()` and raises an `ImportError` with a hint if anything is missing.

## What this skill does NOT do

- **Doesn't render images embedded as base64 in notebooks** — by design (e-ink + size)
- **Doesn't fetch through paywalls or auth-required pages** — uses plain `curl`
- **Doesn't render JavaScript-only content** — for SPAs that load content client-side, you'll get an empty result
- **Doesn't handle MathJax / LaTeX rendering** — equations in source pages render as raw markup; for math-heavy content, output to LaTeX and use a different toolchain
- **Doesn't optimize for printing** — designed for e-ink, not paper. Margins, font weights, contrast all tuned for e-ink display.

## Acknowledgements

Built during a single-session iteration in April 2026 while compiling reading lists for offline study. CSS evolved through three render-test cycles (PyTorch tutorial → MCP/Agents/Skills reading list → cookbook notebooks). The two-variant style (`prose` vs `code`) emerged from realizing the same CSS doesn't work for both essay-heavy and code-heavy content.

License: MIT (same as the parent repo).
