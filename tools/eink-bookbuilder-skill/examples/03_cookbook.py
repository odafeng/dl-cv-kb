"""Example recipe: Anthropic Cookbook highlights.

Compiles 12 Jupyter notebooks from the claude-cookbooks repo into one PDF.
Demonstrates ``add_notebook_url`` and tagline annotations.

Run with:
    python examples/03_cookbook.py
"""

import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SKILL_DIR / "scripts"))

from eink_book import Book


# (chapter title, repo subpath, one-line tagline)
NOTEBOOKS = [
    ("1. Prompt Caching", "misc/prompt_caching.ipynb",
     "Cache long static prefixes to reduce cost and latency"),
    ("2. Enabling JSON Mode", "misc/how_to_enable_json_mode.ipynb",
     "Reliable structured output from Claude"),
    ("3. Calculator Tool (Tool Use Basics)", "tool_use/calculator_tool.ipynb",
     "The simplest tool-use pattern: function calling"),
    ("4. Customer Service Agent", "tool_use/customer_service_agent.ipynb",
     "Multi-tool agent with conversational state"),
    ("5. Getting Started with Vision", "multimodal/getting_started_with_vision.ipynb",
     "Working with images in Claude API"),
    ("6. Best Practices for Vision", "multimodal/best_practices_for_vision.ipynb",
     "Image handling, resolution, prompting strategies"),
    ("7. Reading Charts, Graphs, and Slides", "multimodal/reading_charts_graphs_powerpoints.ipynb",
     "Interpreting visual information"),
    ("8. Using Sub-Agents", "multimodal/using_sub_agents.ipynb",
     "Haiku as a sub-agent in combination with Opus"),
    ("9. PDF Summarization", "misc/pdf_upload_summarization.ipynb",
     "Parse and summarize PDF documents"),
    ("10. Building Evaluations", "misc/building_evals.ipynb",
     "Automate prompt evaluation with Claude"),
    ("11. Building a Moderation Filter", "misc/building_moderation_filter.ipynb",
     "Content moderation with Claude"),
    ("12. SQL Query Generation", "misc/how_to_make_sql_queries.ipynb",
     "Translate natural language to SQL"),
]


INTRO_HTML = """
<p>This compilation extracts twelve hand-picked notebooks from
<code>anthropics/claude-cookbooks</code>, the official collection of Claude
API examples. The full repository contains many more notebooks; the
selection here focuses on patterns broadly useful across Claude API
applications.</p>

<h2>How notebooks render</h2>
<p>Markdown cells appear as formatted prose. Code cells are shown in
monospace blocks marked <strong>▸ In</strong>, with their outputs (when
present) shown in <strong>▸ Out</strong> blocks.</p>

<p><strong>Image outputs are skipped</strong> — base64-encoded chart and
image displays balloon file size and look poor on e-ink. Where the visual
matters, the markdown narrative around it is preserved.</p>

<p><strong>Long stream outputs are truncated</strong> — verbose training
logs or repeated API responses are clipped to first 1500 + last 1000
characters with <code>[... truncated ...]</code> in between.</p>
"""


def main(output_path: str = "/mnt/user-data/outputs/Anthropic_Cookbook_Highlights.pdf") -> None:
    book = Book(
        title="Anthropic Cookbook",
        subtitle="Highlights",
        style="code",
        meta_lines=[
            "12 hand-picked notebooks demonstrating Claude API patterns",
            "Source: github.com/anthropics/claude-cookbooks",
            "",
            "Compiled April 2026",
            "Formatted for BOOX Note Air 5C (A5, e-ink optimized)",
            "Code blocks rendered in readable monospace at small size",
            "",
            "MIT License — copyrights with Anthropic & contributors",
        ],
    )

    book.add_intro_html(INTRO_HTML, title="Reading Guide")

    base = "https://raw.githubusercontent.com/anthropics/claude-cookbooks/main"
    for title, subpath, tagline in NOTEBOOKS:
        book.add_notebook_url(
            title=title,
            url=f"{base}/{subpath}",
            source_label=f"github.com/anthropics/claude-cookbooks/blob/main/{subpath}",
            tagline=tagline,
        )

    book.set_toc_groups([
        ("API Fundamentals", [0, 1]),
        ("Tool Use", [2, 3]),
        ("Vision & Multimodal", [4, 5, 6, 7]),
        ("Common Workflows", [8, 9, 10, 11]),
    ])

    book.build(output_path)
    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
