# Third-party notices

This project builds on open icon sets, fonts and libraries. It does not ship icon or font files: icon shapes load from the Iconify API and fonts from Google Fonts and jsDelivr at runtime. Each keeps its own license, and the page shows the relevant license with every pairing.

## Icon sets

Icons come from the [Iconify API](https://iconify.design/docs/api/), which serves every public icon set under the set's original license. The page does not bundle any set. For each pairing it shows the set, its author and its license, links to the license, and:

- marks sets under CC BY, CC BY-SA or GPL as needing credit, and CC BY-NC sets as non-commercial,
- adds a credit comment to the copied code for those sets.

Iconify's own API and packages are MIT licensed.

## Fonts

- **Google Fonts:** catalog metadata from [google-font-metadata](https://github.com/fontsource/google-font-metadata) (MIT). Fonts are served by Google Fonts under their own licenses, mostly the SIL Open Font License 1.1, with some under Apache 2.0 and the Ubuntu Font License.
- **Google Fonts tags:** `vendor/google-fonts-tags.csv` comes from the [google/fonts](https://github.com/google/fonts) repository.
- **Fontsource:** metadata from the [Fontsource](https://fontsource.org) packages. Fonts are served by the Fontsource CDN on jsDelivr. Licenses of the 148 families: OFL-1.1 (144), CC0-1.0 (1), Apache-2.0 (1), mit (1), Unlicense (1). Some families ask for attribution, which the page shows next to the typeface.

## Interface

- **Svelte** (MIT) and **Vite** (MIT) build the page.
- **Web Awesome** free components and default theme (MIT), by Font Awesome.
- **Lucide** (ISC) icons for the interface controls, inlined in `src/lib/ui-icons.js`.

## Build tools

Node.js packages are listed in `package.json` and `package-lock.json` with their own licenses.
