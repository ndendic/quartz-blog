---
publish: true
---
# Quartz Blog — Maintainer's Guide

Your blog at `Projects/quartz-blog/`. Quartz generates a static site from markdown files, served by Sanic with Datastar interactivity.

---

## Quick Reference

| Task | Command |
|------|---------|
| First-time setup | `./blog init` |
| Daily development | `./blog dev` |
| Rebuild site | `./blog build` |
| Start server | `./blog serve` |
| Sync vault notes | `./blog sync` |
| Full publish pipeline | `./blog publish` |
| Preview (hot reload) | `./blog preview` |
| Clean build | `./blog clean` |
| Site URL | `http://localhost:8000` |

---

## CLI Tool (`./blog`)

The `blog` CLI handles all common tasks. It's a self-contained bash script at the repo root.

### First-time setup

```bash
git clone <repo-url>
cd quartz-blog
./blog init
```

This installs Node packages (`npm install`) and creates a Python `.venv` with `sanic` and `datastar-py`.

### Daily development

```bash
./blog dev
```

Builds the site, starts the Sanic server on port 8000, and watches `content/` for changes — auto-rebuilds when you edit a note.

### Build only

```bash
./blog build           # Standard build
./blog build -v        # Verbose output
```

Generates static files from `content/` into `public/`. The server reads from `public/` on each request, so no restart needed.

### Start server only

```bash
./blog serve
```

Starts the unified Sanic server on port 8000. Serves static files + SSE API endpoints.

### Sync from vault

```bash
./blog sync              # Sync published notes from Ideaverse
./blog sync --dry-run    # Preview without copying
./blog sync /other/vault # Sync from a different vault
```

Scans the vault for notes with `publish: true` in frontmatter, copies them to `content/` with flattened names, and resolves image embeds to `content/assets/`.

### Full publish pipeline

```bash
./blog publish
```

Runs sync → build in sequence. After this, run `./blog serve` to see the result.

### Preview with hot reload

```bash
./blog preview           # Default port 3333
./blog preview 4000      # Custom port
```

Starts Quartz's built-in dev server with hot reload. No backend SSE — use this for content editing only.

### Clean

```bash
./blog clean
```

Removes the `public/` directory.

---

## Writing Content

### Where to write

All content lives in `content/`. One markdown file = one page.

```
content/
  index.md                              <- Homepage
  The Mirror and the Machine.md         <- Blog post
  Interactive Demo.md                   <- Page with Datastar interactivity
```

### Publishing a note

Add `publish: true` to frontmatter. Without it, the page won't appear on the site.

```yaml
---
title: "My New Post"
publish: true
tags:
  - philosophy
  - technology
---

# My New Post

Content here. Supports full Obsidian markdown — wikilinks, callouts, Mermaid diagrams, LaTeX.
```

### Publishing from anywhere in the vault

You can add `publish: true` to any note in the Ideaverse vault, then run:

```bash
./blog sync      # Copies publish:true notes to content/
./blog build     # Builds the site
```

Or in one step: `./blog publish`

### Linking between pages

Use Obsidian wikilinks — Quartz resolves them automatically:

```markdown
Read [[The Mirror and the Machine]] for the full story.
```

### Tags

Tags in frontmatter become tag pages at `/tags/tagname`:

```yaml
tags:
  - jung
  - technology
```

### After editing content

```bash
./blog build
```

The server picks up changes immediately — no restart needed.

---

## Adding Datastar Interactivity

Any page can include interactive sections by embedding HTML with Datastar attributes in your markdown. Add `datastar: true` to frontmatter (used by the Datastar component for styling).

### Datastar v1.0.0-RC.8 Attribute Syntax

```html
<!-- Initialize: runs on page load -->
<div data-init="@get('/api/endpoint')">
  <span id="target">Loading...</span>
</div>

<!-- Click handler -->
<button data-on:click="@get('/api/stats')">Refresh</button>

<!-- Reactive signals + two-way binding -->
<div data-signals:name="''">
  <input data-bind:name placeholder="Type here..." />
  <span data-text="$name"></span>
</div>

<!-- Conditional display -->
<div data-show="$name !== ''">Hello!</div>
```

