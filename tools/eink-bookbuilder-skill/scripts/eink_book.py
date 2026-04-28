"""eink_book.py — compile multiple sources into one e-ink-friendly PDF.

Usage:

    from eink_book import Book

    book = Book(
        title="My Reading List",
        subtitle="Compiled April 2026",
        style="prose",                       # or "code"
    )

    book.add_intro_html('<p>Welcome.</p>')

    book.add_html_article(
        title="1. Some Article",
        url="https://example.com/post",
        selector="article",
    )

    book.add_markdown_url(
        title="2. A README",
        url="https://raw.githubusercontent.com/x/y/main/README.md",
    )

    book.add_notebook_url(
        title="3. A Notebook",
        url="https://raw.githubusercontent.com/x/y/main/foo.ipynb",
    )

    book.set_toc_groups([
        ("Tier 1 — Essays", [0, 1]),
        ("Tier 2 — Notebooks", [2]),
    ])

    book.build("/mnt/user-data/outputs/my_book.pdf")

Sources:
    HTML articles → fetched via curl, parsed via BeautifulSoup, cleaned, demoted.
    Markdown URLs → rendered via python-markdown.
    Notebook URLs → cells parsed from JSON, code/output blocks rendered.
    Local files   → same logic, loaded from disk.

Style:
    "prose" — line-height 1.55, larger code (good for articles)
    "code"  — tighter typography, smaller code (good for notebooks/READMEs)

Output: A5 portrait PDF with cover, TOC, page numbers, header rule, source URLs.
"""

from __future__ import annotations

import html as html_lib
import json
import re
import subprocess
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


# ===========================================================================
# CSS — two variants
# ===========================================================================

_CSS_BASE = """
@page {
    size: A5 portrait;
    margin: 18mm 16mm 20mm 16mm;
    @bottom-center {
        content: counter(page) " / " counter(pages);
        font-size: 9pt;
        color: #555;
    }
    @top-right {
        content: string(chapter);
        font-size: 9pt;
        color: #555;
    }
}

html { font-size: 11.5pt; }

body {
    font-family: "DejaVu Serif", "Liberation Serif", Georgia, serif;
    line-height: 1.55;
    color: #000;
    background: #fff;
}

h1.chapter-title {
    font-family: "DejaVu Sans", "Liberation Sans", Arial, sans-serif;
    font-size: 20pt;
    margin-top: 0;
    margin-bottom: 4pt;
    padding-bottom: 6pt;
    border-bottom: 2pt solid #000;
    page-break-before: always;
    string-set: chapter content();
}
h1.chapter-title:first-of-type { page-break-before: avoid; }

p.source-line {
    font-size: 9pt;
    color: #444;
    margin-bottom: 14pt;
    word-break: break-all;
}

h1 { font-family: "DejaVu Sans", sans-serif; font-size: 18pt; margin-top: 16pt; margin-bottom: 8pt; page-break-after: avoid; }
h2 { font-family: "DejaVu Sans", sans-serif; font-size: 15pt; margin-top: 18pt; margin-bottom: 8pt; page-break-after: avoid; }
h3 { font-family: "DejaVu Sans", sans-serif; font-size: 13pt; margin-top: 14pt; margin-bottom: 6pt; page-break-after: avoid; }
h4, h5, h6 { font-family: "DejaVu Sans", sans-serif; font-size: 12pt; margin-top: 12pt; margin-bottom: 5pt; page-break-after: avoid; }

p { margin: 0 0 8pt 0; text-align: justify; hyphens: auto; orphans: 2; widows: 2; }
strong, b { font-weight: bold; }
em, i { font-style: italic; }
a { color: #000; text-decoration: underline; }

div.admonition, blockquote {
    border-left: 3pt solid #555;
    padding: 4pt 10pt;
    margin: 8pt 0;
    background: #f8f8f8;
    page-break-inside: avoid;
}
blockquote { margin-left: 0; color: #222; font-style: italic; }

img { max-width: 100%; height: auto; display: block; margin: 8pt auto; page-break-inside: avoid; }
figure { margin: 8pt 0; page-break-inside: avoid; }
figcaption { font-size: 9pt; color: #444; text-align: center; margin-top: 4pt; font-style: italic; }

table {
    border-collapse: collapse;
    margin: 8pt 0;
    font-size: 9.5pt;
    width: 100%;
    page-break-inside: avoid;
}
th, td { border: 0.5pt solid #555; padding: 3pt 5pt; text-align: left; }
th { background: #e8e8e8; font-weight: bold; }

ul, ol { margin: 4pt 0 8pt 0; padding-left: 20pt; }
li { margin-bottom: 3pt; }

.cover { text-align: center; page-break-after: always; padding-top: 40mm; }
.cover h1 { font-size: 26pt; border: none; margin-bottom: 8pt; page-break-before: avoid; }
.cover .subtitle { font-size: 16pt; color: #333; margin-bottom: 8pt; }
.cover .meta { font-size: 9.5pt; color: #555; margin-top: 35mm; line-height: 1.7; }

.toc { page-break-after: always; }
.toc h1 { font-size: 20pt; border-bottom: 2pt solid #000; padding-bottom: 6pt; page-break-before: avoid; }
.toc ol { list-style: none; padding-left: 0; font-size: 11.5pt; }
.toc li { margin: 8pt 0; border-bottom: 0.3pt dotted #999; padding-bottom: 4pt; line-height: 1.4; }
.toc .tier-label {
    font-family: "DejaVu Sans", sans-serif;
    font-size: 9.5pt;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    margin-top: 14pt;
    margin-bottom: 4pt;
    border: none;
    padding: 0;
}
"""

