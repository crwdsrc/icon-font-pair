# Icon + Type

Spin to pair an icon set with a free font. A [crwdsrc.dev](https://crwdsrc.dev) experiment.

Type an icon name or meaning and a short text, then spin. The page picks an icon, a typeface and a weight at random from your filters, previews them together in common UI patterns and gives you copyable HTML and CSS. Keep any of the three to spin only the others.

- Icons come from every public icon set on [Iconify](https://iconify.design). A word search finds the word and its style variants in each set. "download", for example, turns up in about 175 sets.
- Fill, line weight, corner shape and level of detail are read from each icon's SVG, so nothing is tagged by hand.
- 2,053 fonts: the Google Fonts catalog plus 148 Fontsource families that are not on Google Fonts.
- Icon filters: style (outline, filled, duotone, color), stroke weight, traits, design grid, license, icon set category, set size and individual icon sets.
- Font weight: pick a weight from Thin 100 to Black 900 and every spin uses it, with only fonts that have it in the pool. Any weight picks at random.
- Font filters: source, category, width, style, mood, visual style, classification, license, script, quality, name and excluded families.
- Every filter option shows how many results it would leave. Options that would leave none are disabled. When a new word leaves nothing, the page offers the filters to remove.
- Saved pairings, recent spins and excluded families are kept in the browser's local storage.
- Preview settings: light or dark, left-to-right or right-to-left, text size and stroke matching. These change the preview only.

## Stack

- [Svelte 5](https://svelte.dev) with [Vite](https://vite.dev)
- [Web Awesome 3](https://webawesome.com) components and its default theme
- No server code: the build is static files served by nginx

## How it works

| Piece | Where it comes from |
| --- | --- |
| Icon search and shapes | The [Iconify API](https://iconify.design/docs/api/) at runtime (`api.iconify.design`, with its two public mirrors as fallbacks): `/search` for the word, `/{prefix}.json?icons=` for shapes |
| Google Fonts catalog | Built from the `google-font-metadata` npm package |
| Google Fonts classification, mood and quality tags | `vendor/google-fonts-tags.csv`, copied from [google/fonts](https://github.com/google/fonts/blob/main/tags/all/families.csv) |
| Google Fonts files | `fonts.googleapis.com` |
| Fontsource catalog | `vendor/fontsource/families.json` |
| Fontsource font files | The [Fontsource CDN on jsDelivr](https://fontsource.org/docs/getting-started/cdn), pinned to the package version |

`scripts/build-data.cjs` writes the font catalog to `src/generated/fonts.json`. Vite bundles it as its own content-hashed chunk (about 45 KB gzipped), so it stays cached across code changes.

### Reading icon traits

For each icon kept for a word, `src/lib/iconify.js`:

- takes fill and weight hints from the name (`-outline`, `-fill`, `-duotone`, `-bold`, `-thin`, `twotone-`, `-24-filled` and so on) and color from the set's palette flag,
- reads `stroke-width` and line caps from icons drawn with strokes,
- rasterizes icons drawn as filled paths at 48 px and measures the widest solid spot and the average line width, which tells filled from outline and gives a line weight,
- counts path commands for the minimal and detailed traits.

The thresholds sit at the top of the "reading shapes" section of that file.

## Project layout

```
index.html                     Vite entry
src/main.js                    Loads Web Awesome, styles and the app
src/App.svelte                 Header, three-column layout, footer
src/components/                Create panel, preview, spin panel, settings and small controls
src/lib/iconify.js             Iconify search, shape loading and trait reading
src/lib/filters.js             Filter definitions, counts per option and the way out of empty results
src/lib/pick.js                Random picking that respects locks
src/lib/fonts.js               Font catalog, labels and loaders
src/lib/render.js              Lockup markup, icon alignment, links and the code snippet
src/lib/store.svelte.js        App state and actions
src/app.css                    Layout and preview styles on Web Awesome tokens
scripts/build-data.cjs         Builds src/generated/fonts.json
scripts/compress.cjs           Writes .gz copies of dist/ for nginx
scripts/preview.cjs            Serves dist/ locally
scripts/update-fontsource.cjs  Refreshes vendor/fontsource/families.json from npm
vendor/                        Metadata that is not available as an npm package
Dockerfile, nginx.conf         Production image
```

## Run it locally

You need Node 20 or newer (`.nvmrc` pins 22, so `nvm use` picks it up) and a network connection: the page loads icons from the Iconify API and fonts from Google Fonts and jsDelivr while it runs.

Install the dependencies once:

```sh
npm ci
```

### Development server

```sh
npm run dev
```

This builds the font catalog, then starts Vite on http://localhost:5173 with hot reload. Edits to `.svelte`, `.js` and `.css` files show up without a refresh.

- Use another port: `npm run dev -- --port 3000`
- Open it from a phone or another computer on your network: `npm run dev -- --host`, then use the Network address Vite prints.

### Production build

```sh
npm start
```

This builds `dist/` and serves it on http://localhost:8080, the same files the Docker image serves. To run the steps one at a time:

```sh
npm run build      # font catalog, Vite build, .gz copies, all into dist/
npm run preview    # serves dist/ on http://localhost:8080
PORT=3000 npm run preview
```

The preview server also answers `/healthz`, like the production image.

### With Docker

To check the production image, nginx config and security headers before deploying:

```sh
docker build -t icon-type .
docker run --rm -p 8080:80 icon-type
```

Then open http://localhost:8080.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run data` | Writes `src/generated/fonts.json` from the font metadata. `dev` and `build` run it for you. |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves `dist/` |
| `npm start` | `build`, then `preview` |

### Troubleshooting

- **"Couldn't reach the Iconify API"** under the icon field: the browser can't reach `api.iconify.design` or its two mirrors. Check your connection, VPN or ad blocker, then edit the word to search again.
- **Text shows in a fallback font:** Google Fonts or jsDelivr is blocked on your network.
- **`dist/ is empty` from `npm run preview`:** run `npm run build` first.
- **Port already in use:** pass another port as shown above.

## Deploy on Coolify

The live site runs at https://crwdsrc.dev/experiments/icon-type-pair from [crwdsrc/icon-font-pair](https://github.com/crwdsrc/icon-font-pair), deployed by Coolify through the `crwdsrc-deploy` GitHub App.

1. In Coolify, open the project and environment, then choose **+ New** > **Git Repository (with GitHub App)** > `crwdsrc-deploy` and pick the repository and the `main` branch.
2. Set **Build Pack** to **Dockerfile**. Leave Base Directory at `/` and Dockerfile Location at `/Dockerfile`.
3. Set **Ports Exposes** to `80`.
4. Set the domain to `https://crwdsrc.dev/experiments/icon-type-pair`. Coolify routes that path to the container. Coolify's proxy handles HTTPS.
5. Add the environment variable `BASE_PATH` with the value `/experiments/icon-type-pair/` and mark it as available at build time. Vite writes it into every asset URL.
6. Deploy. Pushes to `main` deploy again through the GitHub App webhook.

To serve the site from the root of a domain instead, leave `BASE_PATH` unset.

The domain needs a DNS record that points at the Coolify server (an `A` record for `crwdsrc.dev`).

The image defines its own `HEALTHCHECK` on `/healthz`, which Coolify uses instead of a dashboard-configured check. The build does not need `SOURCE_COMMIT`, so you can leave **Include Source Commit in Build** off and keep the build cache.

To run the image anywhere else, see [With Docker](#with-docker). Pass `--build-arg BASE_PATH=/some/path/` to build for a path.

### nginx

`nginx.conf` serves the precompressed `.gz` files, never caches `index.html`, caches the hashed files under `/assets/` for a year, and sends a Content Security Policy. It answers `/assets/...` and the page under any path prefix too, so the site works whether or not the proxy strips the prefix. The policy allows the Iconify API hosts, Google Fonts and jsDelivr, plus `data:` for Web Awesome's built-in icons. If you add another API or CDN, add it to the policy.

## Updating data

- **Google Fonts:** bump `google-font-metadata`. To refresh the tags, download `https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv` to `vendor/google-fonts-tags.csv`.
- **Fontsource:** run `node scripts/update-fontsource.cjs`, or pass new ids to add families. Hand-made classifications for families without Google tags live in `HAND` in `scripts/build-data.cjs`.
- **Icons:** nothing to update. New sets and icons on Iconify show up on their own. Per-icon page links for Lucide, Tabler, Bootstrap Icons and Boxicons are in `iconPage()` in `src/lib/render.js`. Other sets open the icon's page on Iconify.

## Configuration

- `GITHUB_URL` in `src/App.svelte` sets the GitHub links in the header and footer.
- `BASE_PATH` (environment variable at build time) sets the URL path the site is served from. It defaults to `/`.
- Local storage keys: `pairing-saved-spins`, `pairing-excluded-families`, `pairing-theme`, `pairing-direction`. Saved pairings from the earlier single-file version are not carried over.

## Licenses

Each icon set and font keeps its own license. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The page shows the license for every pairing, flags sets that need credit or forbid commercial use, and adds a credit comment to the copied code.

No license has been chosen for this project's own code yet. `package.json` says `UNLICENSED` until one is added.
