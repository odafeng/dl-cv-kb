"""Example recipe: MCP servers reference.

Compiles GitHub READMEs from the modelcontextprotocol/servers repo.
Demonstrates ``add_markdown_url`` for raw .md sources, and ``style="code"``
for source-code-heavy content.

Run with:
    python examples/02_mcp_servers.py
"""

import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SKILL_DIR / "scripts"))

from eink_book import Book


# (chapter title, branch path within repo, status, tagline)
ACTIVE_SERVERS = [
    ("Everything", "everything", "Reference / test server with all MCP primitives"),
    ("Fetch", "fetch", "Web content fetching and conversion"),
    ("Filesystem", "filesystem", "Secure file operations with access controls"),
    ("Git", "git", "Read, search, and manipulate Git repositories"),
    ("Memory", "memory", "Knowledge-graph-based persistent memory"),
    ("Sequential Thinking", "sequentialthinking", "Reflective problem-solving sequences"),
    ("Time", "time", "Time and timezone conversion"),
]

ARCHIVED_SERVERS = [
    ("GitHub", "github", "Repository management and API integration"),
    ("PostgreSQL", "postgres", "Read-only database access with schema inspection"),
    ("Slack", "slack", "Channel management and messaging"),
    ("Sentry", "sentry", "Error monitoring and issue retrieval"),
]


INTRO_HTML = """
<p>This compilation gathers the reference MCP server implementations
maintained by the modelcontextprotocol.org steering group. Each chapter
is the README from the server's source directory, reproduced for offline
reading.</p>

<h2>What these servers demonstrate</h2>
<p>MCP servers expose <strong>tools</strong>, <strong>resources</strong>, and
<strong>prompts</strong> to MCP-compatible clients. The reference set covers
local tooling (Filesystem, Git, Time), web access (Fetch), cognitive
scaffolding (Sequential Thinking, Memory), and a complete reference test
server (Everything).</p>

<p>Archived servers (GitHub, PostgreSQL, Slack, Sentry) are no longer
maintained by the steering group but remain instructive examples of
wrapping third-party APIs as MCP tools. Several have been replaced by
better-maintained vendor-official implementations.</p>
"""


def main(output_path: str = "/mnt/user-data/outputs/MCP_Servers_Reference.pdf") -> None:
    book = Book(
        title="MCP Servers",
        subtitle="Reference Implementations",
        style="code",
        meta_lines=[
            "A curated collection of Model Context Protocol servers",
            "Maintained by modelcontextprotocol.org",
            "",
            "Compiled April 2026",
            "Formatted for BOOX Note Air 5C (A5, e-ink optimized)",
        ],
    )

    book.add_intro_html(INTRO_HTML, title="Introduction")

    # Active reference servers
    base_active = "https://raw.githubusercontent.com/modelcontextprotocol/servers/main/src"
    for n, (title, slug, tagline) in enumerate(ACTIVE_SERVERS, start=1):
        book.add_markdown_url(
            title=f"{n}. {title}",
            url=f"{base_active}/{slug}/README.md",
            source_label=f"github.com/modelcontextprotocol/servers/tree/main/src/{slug}",
        )

    # Archived servers
    base_archived = "https://raw.githubusercontent.com/modelcontextprotocol/servers-archived/main/src"
    for i, (title, slug, tagline) in enumerate(ARCHIVED_SERVERS, start=len(ACTIVE_SERVERS) + 1):
        book.add_markdown_url(
            title=f"{i}. {title} (archived)",
            url=f"{base_archived}/{slug}/README.md",
            source_label=f"github.com/modelcontextprotocol/servers-archived/tree/main/src/{slug}",
        )

    book.set_toc_groups([
        ("Active Reference Servers", list(range(0, len(ACTIVE_SERVERS)))),
        ("Archived Reference Servers", list(range(len(ACTIVE_SERVERS), len(ACTIVE_SERVERS) + len(ARCHIVED_SERVERS)))),
    ])

    book.build(output_path)
    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
