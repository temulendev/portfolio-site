# Portfolio Site — Design Implementation Guide

How to translate a new design (from Figma or otherwise) into this site.

---

## Design system at a glance

| Token | Value |
|---|---|
| Background | `#050810` |
| Accent green | `#4ade80` |
| Accent ice | `#7dd3fc` |
| Accent amber | `#f5a623` |
| Text primary | `rgba(255,255,255,0.88)` |
| Text muted | `rgba(255,255,255,0.45)` |
| Name font | Instrument Serif italic (first name only) |
| Body font | Inter 300/400/500/600 |

All tokens live in `:root` at the top of each HTML file's `<style>` block. Change them there and they cascade everywhere.

---

## File structure

```
portfoliosite/
├── index.html      ← main portfolio (all CSS + JS inline)
├── banking.html    ← project detail page (same design system, inline)
├── headshot.webp   ← profile photo (replace to update photo)
├── angelIns.wav    ← ambient music (replace to swap track)
└── bankprogram.mp4 ← unused legacy video
```

There are no separate CSS or JS files. Everything is inline in each HTML file. This keeps deployment simple (GitHub Pages, no build step).

---

## Working from a Figma design

### 1. Map Figma frames to sections

The page has five vertical sections in order:

| Section | CSS selector | Notes |
|---|---|---|
| Hero | `.hero` | Full-screen flex row, name left, photo right |
| Technical + About Me | `.mid-band` | Absolutely positioned children at `left: 8vw` and `left: 55vw` |
| Projects | `.projects` | Repeating `.projects-inner` grid (1fr 2fr) per project |
| Connect | `.connect` | Glass pill links |
| Footer | `footer` | Music button, dim opacity |

### 2. Translate spacing

- Figma px values at 1440px wide → use `vw` for horizontal, `vh` or `px` for vertical
- The hero uses `padding: 10vh 20vw 4vh 8vw` — adjust these to shift content position
- Gaps between sections are controlled by `.mid-band { margin-top }` and `.projects { padding-top }`

### 3. Update colors

Change any of the `:root` variables at the top of `index.html`. Every component that references `var(--accent-ice)` etc. updates automatically.

### 4. Update typography

- To change the display name size: `.name-first` and `.name-last` use `font-size: clamp(min, preferred, max)`
- To change body text: modify `font-size` on `.hero-tagline`, `.about-text`, `.project-desc`
- To swap fonts: replace the Google Fonts `<link>` in `<head>` and update `font-family` values

### 5. Update the background orbs

Three `.orb` divs in `.bg-canvas` control the ambient color blobs. Each has:
- `background: radial-gradient(circle, rgba(r,g,b,opacity), transparent)`
- `filter: blur(Xpx)` — higher = softer
- `animation: drift-N Xs ease-in-out infinite alternate` — controls drift speed

To redesign the atmosphere: change the rgba color and/or opacity of each orb. You can also reposition them with `top/bottom/left/right`.

### 6. Add a new project card

Copy this block inside `<section class="projects">`:

```html
<div class="project-divider" aria-hidden="true"></div>

<div class="projects-inner">
  <div class="project-left">
    <h2 class="project-title">Project Name</h2>
    <span class="project-tag">Tag</span>
    <p class="project-desc">Short description here.</p>
    <a href="page.html" class="project-link">View project →</a>
  </div>

  <!-- Right side: terminal mockup OR coming-soon card -->
  <div class="coming-soon-card">
    <span class="coming-soon-emoji">🔧</span>
    <span class="coming-soon-text">Coming soon</span>
  </div>
</div>
```

For a project with a live page, replace the right side with a `.terminal` block (copy from the Temulen's Bank card) and update the text content inside `.terminal-body`.

For an "In Progress" tag with pulsing glow, add the class `in-progress` to the tag:
```html
<span class="project-tag in-progress">In Progress</span>
```

### 7. Update the terminal mockup content

Inside `.terminal-body`, the content is plain HTML with helper classes:
- `.t-dim` — dimmed green (40% opacity), for prompts and labels
- `.t-bright` — bright mint (`#a7f3d0`), for values and output
- `.t-cursor` — blinking block cursor

Use `<br>` for line breaks and `&nbsp;` for indentation.

### 8. Scroll reveal

The blur-reveal effect is applied via the `.blur-reveal` CSS class. Elements start at `blur(20px) opacity(0) translateY(10px)` and transition to sharp/visible when they enter the viewport.

To apply it to a new section:
1. Add `class="blur-reveal"` to the element
2. Optionally add `data-blur-delay="200"` (milliseconds) for a staggered reveal

The IntersectionObserver in the `<script>` block at the bottom of the file handles the rest automatically.

---

## Updating the photo

Replace `headshot.webp` in the repo root. Keep the filename the same, or update the `src` attribute in `.hero-photo-wrapper img` and the `background-image` URLs in any CSS pseudo-elements.

Recommended: circular crop, minimum 400×400px, exported as `.webp` for performance.

## Deploying changes

The site is hosted on GitHub Pages via the `main` branch. Push to `main` and GitHub deploys automatically within ~60 seconds.

```bash
git add index.html banking.html
git commit -m "describe your change"
git push
```

Transition background color: `#071428`
