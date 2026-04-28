"""Example recipe: MCP / AI Agents / Skills reading list.

Compiles 8 canonical essays into a tiered reading list PDF.

Run with:
    python examples/01_reading_list.py
"""

import sys
from pathlib import Path

# Add the skill's scripts/ to path
SKILL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SKILL_DIR / "scripts"))

from eink_book import Book


INTRO_HTML = """
<p>This compilation collects the canonical introductory readings for
understanding Anthropic's three-part stack: <strong>Agents</strong>, the
<strong>Model Context Protocol (MCP)</strong>, and <strong>Agent Skills</strong>.</p>

<h2>Tier 1 — Conceptual foundations</h2>
<p>Build Effective Agents establishes the workflow vs. agent distinction
and five composable patterns. Context Engineering extends prompt engineering
into context curation. Writing Effective Tools reframes tool design as a
contract between deterministic systems and non-deterministic agents.</p>

<h2>Tier 2 — Model Context Protocol</h2>
<p>The MCP introduction post is the canonical reference. The official
docs at modelcontextprotocol.io are the neutral authoritative source after
MCP was donated to the Linux Foundation in December 2025.</p>

<h2>Tier 3 — Agent Skills</h2>
<p>The Anthropic engineering deep-dive explains the progressive disclosure
mechanism. Simon Willison offers an outside perspective on why Skills'
design might prove more durable than MCP.</p>

<h2>Tier 4 — Background</h2>
<p>Lilian Weng's June 2023 essay predates Anthropic's framing by
18 months and remains the academic reference for the agent component model.</p>
"""


def main(output_path: str = "/mnt/user-data/outputs/MCP_Agents_Skills_Reading_List.pdf") -> None:
    book = Book(
        title="MCP, AI Agents & Skills",
        subtitle="Essential Reading List",
        style="prose",
        meta_lines=[
            "A curated collection of canonical introductory articles",
            "Compiled April 2026",
            "Formatted for BOOX Note Air 5C (A5, e-ink optimized)",
            "",
            "All articles reproduced from their original sources",
            "Copyrights remain with respective authors",
        ],
    )

    book.add_intro_html(INTRO_HTML, title="Reading Guide")

    # Tier 1
    book.add_html_article(
        title="1. Building Effective Agents",
        url="https://www.anthropic.com/engineering/building-effective-agents",
        selector="article",
    )
    book.add_html_article(
        title="2. Effective Context Engineering for AI Agents",
        url="https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents",
        selector="article",
    )
    book.add_html_article(
        title="3. Writing Effective Tools for AI Agents",
        url="https://www.anthropic.com/engineering/writing-tools-for-agents",
        selector="article",
    )

    # Tier 2
    book.add_html_article(
        title="4. Introducing the Model Context Protocol",
        url="https://www.anthropic.com/news/model-context-protocol",
        selector="article",
    )
    book.add_html_article(
        title="5. MCP — Getting Started",
        url="https://modelcontextprotocol.io/docs/getting-started/intro",
        selector="div.prose, div#content-container, main",
    )

    # Tier 3
    book.add_html_article(
        title="6. Equipping Agents for the Real World with Agent Skills",
        url="https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills",
        selector="article",
    )
    book.add_html_article(
        title="7. Claude Skills are Awesome (Simon Willison)",
        url="https://simonwillison.net/2025/Oct/16/claude-skills/",
        selector="div.entry",
    )

    # Tier 4
    book.add_html_article(
        title="8. LLM Powered Autonomous Agents (Lilian Weng)",
        url="https://lilianweng.github.io/posts/2023-06-23-agent/",
        selector="article, div.post-content",
    )

    book.set_toc_groups([
        ("Tier 1 — Conceptual Foundations", [0, 1, 2]),
        ("Tier 2 — Model Context Protocol", [3, 4]),
        ("Tier 3 — Agent Skills", [5, 6]),
        ("Tier 4 — Background Reading", [7]),
    ])

    book.build(output_path)
    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
