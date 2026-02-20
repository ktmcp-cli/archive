# AGENT.md — Internet Archive CLI for AI Agents

This document explains how to use the Internet Archive CLI as an AI agent.

## Overview

The `archive` CLI provides search access to the Internet Archive's vast digital library of books, movies, music, websites, and more.

## All Commands

### Search

```bash
archive search <query>                          # Basic search
archive search "nasa" --fields title,creator    # With metadata fields
archive search "mediatype:movies" --size 50     # Limit results
archive search "year:[1920 TO 1930]" --json     # Date range, JSON output
```

### Scrape

Cursor-based pagination for large result sets:

```bash
archive scrape <query>                          # Scrape with default size
archive scrape "collection:nasa" --size 500     # Large batch
archive scrape "texts" --cursor <value>         # Continue from cursor
```

### Count

```bash
archive count <query>                           # Get total count
archive count "mediatype:audio" --json          # JSON output
```

### Fields

```bash
archive fields                                  # List all metadata fields
archive fields --json
```

### Config

```bash
archive config set --base-url <url>
archive config show
```

## Search Syntax

Lucene query syntax:

- Field searches: `title:frankenstein`, `creator:tesla`
- Boolean: `AND`, `OR`, `NOT`
- Wildcards: `electric*`
- Ranges: `year:[1920 TO 1930]`

## Media Types

- `texts`, `movies`, `audio`, `software`, `image`, `web`, `collection`

## Tips for Agents

1. Use `--json` for all programmatic queries
2. Use `count` to get totals before fetching results
3. Use `scrape` with cursor for large datasets
4. Combine with `jq` for JSON parsing
5. Common fields: identifier, title, creator, date, mediatype, subject
