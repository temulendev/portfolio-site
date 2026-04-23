# Portfolio Site — Design Guide

Minimal, personal landing page. HTML, CSS, and JS split across three files at the repo root.

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
├── index.html          ← landing page markup
├── styles.css          ← all styles (design tokens on :root + [data-theme="dark"])
├── script.js           ← player, theme toggle, projects expand, stripes fade-in, goat glow
├── headshot.webp       ← profile photo (circle-cropped in CSS)
├── goatYellow.png      ← decorative goat in card
├── resumepreview.png   ← resume thumbnail preview
├── Temulen_Resume.pdf  ← downloadable resume
├── angelIns.mp3        ← guitar cover track
├── everybreathyoutake.mp3 ← guitar cover track
├── usaflag.png, mongolianflag.png
├── CNAME               ← custom domain config
└── DESIGN.md           ← this file
```

Only external dependency is Google Fonts (Cabin). No build step. Deployed via GitHub Pages on `main` — site serves at `/` (no redirect).

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
"Coming soon..." placeholder.

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
git add index.html
git commit -m "describe change"
git push
```

GitHub Pages auto-deploys from `main` within ~60s.
