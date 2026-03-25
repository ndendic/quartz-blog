"""
Unified Sanic server for Quartz + Datastar.

Serves the static Quartz site AND handles SSE API endpoints
on a single port. No CORS needed — same origin.

Uses datastar-py SDK for SSE responses (RC.8 event format).

Run: python server.py
Requires: npx quartz build (to generate public/ first)
"""
import asyncio
import random
from pathlib import Path
from datetime import datetime
from sanic import Sanic, Request
from sanic.response import html, file as file_response
from datastar_py import ServerSentEventGenerator as SSE
from datastar_py.sanic import datastar_response, read_signals

# Quartz output directory
STATIC_DIR = Path(__file__).parent.parent / "public"

app = Sanic("QuartzBlog")


# ---------------------------------------------------------------------------
# Static file serving via middleware — handles clean URLs before Sanic routing
# ---------------------------------------------------------------------------

@app.middleware("request")
async def serve_static(request: Request):
    path = request.path

    if path.startswith("/api/"):
        return None

    if path != "/" and path.endswith("/"):
        path = path.rstrip("/")

    if path == "/":
        index = STATIC_DIR / "index.html"
        if index.is_file():
            return await file_response(index)
        return None

    rel = path.lstrip("/")

    exact = STATIC_DIR / rel
    if exact.is_file():
        return await file_response(exact)

    html_file = STATIC_DIR / f"{rel}.html"
    if html_file.is_file():
        return await file_response(html_file)

    dir_index = STATIC_DIR / rel / "index.html"
    if dir_index.is_file():
        return await file_response(dir_index)

    return None


@app.exception(Exception)
async def custom_404(request: Request, exception):
    not_found = STATIC_DIR / "404.html"
    if not_found.is_file():
        return html(not_found.read_text(), status=404)
    return html("<h1>404 Not Found</h1>", status=404)


# ---------------------------------------------------------------------------
# SSE API endpoints — powered by datastar-py
# ---------------------------------------------------------------------------

@app.get("/api/time")
@datastar_response
async def time_stream(request: Request):
    for _ in range(300):
        now = datetime.now().strftime("%H:%M:%S")
        yield SSE.patch_elements(
            f'<span id="server-time" class="ds-fade-in ds-stat-value">{now}</span>'
        )
        await asyncio.sleep(1)


@app.get("/api/greet")
@datastar_response
async def greet(request: Request):
    signals = await read_signals(request)
    name = signals.get("name", "stranger") or "stranger"
    now = datetime.now().strftime("%H:%M:%S")
    yield SSE.patch_elements(
        f'<div id="greeting-result" class="ds-fade-in" style="margin-top: 1rem;">'
        f'<strong>Hello, {name}!</strong> '
        f'<span class="ds-muted">Server time: {now}</span>'
        f'</div>'
    )


@app.get("/api/stats")
@datastar_response
async def blog_stats(request: Request):
    views = random.randint(1200, 3500)
    readers = random.randint(40, 180)
    shares = random.randint(5, 45)
    yield SSE.patch_elements(
        f'<div id="blog-stats" class="ds-fade-in ds-stats" style="margin-top: 1rem;">'
        f'<div class="ds-stat"><div class="ds-stat-value">{views:,}</div><div class="ds-stat-label">views today</div></div>'
        f'<div class="ds-stat"><div class="ds-stat-value">{readers}</div><div class="ds-stat-label">reading now</div></div>'
        f'<div class="ds-stat"><div class="ds-stat-value">{shares}</div><div class="ds-stat-label">shares</div></div>'
        f'</div>'
    )


@app.post("/api/subscribe")
@datastar_response
async def subscribe(request: Request):
    signals = await read_signals(request)
    email = signals.get("email", "")
    if "@" in email:
        yield SSE.patch_elements(
            f'<div id="subscribe-result" class="ds-fade-in" style="margin-top: 1rem;">'
            f'<strong class="ds-success">Subscribed!</strong> '
            f'Welcome aboard, {email}.'
            f'</div>'
        )
    else:
        yield SSE.patch_elements(
            f'<div id="subscribe-result" class="ds-fade-in" style="margin-top: 1rem;">'
            f'<strong class="ds-error">Invalid email.</strong> '
            f'<span class="ds-muted">Please try again.</span>'
            f'</div>'
        )


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("ENV", "development") != "production"

    print(f"Serving Quartz site from: {STATIC_DIR}")
    print(f"Static files exist: {STATIC_DIR.exists()}")
    print()
    print(f"Quartz+Datastar server on http://0.0.0.0:{port}")
    print("  API endpoints: /api/time, /api/greet, /api/stats, /api/subscribe")
    app.run(host="0.0.0.0", port=port, debug=debug, auto_reload=debug)