_CSS_PROSE = _CSS_BASE + """
code {
    font-family: "DejaVu Sans Mono", "Liberation Mono", Menlo, monospace;
    font-size: 9.8pt;
    background: #f0f0f0;
    padding: 1pt 3pt;
    border-radius: 2pt;
}
pre {
    font-family: "DejaVu Sans Mono", monospace;
    font-size: 9pt;
    line-height: 1.4;
    background: #f4f4f4;
    border: 0.5pt solid #888;
    border-left: 3pt solid #333;
    padding: 6pt 8pt;
    margin: 8pt 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    page-break-inside: avoid;
}
pre code { background: transparent; padding: 0; border-radius: 0; font-size: inherit; }
pre *, pre code * { color: #000 !important; background: transparent !important; }
"""

_CSS_CODE = _CSS_BASE + """
code {
    font-family: "DejaVu Sans Mono", "Liberation Mono", Menlo, monospace;
    font-size: 9.5pt;
    background: #f0f0f0;
    padding: 1pt 3pt;
    border-radius: 2pt;
}
pre {
    font-family: "DejaVu Sans Mono", monospace;
    font-size: 8.5pt;
    line-height: 1.35;
    background: #f4f4f4;
    border: 0.5pt solid #888;
    border-left: 3pt solid #333;
    padding: 5pt 7pt;
    margin: 6pt 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    page-break-inside: avoid;
}
pre code { background: transparent; padding: 0; border-radius: 0; font-size: inherit; }
pre *, pre code * { color: #000 !important; background: transparent !important; }

.nb-output {
    background: #fafafa;
    border-left: 3pt solid #888;
    padding: 4pt 7pt;
    margin: 6pt 0;
    font-family: "DejaVu Sans Mono", monospace;
    font-size: 8pt;
    white-space: pre-wrap;
    word-wrap: break-word;
    page-break-inside: avoid;
    color: #333;
}
.nb-output-label, .nb-input-label {
    font-size: 7.5pt;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    margin-bottom: 2pt;
}
"""


# ===========================================================================
# Fetching
# ===========================================================================

_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"


def _fetch(url: str) -> str:
    """Fetch a URL via curl. Returns text (UTF-8 decoded with replacement)."""
    result = subprocess.run(
        ["curl", "-sL", "-A", _USER_AGENT, "-H", "Accept: text/html,application/json,text/markdown", url],
        capture_output=True, timeout=60,
    )
    if result.returncode != 0:
        raise RuntimeError(f"curl failed for {url}: {result.stderr.decode('utf-8', 'replace')}")
    return result.stdout.decode("utf-8", "replace")


def _fetch_bytes(url: str) -> bytes:
    """Fetch a URL via curl, returning raw bytes (for .ipynb JSON)."""
    result = subprocess.run(
        ["curl", "-sL", "-A", _USER_AGENT, url],
        capture_output=True, timeout=60,
    )
    if result.returncode != 0:
        raise RuntimeError(f"curl failed for {url}: {result.stderr.decode('utf-8', 'replace')}")
    return result.stdout


# ===========================================================================
# Extractors — convert source content to cleaned HTML body
# ===========================================================================

