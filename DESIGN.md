# Portfolio Site — Design Guide

Minimal, personal landing page built with Astro. Visual design is unchanged from the original static site. Day-to-day content edits: see [EDITING.md](EDITING.md).

---

## Layout

Two-column CSS grid on desktop (`1.1fr 1fr`, max-width 960px, centered).

| Column | Content |
|---|---|
| **Left — Card** | Bordered card with color stripes, What I'm Up To, Projects (expandable), Resume, goat decoration, Blog, Contact |
| **Right — Sidebar** | Circular headshot, name + subtitle, Y2K music player |

On mobile (≤820px): single column, sidebar stacks above the card. Player follows headshot/name.

---

## Design tokens (light mode default)

| Token | Value |
|---|---|
| Background | `#ffffff` (dark: `#131316`) |
| Text primary | `#1a1a1a` (dark: `#c8c8cc`) |
| Text secondary | `#555` (dark: `#999`) |
| Text muted | `#888` (dark: `#666`) |
| Card background | `#f7f7f7` (dark: `#1c1c20`) |
| Card border | `#d0d0d0` (dark: `#3a3a3e`) |
| Heading color | `#1a1a1a` (dark: `#e8e8ec`) |
| Stripe blue | `#3558A0` (10px tall) |
| Stripe yellow | `#E8B832` (7px tall) |
| Stripe red | `#C4342D` (4px tall) |
| Font | `Cabin` (Google Fonts) with system fallbacks |
| Player body | `#1c1c1f` flat |
| Player LCD | `#111` flat |
| Player accent | `#fff` (white — no green) |

**Style rules:** No gradients, no border-radius on rectangles, no drop shadows. Hard edges throughout. Headshot circle is the only rounded element.

---

## Dark mode

Toggle button (☾/☀) fixed top-right. Preference saved to `localStorage`. CSS custom properties on `[data-theme="dark"]` handle all color swaps. Default is light mode.

---

## File structure

```
portfoliosite/
├── src/
│   ├── pages/              ← routes (index, blog)
│   ├── components/         ← MainCard, MusicPlayer, etc.
│   ├── layouts/            ← BaseLayout, BlogLayout
│   ├── styles/             ← CSS partials (concatenated on build)
│   └── scripts/            ← theme, landing player, goat
├── data/                   ← tracks, projects, now, blog-posts (JSON)
├── public/                 ← static assets + built styles.css & scripts
├── dist/                   ← output (gitignored; GitHub Pages deploys this)
├── DESIGN.md               ← this file
└── EDITING.md              ← how to change content and ship
```

External dependency: Google Fonts (DM Sans). Build: `npm run build`. Deployed via GitHub Actions to Pages from `dist/`.

---

## Sections

### Color stripes
Three horizontal bars at top of card: blue (thickest, 10px), yellow (7px), red (thinnest, 4px). Decorative.

### What I'm Up To
Personal bio text. Links to CribCub and Instagram inline.

### Projects
Click-to-expand toggle with `(click)` / `(hide)` hint. Dash decorators are part of the anchor tag (full row is clickable). CribCub links to www.cribcub.com.
- Banking App
- LinkedIn Note Generator
- CribCub

### Resume
Preview thumbnail + "Status: Up to date!" + last updated date + download link. No red text.

### Blog
Index at `/blog/`; posts linked from `data/blog-posts.json`.

### Contact
- temulen.iveelt@gmail.com
- LinkedIn
- GitHub

### Goat
`goatYellow.png` floated right at card bottom. Decorative.

---

## Y2K Music Player

Simplified audio player inspired by late-1990s Sony hardware.

**Body:** Flat dark background (`#1c1c1f`), no gradients, no shadows.

**LCD screen:** Dark background (`#111`) with CRT scanline overlay. White monospace text (`Courier New`). Displays:
- Track filename, artist, date
- 32-bar waveform visualization (Web Audio API `AnalyserNode`, white bars)
- Progress bar with smooth drag-to-seek and scrub head dot

**Transport controls:** Single play/pause button (one song only).

**Loop toggle:** Button with LED indicator (white when active).

**Animations:**
- `glitch` — occasional text distortion on track title (~0.5s every 10s cycle)
- `breathe` — power LED pulsing opacity
- `idlePulse` — gentle bar wave when not playing

**Keyboard:** Spacebar toggles play/pause.

---

## Responsive breakpoints

| Breakpoint | Changes |
|---|---|
| ≤820px | Single column, sidebar first, headshot 200px, max-width 480px container |
| ≤480px | Tighter padding, smaller headshot (170px), resume stacks vertically |

---

## Deploying

```bash
npm run build   # optional locally
git add .
git commit -m "describe change"
git push
```

GitHub Actions builds and publishes `dist/` (see [EDITING.md](EDITING.md)).
