---
title: "Interactive Demo"
publish: true
datastar: true
tags:
  - demo
  - datastar
  - interactive
---

# Interactive Demo

This page demonstrates **Datastar + Quartz** — a static site that comes alive with server-sent events. The page itself is Obsidian markdown, but the interactive sections below connect to a live backend via SSE.

---

## Live Server Time

Watch the server push updates every second — no polling, no WebSocket, just SSE:

<div data-init="@get('/api/time')">
<span id="server-time" class="ds-muted">Connecting...</span>
</div>

---

## Say Hello

Type your name and let the server greet you:

<div data-signals:name="''">
<input class="ds-input" type="text" data-bind:name placeholder="Your name..." />
<button class="ds-btn" data-on:click="@get('/api/greet')">Say Hello</button>
<div id="greeting-result" class="ds-muted" style="margin-top: 1rem;">Waiting for your name...</div>
</div>

---

## Live Blog Stats

Click to fetch the latest engagement numbers from the backend:

<div>
<button class="ds-btn-outline" data-on:click="@get('/api/stats')">Refresh Stats</button>
<div id="blog-stats" class="ds-muted" style="margin-top: 1rem;">Click to load stats...</div>
</div>

---

## How This Works

This entire page is a **markdown file in an Obsidian vault**. The interactive sections use:

1. **Quartz** generates the static HTML from markdown
2. **Datastar** (11KB) adds reactivity via `data-*` attributes
3. **Sanic backend** responds with SSE events that update the DOM

The HTML in the markdown uses Datastar v1.0.0-RC.8 attributes:
- `data-init` — runs an expression when initialized (triggers SSE on load)
- `data-signals:name` — declares a reactive signal with colon syntax
- `data-bind:name` — two-way binding between input and signal
- `data-on:click` — triggers expression on click event
- `@get()` / `@post()` — SSE action expressions

The backend responds with `event: datastar-patch-elements` SSE events containing HTML fragments. Datastar patches them into the DOM by matching element IDs.

**The result**: A blog that's 95% static (fast, cacheable, SEO-friendly) with surgical interactivity where you need it.