def _extract_html_article(html_text: str, selector: str) -> str:
    """Find main article content from a web page, clean it up, demote headings."""
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(html_text, "lxml")

    # Try selector list, take first match with substantial content
    article = None
    for sel in [s.strip() for s in selector.split(",")]:
        candidate = soup.select_one(sel)
        if candidate and len(candidate.get_text(strip=True)) > 500:
            article = candidate
            break

    if not article:
        # Fallback: largest div
        divs = sorted(soup.find_all("div"), key=lambda d: len(d.get_text(strip=True)), reverse=True)
        article = divs[0] if divs else soup.body
        if not article:
            return "<p>(content extraction failed)</p>"

    # Drop chrome
    for tag in article.find_all(["nav", "aside", "header", "footer", "script", "style", "noscript", "iframe"]):
        tag.decompose()

    # Drop common chrome classes
    chrome_keywords = [
        "share", "subscribe", "newsletter", "social", "sidebar", "breadcrumb",
        "cookie", "related-posts", "tag-list", "author-card", "profile-card",
        "cta-", "newsletter-",
    ]
    for tag in article.find_all(class_=lambda cls: cls and any(
        kw in " ".join(cls if isinstance(cls, list) else [cls]).lower() for kw in chrome_keywords
    )):
        tag.decompose()

    # Drop anchor link symbols (¶)
    for a in article.find_all("a", class_=lambda cls: cls and any(
        kw in " ".join(cls if isinstance(cls, list) else [cls]).lower()
        for kw in ["anchor", "headerlink", "header-anchor"]
    )):
        a.decompose()

    # Drop empty wrappers
    for tag in article.find_all(["p", "div", "span"]):
        if not tag.get_text(strip=True) and not tag.find("img"):
            tag.decompose()

    # Drop original h1s (we inject our own chapter title)
    for h1 in article.find_all("h1"):
        h1.decompose()

    # Demote h2 → h3 etc to make our injected h1 the top
    for level in [4, 3, 2]:
        for h in article.find_all(f"h{level}"):
            h.name = f"h{level + 1}"

    return str(article)


def _extract_markdown(md_text: str) -> str:
    """Render markdown to HTML, strip leading h1, demote remaining h1s."""
    import markdown as md_lib

    body = md_lib.markdown(
        md_text,
        extensions=["fenced_code", "tables", "attr_list"],
    )
    body = re.sub(r"^\s*<h1>.*?</h1>", "", body, count=1, flags=re.DOTALL)
    body = re.sub(r"<h1>", "<h2>", body)
    body = re.sub(r"</h1>", "</h2>", body)
    return body


def _extract_notebook(nb_json: dict) -> str:
    """Render a Jupyter notebook to HTML — markdown cells, code cells, outputs.

    Skips image outputs (e-ink unfriendly, balloons file size).
    Truncates long stream/text outputs.
    """
    import markdown as md_lib

    pieces = []
    for cell in nb_json.get("cells", []):
        ctype = cell.get("cell_type", "")
        source = cell.get("source", "")
        if isinstance(source, list):
            source = "".join(source)

        if ctype == "markdown":
            pieces.append(md_lib.markdown(source, extensions=["fenced_code", "tables", "attr_list"]))

        elif ctype == "code":
            if not source.strip():
                continue
            pieces.append(
                f'<div class="nb-input-label">▸ In</div>'
                f"<pre><code>{html_lib.escape(source)}</code></pre>"
            )

            for out in cell.get("outputs", []) or []:
                otype = out.get("output_type", "")
                rendered = _render_notebook_output(out, otype)
                if rendered:
                    pieces.append(rendered)

    body = "\n".join(pieces)
    body = re.sub(r"^\s*<h1>.*?</h1>", "", body, count=1, flags=re.DOTALL)
    body = re.sub(r"<h1>", "<h2>", body)
    body = re.sub(r"</h1>", "</h2>", body)
    return body


