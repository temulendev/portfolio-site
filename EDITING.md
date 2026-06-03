# How to edit this site

The site is built with [Astro](https://astro.build). Source lives under `src/`; `npm run build` writes a static site to `dist/` for GitHub Pages.

## Content (edit these first)

| What | File |
|------|------|
| Music tracks | [`data/tracks.json`](data/tracks.json) (optional `"video": "/file.mov"` per track) |
| Default track on load | [`data/player.json`](data/player.json) (`defaultTrackIndex`, 0-based) |
| Projects list | [`data/projects.json`](data/projects.json) |
| Now card | [`data/now.json`](data/now.json) |
| Blog index entries | [`data/blog-posts.json`](data/blog-posts.json) |

After changing JSON, run `npm run build` (or `npm run dev` for local preview).

## Layout and copy

| What | File |
|------|------|
| Landing page structure | [`src/pages/index.astro`](src/pages/index.astro) |
| Main card sections | [`src/components/MainCard.astro`](src/components/MainCard.astro) |
| Music player markup | [`src/components/MusicPlayer.astro`](src/components/MusicPlayer.astro) |
| Sidebar / profile | [`src/components/Sidebar.astro`](src/components/Sidebar.astro) |
| Blog list | [`src/pages/blog/index.astro`](src/pages/blog/index.astro) |

## Styles

CSS is split under [`src/styles/`](src/styles/). Edit the relevant partial, then run:

```bash
npm run build:assets
```

That concatenates partials into [`public/styles.css`](public/styles.css), which Astro copies to `dist/styles.css` on build.

Visual rules and tokens: [`DESIGN.md`](DESIGN.md).

## Scripts

| Script | Role |
|--------|------|
| [`src/scripts/theme.js`](src/scripts/theme.js) | Dark mode + color themes (all pages) |
| [`src/scripts/landing.js`](src/scripts/landing.js) | Player, projects toggle, stripes (home only) |
| [`src/scripts/goat.js`](src/scripts/goat.js) | Goat hover glow (home only) |

Run `npm run build:assets` after editing so `public/scripts/` stays in sync.

Track videos (e.g. Killswitch) live in [`public/`](public/) and play muted behind the waveform only while that track is playing.

## New blog post

1. Add an entry at the top of [`data/blog-posts.json`](data/blog-posts.json).
2. Copy [`docs/blog/POST_TEMPLATE.astro`](docs/blog/POST_TEMPLATE.astro) to `src/pages/blog/posts/<slug>.html.astro` and fill in content.
3. `npm run build` — the post is flattened to `dist/blog/posts/<slug>.html` for the same URLs as before.

## Local preview

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:4321`).

## Deploy

Pushes to `main` run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds `dist/` and publishes via GitHub Pages.

**One-time repo setup:**

1. [Repo Settings → Pages](https://github.com/temulendev/portfolio-site/settings/pages)
2. **Build and deployment → Source:** **GitHub Actions** (not “Deploy from a branch”)
3. **Custom domain:** enter `temuleniveelt.com` and click **Save** (required after switching to Actions — GitHub often clears the old binding)
4. Wait until the DNS check is green, then enable **Enforce HTTPS**

`public/CNAME` is copied into `dist/` on every build so GitHub knows the domain.

### Troubleshooting “There isn’t a GitHub Pages site here”

| Check | What to do |
|-------|------------|
| Actions deploy | [Actions tab](https://github.com/temulendev/portfolio-site/actions) → latest **Deploy to GitHub Pages** must be green (build + deploy jobs) |
| Custom domain | Re-save `temuleniveelt.com` under Settings → Pages (see step 3 above) |
| Wrong URL | Project URL is `https://temulendev.github.io/portfolio-site/` until the custom domain is linked; `https://temuleniveelt.com/` is the real site |
| DNS | Apex should use GitHub’s A records (`185.199.108.153` etc.); `www` can CNAME to `temulendev.github.io` |
| Propagation | After re-saving the domain, allow 5–15 minutes |

The legacy **pages build and deployment** workflow may fail on `main` after the Astro migration (no `index.html` at repo root). That is expected; ignore it if **Deploy to GitHub Pages** succeeds.

### Re-deploy manually

Actions → **Deploy to GitHub Pages** → **Run workflow** → Run on `main`.

## Parity checklist (before shipping visual changes)

- [ ] Home layout at desktop (~1280px) and mobile (~375px)
- [ ] Light and dark mode; each color theme swatch
- [ ] Projects expand/collapse and goat zoom
- [ ] Player: default track, play/pause, skip, loop, seek, waveform, title glitch
- [ ] Blog index and post pages; back links
- [ ] Resume download and external links
Here to push