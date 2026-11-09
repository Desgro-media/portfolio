# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static single-page website for **Desgro Media** — a creative content marketing agency. No build system, no package manager, no framework. Everything runs directly in the browser.

## Running the Site

Open `index.html` directly in a browser, or serve it locally:

```bash
# Node (if npx available) — supports HTTP Range, so <video> plays in Safari
npx serve .

# Python — quick preview, but DO NOT use for Safari video testing (see below)
python -m http.server 8000
```

There is no build step, no compilation, no `npm install`.

### ⚠️ Safari + local server: videos need HTTP Range support

Safari (desktop **and** iOS) refuses to play `<video>` unless the server answers
range requests with **`206 Partial Content`**. Chrome/Firefox tolerate a plain
`200`; Safari does not. `python -m http.server` only ever returns `200` (no
`Accept-Ranges`), so **videos silently fail to load in Safari when previewed
that way** — even though images and everything else work. Use `npx serve .`
(or VS Code Live Server) for local Safari testing. Production is unaffected:
Vercel and the nginx Docker image both support range requests.

Asset paths must also be URL-encoded — the `image assets/` folder has a space
(`image%20assets/`) and a few files contain commas/parens. Spaces auto-encode
in most browsers, but commas do not, so references are encoded explicitly.

## Bandwidth rules (Vercel Fast Data Transfer)

Videos are by far the biggest bandwidth cost; a single careless `<video autoplay>` once used up the monthly quota. When touching media:

- **Never overwrite a file in `video-assets/`** — `vercel.json` serves that folder with `Cache-Control: immutable` for 1 year, so browsers will keep the old bytes. Add the new clip under a **new filename** (e.g. `gym-v2.mp4`) and update the reference.
- **Marquee clips (`.pers-card`) use `data-src`, not `<source>`/`autoplay`.** `main.js` loads them only when the strip is near the viewport and fetches each unique file once, sharing the blob across duplicate cards. Adding a card = just a `<video muted loop playsinline preload="none" data-src="video-assets/x.mp4"></video>`.
- Target for any new clip: audio stripped (`-an`, they're all muted), `+faststart`, width ≤ 2× its display size (marquee cards are 260 CSS px wide → 540 px max), ~300–500 kbps, ideally a ≤ 15 s loop. Hero reel: ≤ ~1 MB.
- Don't leave unreferenced videos in `video-assets/` — everything in the repo is publicly downloadable once deployed.

## File Structure

| File | Purpose |
|---|---|
| `index.html` | Single page — all sections (Hero, Team, Contact) live here |
| `style.css` | All styles, including responsive breakpoints |
| `main.js` | All interactivity — ring carousel, hover, drag, scroll, nav |
| `fonts/` | Self-hosted Anton (display) and DM Sans (body) — loaded via `@font-face` in style.css |
| `image assets/` | Team member photos (1.jpg–11th.jpg) |
| `video assets/` | Brand story reel (autoplay muted) |

## Architecture — 3D Ring Carousel

The centrepiece is a CSS `preserve-3d` ring of team cards in `main.js`, driven entirely by a **single `masterLoop` RAF** (no setInterval, no second loop). Understanding this loop is the key to working on the ring.

**How cards are positioned:**  
Each `.team-card` gets `rotateY(angle) translateZ(radius)` to place it around the ring. The parent `.ring-track` gets `rotateX(-14deg) rotateZ(-18deg) rotateY(currentAngle)` to tilt and spin the ring.

**Physics in `masterLoop` (fires every frame):**
1. Idle nudge — smoothly ramps `velocity` toward `IDLE_SPEED` using exact friction-compensation formula (`IDLE_NUDGE = IDLE_SPEED * (1/FRICTION − 1)`) so velocity converges without a setInterval jerk
2. Friction applied → `currentAngle` advanced → ring rendered
3. Hover card animated (`hoverProgress` 0→1, easeOutCubic)
4. Exiting card animated (`exitProgress` 1→0) in parallel

**Hover state machine — two-card tracking:**  
`hoveredCard` holds the card coming forward; `exitingCard` holds the previous card retreating. This prevents a snap/glitch when the cursor moves between cards. A 60 ms debounce on `mouseleave` absorbs gap-crossing events.

**Hover effect:** `translateZ(POP_Z) scale(POP_SCALE)` in the card's local space — card pops forward in the ring without any rotation. CSS handles dimming of non-hovered cards via `:has(.card-hovered)`.

## Key CSS Conventions

- CSS custom properties in `:root`: `--red`, `--black`, `--white`, `--grey`, `--font-display`, `--font-body`
- Responsive breakpoints: `≤900px` (tablet), `≤768px` (mobile), `≤480px` (small mobile)
- `transform` on `.card-inner` is managed entirely by JS — do **not** add CSS transitions for `transform` on that element
- `.ring-track` and `.team-card` both have `will-change: transform` for GPU compositing
- `.team-section` uses `overflow: visible` (not `hidden`) so 3D-popped cards are not clipped

## Git / Deploy

Remote: `https://github.com/Desgro-media/portfolio.git` (branch `main`)

```bash
git add <files>
git commit -m "message"
git push
```