### Key attributes

| Attribute | Purpose |
|-----------|---------|
| `data-init` | Run expression on element init |
| `data-on:event` | Event handler (`click`, `input`, `submit`, etc.) |
| `data-bind:signal` | Two-way binding to a signal |
| `data-signals:name="value"` | Declare a reactive signal |
| `data-text` | Bind element text to expression |
| `data-show` | Show/hide based on condition |
| `data-class:name` | Toggle CSS class conditionally |
| `data-attr:name` | Set HTML attribute dynamically |
| `data-indicator:name` | Loading indicator (true during fetch) |

### CSS classes for interactive elements

Defined in `quartz/components/Datastar.tsx`, using Quartz theme tokens:

| Class | Purpose |
|-------|---------|
| `ds-input` | Styled text input |
| `ds-btn` | Filled button (secondary color) |
| `ds-btn-outline` | Outlined button variant |
| `ds-stat` / `ds-stat-value` / `ds-stat-label` | Metric cards |
| `ds-success` / `ds-error` / `ds-muted` | Status text colors |
| `ds-fade-in` | Fade animation for SSE fragments |

### Backend actions

`@get('/path')` and `@post('/path')` send SSE requests. Signals are sent automatically as query params (GET) or JSON body (POST).

---

## Backend (Sanic Server)

### File: `backend/server.py`

The server does two things:
1. **Serves static files** from `public/` with clean URL support (`/My-Page` -> `My-Page.html`)
2. **Handles SSE API endpoints** under `/api/*`

### Adding a new endpoint

```python
from datastar_py import ServerSentEventGenerator as SSE
from datastar_py.sanic import datastar_response, read_signals

@app.get("/api/my-endpoint")
@datastar_response
async def my_endpoint(request: Request):
    # Read signals sent by the client
    signals = await read_signals(request)
    name = signals.get("name", "world")

    # Yield SSE events — each patches the DOM
    yield SSE.patch_elements(
        f'<div id="target">Hello, {name}!</div>'
    )

    # Can also update client signals
    yield SSE.patch_signals({"count": 42})
```

### SSE response types

| Method | Purpose |
|--------|---------|
| `SSE.patch_elements(html)` | Update DOM by element ID (morph) |
| `SSE.patch_signals(dict)` | Update client-side signals |
| `SSE.remove_elements(selector)` | Remove elements from DOM |
| `SSE.execute_script(js)` | Run JavaScript on client |
| `SSE.redirect(url)` | Navigate browser |

### Running the server

```bash
./blog serve
```

Or manually: `.venv/bin/python backend/server.py`

---

## Project Structure

```
quartz-blog/
├── blog                       <- CLI tool (this is what you run)
├── sync.py                    <- Vault sync script
├── content/                   <- YOUR CONTENT (markdown files)
│   ├── index.md               <- Homepage
│   ├── assets/                <- Synced images
│   └── *.md                   <- Blog posts and pages
├── backend/
│   └── server.py              <- Sanic server (static + SSE)
├── public/                    <- Generated site (don't edit)
├── .venv/                     <- Python venv (created by ./blog init)
├── quartz/
│   ├── components/            <- UI components (JSX/TSX)
│   │   ├── Navbar.tsx         <- Top navigation bar (custom)
│   │   ├── PageHeader.tsx     <- Avatar + title + meta (custom)
│   │   ├── Datastar.tsx       <- Datastar CSS styles (custom)
│   │   ├── PageTitle.tsx      <- Site title in sidebar
│   │   ├── Explorer.tsx       <- File tree sidebar
│   │   ├── Graph.tsx          <- Graph view
│   │   ├── Search.tsx         <- Full-text search
│   │   └── ...                <- All other built-in components
│   ├── plugins/
│   │   └── transformers/
│   │       └── datastar.tsx   <- Loads Datastar RC.8 via importmap
│   └── styles/
│       ├── base.scss          <- Base styles
│       ├── variables.scss     <- Spacing, breakpoints ($topSpacing etc.)
│       └── custom.scss        <- Your custom CSS overrides
├── quartz.config.ts           <- Site config (title, theme, fonts, plugins)
├── quartz.layout.ts           <- Page layout (navbar, sidebars, footer)
├── GUIDE.md                   <- This file
└── package.json
```

