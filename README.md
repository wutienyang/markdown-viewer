# markdown-viewer

A static, styled markdown library served via GitHub Pages from the `viewer` branch.

- **Hub** — https://wutienyang.github.io/markdown-viewer/
- **Data Engineering Design Patterns** — https://wutienyang.github.io/markdown-viewer/data-engineering-design-patterns/

## Structure

```
index.html                              hub: lists every book
assets/
  app.js                                shared reader (config-driven)
  style.css                             shared theme
  vendor/                               marked + highlight.js (self-hosted)
<book>/
  index.html                            thin shell: defines window.BOOK_CONFIG
  *.md + chapters/*.md                  the documents
```

## Adding a book

1. Create a folder, e.g. `my-book/`.
2. Drop the `.md` files inside.
3. Copy `index.html` from an existing book and edit `window.BOOK_CONFIG`:

```js
window.BOOK_CONFIG = {
  title: "My Book",
  subtitle: "Author",
  meta: "optional footer text",
  source: "https://github.com/...",
  base: ".",
  docs: [
    { path: "intro.md", title: "Introduction", group: "Overview" },
    { path: "ch/ch01.md", title: "Chapter One", num: "1", group: "Chapters" }
  ]
};
```

4. Add a card to the root `index.html` linking to `my-book/`.

The markdown files are the source of truth — no build step. Content here is synthesized
summaries, not original text.
