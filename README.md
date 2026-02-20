![Banner](https://raw.githubusercontent.com/ktmcp-cli/archive/main/banner.svg)

> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Internet Archive CLI

> **⚠️ Unofficial CLI** - Not officially sponsored or affiliated with Internet Archive.

A production-ready command-line interface for the [Internet Archive Search API](https://archive.org/) — search millions of books, movies, music, websites, and more from your terminal.

## Features

- **Full-Text Search** — Search across millions of digitized items
- **Metadata Fields** — Query specific metadata fields
- **Cursor Pagination** — Scrape large result sets efficiently
- **Result Counting** — Get total counts for queries
- **Field Discovery** — List all available metadata fields
- **JSON output** — All commands support `--json` for scripting
- **Colorized output** — Clean terminal output with chalk

## Installation

```bash
npm install -g @ktmcp-cli/archive
```

## Quick Start

```bash
# Search for items
archive search "nasa moon landing"

# Search with specific fields
archive search "mediatype:movies AND year:1950" --fields title,creator,year

# Get total count
archive count "subject:science fiction"

# Scrape with pagination
archive scrape "collection:prelinger" --size 100

# List available metadata fields
archive fields
```

## Commands

### Search

```bash
archive search <query>
archive search "tesla" --fields title,creator,date
archive search "mediatype:audio" --size 20
archive search "collection:librivoxaudio" --sort "downloads desc"
archive search "subject:poetry" --json
```

### Scrape

Cursor-based pagination for large result sets:

```bash
archive scrape <query>
archive scrape "year:2020" --size 500
archive scrape "mediatype:texts" --cursor <cursor-value>
archive scrape "language:eng AND mediatype:movies" --json
```

### Count

```bash
archive count <query>
archive count "collection:nasa"
archive count "creator:\"Mark Twain\"" --json
```

### Fields

```bash
archive fields
archive fields --json
```

### Config

```bash
archive config set --base-url <url>
archive config show
```

## Search Query Syntax

The Internet Archive uses Lucene query syntax:

```bash
# Field searches
archive search "title:frankenstein"
archive search "creator:tesla"
archive search "mediatype:movies"

# Boolean operators
archive search "nasa AND apollo"
archive search "title:dracula OR title:frankenstein"
archive search "subject:horror NOT mediatype:audio"

# Wildcards
archive search "title:electric*"

# Ranges
archive search "year:[1920 TO 1930]"
archive search "downloads:[1000 TO *]"
```

## Common Media Types

- `texts` — Books, documents, articles
- `movies` — Films, videos
- `audio` — Music, podcasts, recordings
- `software` — Programs, games
- `image` — Photos, illustrations
- `web` — Archived websites
- `collection` — Curated collections

## JSON Output

All commands support `--json` for structured output:

```bash
archive search "mars" --json | jq '.response.docs[] | .identifier'
archive count "mediatype:texts" --json | jq '.total'
archive fields --json | jq '.fields[]'
```

## Why CLI > MCP?

No server to run. No protocol overhead. Just install and go.

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe to `jq`, `grep`, `awk`
- **Scriptable** — Works in cron jobs, CI/CD, shell scripts

## License

MIT — Part of the [Kill The MCP](https://killthemcp.com) project.