---

## Customizing the Site

### Theme & Colors

Edit `quartz.config.ts` -> `theme.colors`. Uses zinc gray palette:

```ts
colors: {
  lightMode: {
    light: "#ffffff",        // page background
    lightgray: "#e4e4e7",   // borders
    gray: "#a1a1aa",         // muted text
    darkgray: "#374151",     // body text
    dark: "#18181b",         // headings
    secondary: "#3f3f46",    // links, accents
    tertiary: "#71717a",     // hover states
  },
  darkMode: { /* mirrors with inverted values */ }
}
```

### Fonts

Any [Google Fonts](https://fonts.google.com) name works:

```ts
typography: {
  header: "Poppins",         // headings, navbar title
  body: "Poppins",           // body text, paragraphs
  code: "JetBrains Mono",   // code blocks, inline code
}
```

### Spacing

Edit `quartz/styles/variables.scss`:

```scss
$topSpacing: 3rem;       // space between navbar and content
$pageWidth: 800px;       // mobile breakpoint
$sidePanelWidth: 320px;  // sidebar width
```

### Layout

Edit `quartz.layout.ts` to rearrange components:

```ts
// Top navbar (shared across all pages)
header: [
  Component.Navbar({ links: [{ label: "Home", href: "/" }] }),
  Component.Search(),
  Component.Darkmode(),
  Component.ReaderMode(),
],

// Left sidebar
left: [
  Component.PageTitle(),
  Component.Explorer(),
],

// Right sidebar
right: [
  Component.Graph(),
  Component.DesktopOnly(Component.TableOfContents()),
  Component.Backlinks(),
],

// Content header (before article body)
beforeBody: [
  Component.PageHeader(),  // avatar + title + date + tags
],
```

### Custom CSS

Add styles to `quartz/styles/custom.scss` — they apply globally and can use Quartz variables like `var(--secondary)`, `var(--lightgray)`, etc.

### Creating a new component

1. Create `quartz/components/MyComponent.tsx`:

```tsx
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  function MyComponent(props: QuartzComponentProps) {
    return <div class="my-component">Hello</div>
  }

  MyComponent.css = `.my-component { color: var(--secondary); }`

  // Optional: client-side JS
  MyComponent.afterDOMLoaded = `
    document.addEventListener("nav", () => {
      console.log("Page loaded!")
    })
  `

  return MyComponent
}) satisfies QuartzComponentConstructor
```

2. Register in `quartz/components/index.ts`:
```ts
import MyComponent from "./MyComponent"
export { /* ..existing.. */, MyComponent }
```

3. Add to `quartz.layout.ts`:
```ts
left: [ Component.MyComponent(), /* ... */ ]
```

---

## Hosting & Deployment

### Current setup (local)

```bash
./blog init     # One-time setup
./blog dev      # Daily development
```

### Production options

**Static-only hosting** (no Datastar interactivity):
- GitHub Pages, Cloudflare Pages, Vercel, Netlify
- Just deploy the `public/` folder
- Free tier on all platforms

**With Datastar/SSE** (full interactivity):
- Your VPS via Dokploy — deploy the Sanic server
- Any server that can run Python + serve static files

### Deploying to your VPS

1. Push `quartz-blog` to a GitHub repo
2. On VPS: clone and run `./blog init`
3. Build: `./blog build`
4. Run Sanic with a process manager (systemd, supervisor)
5. Reverse proxy with Nginx/Caddy for HTTPS

---

## Workflow Summary

```
./blog init               (one-time: install deps)
        |
./blog sync               (optional: pull from vault)
        |
./blog build              (generate static site)
        |
./blog serve              (start on port 8000)
        |
http://localhost:8000     (view in browser)
```

Or just: `./blog dev` for the full loop with auto-rebuild.

---

## Useful Links

- [Quartz docs](https://quartz.jzhao.xyz) — configuration, plugins, components
- [Datastar docs](https://data-star.dev) — attribute reference, SSE events
- [datastar-py](https://pypi.org/project/datastar-py/) — Python SSE SDK
- [Sanic docs](https://sanic.dev) — server framework