def _render_notebook_output(out: dict, otype: str) -> str:
    """Render a single notebook output cell. Returns HTML or empty string."""
    if otype == "stream":
        text = out.get("text", "")
        if isinstance(text, list):
            text = "".join(text)
        text = text.strip()
        if not text:
            return ""
        if len(text) > 3000:
            text = text[:1500] + "\n\n[... output truncated for readability ...]\n\n" + text[-1000:]
        return (
            f'<div class="nb-output-label">▸ Out (stream)</div>'
            f'<div class="nb-output">{html_lib.escape(text)}</div>'
        )

    if otype in ("execute_result", "display_data"):
        data = out.get("data", {})
        # Prefer text/plain; skip image/png and text/html (often messy on e-ink)
        if "text/plain" in data:
            text = data["text/plain"]
            if isinstance(text, list):
                text = "".join(text)
            text = text.strip()
            if not text:
                return ""
            if len(text) > 2000:
                text = text[:1000] + "\n\n[... truncated ...]\n\n" + text[-700:]
            return (
                f'<div class="nb-output-label">▸ Out</div>'
                f'<div class="nb-output">{html_lib.escape(text)}</div>'
            )

    if otype == "error":
        tb = out.get("traceback", [])
        if isinstance(tb, list):
            tb = "\n".join(tb)
        tb = re.sub(r"\x1b\[[0-9;]*m", "", tb)  # strip ANSI
        return (
            f'<div class="nb-output-label">▸ Error</div>'
            f'<div class="nb-output">{html_lib.escape(tb)}</div>'
        )

    return ""


# ===========================================================================
# Book — public API
# ===========================================================================

@dataclass
class _Chapter:
    title: str
    body_html: str
    source_label: Optional[str] = None
    is_intro: bool = False


