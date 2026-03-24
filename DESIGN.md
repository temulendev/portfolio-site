# Portfolio Site — Design Guide

Minimal, personal landing page. All CSS/JS inline in `index.html`.

---

## Layout

Two-column CSS grid on desktop (`1.1fr 1fr`, max-width 960px, centered).

| Column | Content |
|---|---|
| **Left — Card** | Bordered card with color stripes, About Me, Projects list, Resume preview, goat decoration, Blog |
| **Right — Sidebar** | Circular headshot, name + subtitle, Y2K music player |

On mobile (≤820px): single column, sidebar stacks above the card. Player follows headshot/name.

---

## Design tokens

| Token | Value |
|---|---|
| Background | `#fff` |
| Text primary | `#1a1a1a` |
| Text secondary | `#333` / `#555` |
| Card border | `1.5px solid #aaa` |
| Stripe blue | `#3558A0` |
| Stripe yellow | `#E8B832` |
| Stripe red | `#C4342D` |
| Resume date red | `#c41e1e` |
| Headings font | System sans-serif (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial`) |
| Body font | `Georgia, 'Times New Roman', serif` |
| Player LCD green | `#00ff41` |
| Player body | `#1c1c1f` gradient |

---

## File structure

```
portfoliosite/
├── index.html          ← landing page (all CSS + JS inline)
├── headshot.webp       ← profile photo (circle-cropped in CSS)
├── goatYellow.png      ← decorative goat in card
├── resumepreview.png   ← resume thumbnail preview
├── Temulen_Resume.pdf  ← downloadable resume
├── angelIns.wav        ← music track for Y2K player
├── CNAME               ← custom domain config
└── DESIGN.md           ← this file
```

No external CSS/JS files. No build step. Deployed via GitHub Pages on `main`.

---

## Sections

### Color stripes
Three horizontal bars at top of card (blue, yellow, red). Decorative, ~7px tall each.

### About Me
Placeholder lorem ipsum. Replace with real bio.

### Projects
List with `——` line decorators. Each links to a project page (currently `#` placeholder).
- Banking App
- LinkedIn Note Generator
- CribCub

### Resume
Small preview thumbnail (`resumepreview.png`) + "Last updated" date in red + "Click to download" link to PDF.

### Blog
"Coming soon..." placeholder.

### Goat
`goatYellow.png` floated right at card bottom. Decorative.

---

## Y2K Music Player

Standalone audio player inspired by late-1990s Sony hardware and Aphex Twin / Warp Records visual aesthetic.

**Body:** Dark metallic gradient with chrome edge highlight and plastic sheen overlay.

**LCD screen:** Dark green-tinted background with CRT scanline overlay and vignette. Green monospace text (`Courier New`). Displays:
- Track filename, artist, date
- 32-bar waveform visualization (Web Audio API `AnalyserNode`, falls back to random animation)
- Progress bar with seek-on-click and glowing scrub head

**Transport controls:** Five metallic buttons (skip back, rewind, play/pause, fast-forward, skip forward). Rewind and FF support hold-to-seek (mouse and touch).

**Loop toggle:** Hardware-style button with LED indicator.

**Animations:**
- `glitch` — occasional text distortion on track title (~0.5s every 10s cycle)
- `breathe` — power LED pulsing glow
- `idlePulse` — gentle bar wave when not playing
- CRT vignette on LCD

**Keyboard:** Spacebar toggles play/pause.

---

## Responsive breakpoints

| Breakpoint | Changes |
|---|---|
| ≤820px | Single column, sidebar first, headshot 200px, max-width 480px container |
| ≤480px | Tighter padding, smaller headshot (170px), resume stacks vertically, smaller player controls |

---

## Deploying

```bash
git add index.html
git commit -m "describe change"
git push
```

GitHub Pages auto-deploys from `main` within ~60s.
