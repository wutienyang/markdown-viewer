# Data Engineering Design Patterns — Reader

A styled, single-page markdown reader for **Data Engineering Design Patterns** by *Bartosz Konieczny* — 68 design patterns across 10 chapters.

Served from the `viewer` branch via GitHub Pages:
**https://wutienyang.github.io/markdown-viewer/**

## Features

- Sidebar index of every document (overview, cheatsheet, patterns, glossary, 10 chapters)
- Auto-generated "On this page" table of contents for each document
- Client-side rendering with syntax-highlighted code blocks and styled tables
- Live search/filter across the document index
- Light / dark theme, deep-linkable URLs, prev/next navigation, mobile responsive

## Files

| Path | Purpose |
|---|---|
| `index.html` | Viewer shell |
| `assets/app.js` | Rendering, routing, navigation |
| `assets/style.css` | Theme and layout |
| `assets/vendor/` | `marked` + `highlight.js` (self-hosted, no CDN) |
| `SKILL.md` | Book overview & core frameworks |
| `cheatsheet.md` | Decision rules & trade-offs |
| `patterns.md` | All 68 design patterns |
| `glossary.md` | Key terms |
| `chapters/ch01–ch10` | Per-chapter summaries |

The markdown files are the source of truth — update them and the reader reflects the change
immediately (no build step). The book content here is synthesized summaries, not the original text.
