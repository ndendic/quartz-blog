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

## Writing Content

### Where to write

All content lives in `content/`. One markdown file = one page.

```
content/
  index.md                              ← Homepage
  The Mirror and the Machine.md         ← Blog post
  Interactive Demo.md                   ← Page with Datastar interactivity
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

Rebuild and the server picks up changes immediately:

```bash
npx quartz build
```

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

### Backend actions

`@get('/path')` and `@post('/path')` send SSE requests. Signals are sent automatically as query params (GET) or JSON body (POST).

---

## Backend (Sanic Server)

### File: `backend/server.py`

The server does two things:
1. **Serves static files** from `public/` with clean URL support (`/My-Page` → `My-Page.html`)
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
# From quartz-blog directory, using Nitro's Python venv:
/path/to/nitro/.venv/bin/python backend/server.py
```

---

## Project Structure

```
quartz-blog/
├── content/                    ← YOUR CONTENT (markdown files)
│   ├── index.md               ← Homepage
│   └── *.md                   ← Blog posts and pages
├── backend/
│   └── server.py              ← Sanic server (static + SSE)
├── public/                    ← Generated site (don't edit — rebuilt each time)
├── quartz/
│   ├── components/            ← UI components (JSX/TSX)
│   │   ├── AuthorAvatar.tsx   ← Your avatar (custom)
│   │   ├── Datastar.tsx       ← Datastar CSS styles (custom)
│   │   ├── PageTitle.tsx      ← Site title
│   │   ├── Explorer.tsx       ← File tree sidebar
│   │   ├── Graph.tsx          ← Graph view
│   │   ├── Search.tsx         ← Full-text search
│   │   └── ...                ← All other built-in components
│   ├── plugins/
│   │   └── transformers/
│   │       └── datastar.tsx   ← Loads Datastar RC.8 via importmap (custom)
│   └── styles/
│       ├── base.scss          ← Base styles
│       └── custom.scss        ← Your custom CSS overrides
├── quartz.config.ts           ← Site config (title, theme, plugins)
├── quartz.layout.ts           ← Page layout (sidebar, header, footer)
└── package.json
```

---

## Customizing the Site

### Theme & Colors

Edit `quartz.config.ts` → `theme.colors`:

```ts
colors: {
  lightMode: {
    light: "#faf9f6",       // page background
    secondary: "#6b4c3b",   // links, accents
    dark: "#1a1815",         // headers
    // ...
  },
  darkMode: { /* ... */ }
}
```

### Fonts

```ts
typography: {
  header: "Playfair Display",   // headings
  body: "Inter",                 // body text
  code: "JetBrains Mono",       // code blocks
}
```

### Layout

Edit `quartz.layout.ts` to rearrange sidebar components:

```ts
left: [
  Component.AuthorAvatar(),    // your photo
  Component.PageTitle(),       // site name
  Component.Search(),          // search bar
  Component.Explorer(),        // file tree
],
right: [
  Component.Graph(),           // graph view
  Component.TableOfContents(), // TOC
  Component.Backlinks(),       // backlinks
],
```

### Custom CSS

Add styles to `quartz/styles/custom.scss` — they apply globally.

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
npx quartz build                    # Generate static files
python backend/server.py            # Serve on port 8000
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
2. On VPS: clone, `npm i`, `npx quartz build`
3. Run Sanic with a process manager (systemd, supervisor)
4. Reverse proxy with Nginx/Caddy for HTTPS

---

## Workflow Summary

```
Edit markdown in content/
        ↓
npx quartz build          (generates public/)
        ↓
python backend/server.py  (serves site + SSE)
        ↓
http://localhost:8000     (view in browser)
```

For content-only changes, just rebuild. For backend changes, restart the server. For component/config changes, rebuild.

---

## Useful Links

- [Quartz docs](https://quartz.jzhao.xyz) — configuration, plugins, components
- [Datastar docs](https://data-star.dev) — attribute reference, SSE events
- [datastar-py](https://pypi.org/project/datastar-py/) — Python SSE SDK
- [Sanic docs](https://sanic.dev) — server framework