@dataclass
class Book:
    """A compiled e-ink-friendly PDF book.

    Build chapters with add_* methods, then call build(output_path).
    """

    title: str
    subtitle: str = ""
    meta_lines: list[str] = field(default_factory=list)
    style: str = "prose"  # "prose" | "code"
    _chapters: list[_Chapter] = field(default_factory=list, init=False, repr=False)
    _toc_groups: Optional[list] = field(default=None, init=False, repr=False)

    # ---- intro / chapter add methods --------------------------------------

    def add_intro_html(self, html_body: str, title: str = "Reading Guide") -> "Book":
        """Add a hand-written intro chapter (no source URL)."""
        self._chapters.append(_Chapter(title=title, body_html=html_body, is_intro=True))
        return self

    def add_html_article(
        self,
        title: str,
        url: str,
        selector: str = "article, main, div.prose, div.entry",
        source_label: Optional[str] = None,
    ) -> "Book":
        """Fetch a web article and add it as a chapter.

        ``selector`` is a comma-separated list of CSS selectors tried in order.
        The first one returning >500 chars of text wins.
        """
        html_text = _fetch(url)
        body = _extract_html_article(html_text, selector)
        self._chapters.append(_Chapter(title=title, body_html=body, source_label=source_label or url))
        return self

    def add_markdown_url(
        self,
        title: str,
        url: str,
        source_label: Optional[str] = None,
    ) -> "Book":
        """Fetch a raw markdown URL (e.g. raw.githubusercontent.com) and add it."""
        md_text = _fetch(url)
        body = _extract_markdown(md_text)
        self._chapters.append(_Chapter(title=title, body_html=body, source_label=source_label or url))
        return self

    def add_local_markdown(
        self,
        title: str,
        path: str,
        source_label: Optional[str] = None,
    ) -> "Book":
        """Add a chapter from a local markdown file."""
        md_text = Path(path).read_text(encoding="utf-8")
        body = _extract_markdown(md_text)
        self._chapters.append(_Chapter(title=title, body_html=body, source_label=source_label or path))
        return self

    def add_notebook_url(
        self,
        title: str,
        url: str,
        source_label: Optional[str] = None,
        tagline: Optional[str] = None,
    ) -> "Book":
        """Fetch a Jupyter notebook URL (raw .ipynb) and add it."""
        nb_bytes = _fetch_bytes(url)
        nb_json = json.loads(nb_bytes.decode("utf-8", "replace"))
        body = _extract_notebook(nb_json)
        if tagline:
            body = f"<p><em>{html_lib.escape(tagline)}</em></p>\n" + body
        self._chapters.append(_Chapter(title=title, body_html=body, source_label=source_label or url))
        return self

    def add_local_notebook(
        self,
        title: str,
        path: str,
        source_label: Optional[str] = None,
        tagline: Optional[str] = None,
    ) -> "Book":
        """Add a chapter from a local .ipynb file."""
        nb_json = json.loads(Path(path).read_text(encoding="utf-8"))
        body = _extract_notebook(nb_json)
        if tagline:
            body = f"<p><em>{html_lib.escape(tagline)}</em></p>\n" + body
        self._chapters.append(_Chapter(title=title, body_html=body, source_label=source_label or path))
        return self

    # ---- TOC structure ---------------------------------------------------

    def set_toc_groups(self, groups: list[tuple[str, list[int]]]) -> "Book":
        """Optionally organize chapters into TOC tier groups.

        groups is a list of (tier_label, [chapter_indices]). Indices are
        0-based and refer to non-intro chapters. Intro chapters always
        appear first ungrouped.

        Example::

            book.set_toc_groups([
                ("Tier 1 — Foundations", [0, 1, 2]),
                ("Tier 2 — MCP", [3, 4]),
                ("Tier 3 — Skills", [5, 6, 7]),
            ])
        """
        self._toc_groups = groups
        return self

    # ---- Build -----------------------------------------------------------

    def build(self, output_path: str) -> str:
        """Render the book to PDF at output_path. Returns the path."""
        self._lazy_check_imports()

        css = _CSS_PROSE if self.style == "prose" else _CSS_CODE
        full_html = self._compose_html(css)

        with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".html", delete=False) as f:
            f.write(full_html)
            tmp_path = f.name

        # Suppress weasyprint warnings
        import logging
        import warnings
        warnings.filterwarnings("ignore")
        logging.getLogger("weasyprint").setLevel(logging.ERROR)
        logging.getLogger("fontTools").setLevel(logging.ERROR)

        from weasyprint import HTML
        HTML(filename=tmp_path).write_pdf(output_path)

        Path(tmp_path).unlink(missing_ok=True)
        return output_path

    # ---- Internal --------------------------------------------------------

    @staticmethod
    def _lazy_check_imports() -> None:
        try:
            import bs4  # noqa: F401
            import markdown  # noqa: F401
            import weasyprint  # noqa: F401
        except ImportError as e:
            raise ImportError(
                f"Missing dependency: {e}. Install with: "
                "pip install --break-system-packages beautifulsoup4 lxml markdown weasyprint pypdf"
            ) from e

    def _compose_html(self, css: str) -> str:
        # Cover
        meta_html = "<br>\n".join(self.meta_lines) if self.meta_lines else ""
        cover = (
            f'<div class="cover">'
            f'  <h1>{html_lib.escape(self.title)}</h1>'
            f'  <div class="subtitle">{html_lib.escape(self.subtitle)}</div>'
            f'  <div class="meta">{meta_html}</div>'
            f"</div>"
        )

        # TOC
        toc_html = self._compose_toc()

        # Chapters
        intro_chapters = [c for c in self._chapters if c.is_intro]
        body_chapters = [c for c in self._chapters if not c.is_intro]

        chapter_blocks = []
        for c in intro_chapters:
            chapter_blocks.append(self._compose_chapter(c))
        for c in body_chapters:
            chapter_blocks.append(self._compose_chapter(c))

        return (
            "<!DOCTYPE html>\n<html lang='en'>\n<head>\n"
            f"<meta charset='utf-8'>\n<title>{html_lib.escape(self.title)}</title>\n"
            f"<style>{css}</style>\n</head>\n<body>\n"
            f"{cover}\n{toc_html}\n"
            f"{''.join(chapter_blocks)}\n"
            "</body>\n</html>"
        )

    def _compose_chapter(self, c: _Chapter) -> str:
        title_esc = html_lib.escape(c.title)
        if c.source_label:
            src_html = f'<p class="source-line">Source: {html_lib.escape(c.source_label)}</p>'
        else:
            src_html = ""
        return (
            f'<h1 class="chapter-title">{title_esc}</h1>\n'
            f"{src_html}\n"
            f"{c.body_html}\n"
        )

    def _compose_toc(self) -> str:
        intro_chapters = [c for c in self._chapters if c.is_intro]
        body_chapters = [c for c in self._chapters if not c.is_intro]

        items = []
        for c in intro_chapters:
            items.append(f"<li>{html_lib.escape(c.title)}</li>")

        if self._toc_groups:
            for tier_label, indices in self._toc_groups:
                items.append(f'<li class="tier-label">{html_lib.escape(tier_label)}</li>')
                for idx in indices:
                    if 0 <= idx < len(body_chapters):
                        items.append(f"<li>{html_lib.escape(body_chapters[idx].title)}</li>")
        else:
            for c in body_chapters:
                items.append(f"<li>{html_lib.escape(c.title)}</li>")

        items_html = "\n".join(items)
        return (
            '<div class="toc">\n'
            "  <h1>Table of Contents</h1>\n"
            f"  <ol>\n{items_html}\n  </ol>\n"
            "</div>"
        )
