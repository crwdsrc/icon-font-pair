// Icon sets and fonts that ship together in production design systems. Every entry is checked against the
// system's own docs (linked in `sources`). Only pairings where both halves are free and on Iconify and
// Google Fonts or Fontsource are listed.
//   prefix   Iconify set
//   icons    home, search and settings in the variant the system uses by default; hero: the headline icon
//   word     what the randomizer searches for when the pair opens there
//   font     family name as it appears in the font catalog
//   weights  [weight, what the system uses it for]; the first draws the rows, the last the headline
//   headFont a separate heading font, when the system has one
//   note     what the system does, in plain words
export const SYSTEMS = [
  {
    id: "carbon", icons: ["home", "search", "settings"], hero: "download", word: "download", name: "Carbon", org: "IBM", prefix: "carbon", font: "IBM Plex Sans",
    weights: [[400, "body"], [600, "headings"]],
    note: "Carbon draws 16 and 20 px icons to sit beside 14 and 16 px Plex text. Larger icons get thicker strokes, from 1 px at 16 px to 2 px at 32 px.",
    sources: [["Carbon icon usage", "https://carbondesignsystem.com/elements/icons/usage/"], ["Carbon typography", "https://carbondesignsystem.com/elements/typography/overview/"]],
  },
  {
    id: "m3", icons: ["home-outline", "search-outline", "settings-outline"], hero: "download-outline", word: "download", name: "Material Design 3", org: "Google", prefix: "material-symbols", font: "Roboto",
    weights: [[400, "body"], [500, "labels and titles"]],
    note: "M3 sets body text in Roboto Regular and labels and titles in Roboto Medium. Material Symbols has a weight axis, so icons can follow the text weight.",
    sources: [["M3 type scale", "https://developer.android.com/jetpack/compose/themes/material3"], ["Material Symbols guide", "https://developers.google.com/fonts/docs/material_symbols"]],
  },
  {
    id: "mui", icons: ["baseline-home", "baseline-search", "baseline-settings"], hero: "baseline-download", word: "download", name: "Material UI", org: "MUI", prefix: "ic", font: "Roboto",
    weights: [[400, "body"]],
    note: "Material UI uses Roboto by default and ships Google's Material Icons as its icon package, with the filled style as the default.",
    sources: [["Material UI installation", "https://mui.com/getting-started/installation/"]],
  },
  {
    id: "vuetify", icons: ["home", "magnify", "cog"], hero: "download", word: "download", name: "Vuetify", org: "Vuetify", prefix: "mdi", font: "Roboto",
    weights: [[400, "body"]],
    note: "Vuetify defaults to Material Design Icons, a community set larger than Google's own, and to Roboto for text.",
    sources: [["Vuetify icon fonts", "https://vuetifyjs.com/en/features/icon-fonts/"], ["Vuetify SASS variables", "https://www.mintlify.com/vuetifyjs/vuetify/customization/sass-variables"]],
  },
  {
    id: "primer-brand", icons: ["home-24", "search-24", "gear-24"], hero: "download-24", word: "download", name: "Primer Brand", org: "GitHub", prefix: "octicon", font: "Mona Sans",
    weights: [[400, "body"]],
    note: "GitHub's marketing UI sets Mona Sans from Regular to ExtraBold and uses Octicons next to text, such as custom list bullets.",
    sources: [["GitHub typography", "https://brand.github.com/foundations/typography"], ["GitHub iconography", "https://brand.github.com/graphic-elements/iconography"], ["Primer Brand", "https://primer.style/brand"]],
  },
  {
    id: "pajamas", icons: ["home", "search", "settings"], hero: "download", word: "download", name: "Pajamas", org: "GitLab", prefix: "pajamas", font: "Inter",
    weights: [[400, "body"], [600, "headings"]],
    note: "GitLab Sans is Inter with character disambiguation turned on. GitLab says to use Inter where GitLab Sans isn't available. Body text uses 400 and headings use SemiBold 600.",
    sources: [["Pajamas type fundamentals", "https://design.gitlab.com/product-foundations/type-fundamentals"], ["GitLab brand typography", "https://design.gitlab.com/brand-design/typography"]],
  },
  {
    id: "catalyst", icons: ["home-16-solid", "magnifying-glass-16-solid", "cog-6-tooth-16-solid"], hero: "arrow-down-tray-16-solid", word: "arrow-down-tray", name: "Catalyst", org: "Tailwind Labs", prefix: "heroicons", font: "Inter",
    weights: [[400, "body"]],
    note: "Catalyst is designed with Inter and expects 16 px solid Heroicons in buttons and 20 px solid icons in the sidebar.",
    sources: [["Catalyst docs", "https://catalyst.tailwindui.com/docs"]],
  },
  {
    id: "shadcn", icons: ["house", "search", "settings"], hero: "download", word: "download", name: "shadcn/ui", org: "shadcn", prefix: "lucide", font: "Geist",
    weights: [[400, "body"]],
    note: "New shadcn/ui projects have used Lucide by default since November 2024. The registry's base styles install Geist as the sans font.",
    sources: [["shadcn/ui icons change", "https://ui.shadcn.com/docs/changelog/2024-11-icons"], ["shadcn CLI v4 fonts", "https://shadcnstudio.com/blog/shadcn-cli-v4-registry-base-and-registry-font"]],
  },
  {
    id: "nuxt-ui", icons: ["house", "search", "settings"], hero: "download", word: "download", name: "Nuxt UI", org: "Nuxt", prefix: "lucide", font: "Public Sans",
    weights: [[400, "body"], [600, "section headings"]],
    note: "Nuxt UI draws its own component icons from Lucide through Iconify. It falls back to the system font, but its docs and starter template set Public Sans.",
    sources: [["Nuxt UI fonts", "https://ui.nuxt.com/getting-started/fonts"], ["Nuxt UI icons", "https://ui.nuxt.com/getting-started/icons"]],
  },
  {
    id: "flowbite", icons: ["home-outline", "search-outline", "cog-outline"], hero: "download-outline", word: "download", name: "Flowbite", org: "Themesberg", prefix: "flowbite", font: "Inter",
    weights: [[400, "body"]],
    note: "Flowbite's default theme loads Inter from 300 to 800. Flowbite Icons come in outline and solid versions.",
    sources: [["Flowbite README", "https://github.com/themesberg/flowbite#readme"], ["Flowbite icons for React", "https://github.com/themesberg/flowbite-react-icons"]],
  },
  {
    id: "clarity", icons: ["home-line", "search-line", "cog-line"], hero: "download-line", word: "download", name: "Clarity", org: "VMware", prefix: "clarity", font: "Clarity City",
    weights: [[400, "body"], [500, "semibold"]],
    note: "Clarity never goes heavier than semibold, to keep a light look. Clarity City is based on Metropolis.",
    sources: [["Clarity typography", "https://core.clarity.design/foundation/typography"], ["Clarity icons", "https://core.clarity.design/foundation/icons"]],
  },
  {
    id: "uswds", icons: ["baseline-home", "baseline-search", "baseline-settings"], hero: "baseline-download", word: "download", name: "USWDS", org: "US government", prefix: "ic", font: "Source Sans 3",
    weights: [[400, "body"]],
    note: "Most USWDS icons are Google Material Icons, plus a few USWDS drew. The default sans font is Source Sans Pro, now called Source Sans 3. USWDS also made Public Sans and ships it as an option.",
    sources: [["USWDS font tokens", "https://designsystem.digital.gov/design-tokens/typesetting/font-family/"], ["USWDS package", "https://github.com/uswds/uswds"]],
  },
  {
    id: "kern", icons: ["home-outline", "search-outline", "settings-outline"], hero: "download-outline", word: "download", name: "KERN", org: "German government", prefix: "material-symbols", font: "Fira Sans",
    weights: [[400, "body"], [600, "headings"]],
    note: "KERN is the German federal and state UX standard. It sets everything in Fira Sans, with Regular 400 for body text and SemiBold 600 for most headings, and uses Google Material Symbols for icons.",
    sources: [["KERN typography", "https://www.kern-ux.de/design-system/foundations/typografie"], ["KERN icons", "https://www.designsystem.gov.de/design-system/foundations/icons"]],
  },
  {
    id: "gravity", icons: ["house", "magnifier", "gear"], hero: "arrow-down-to-line", word: "house", name: "Gravity UI", org: "Yandex", prefix: "gravity-ui", font: "Inter",
    weights: [[400, "body"], [600, "headers"]],
    note: "Gravity UI sets Inter as its sans font and uses SemiBold 600 for headers. Yandex Cloud built it for consoles, admin panels and dashboards.",
    sources: [["Gravity UI typography", "https://cdn.jsdelivr.net/npm/@gravity-ui/uikit@7.46.0/build/docs/guides/typography.md"], ["Gravity UI announcement", "https://medium.com/yandex/gravity-ui-easily-create-your-own-interface-32985f939f1c"]],
  },
  {
    id: "unity", icons: ["house", "magnifying-glass", "gear"], hero: "download", word: "download", name: "App UI", org: "Unity", prefix: "ph", font: "Inter",
    weights: [[400, "regular"], [600, "semibold"]],
    note: "Unity's App UI ships Inter in Regular and SemiBold. Its icon variants match Phosphor's six weights, and its docs show how to add the full Phosphor set through a Unity package.",
    sources: [["App UI typography", "https://docs.unity3d.com/Packages/com.unity.dt.app-ui@2.0/manual/custom-typography.html"], ["App UI custom icons", "https://docs.unity3d.com/Packages/com.unity.dt.app-ui@1.0/manual/custom-icons.html"]],
  },
  {
    id: "patternfly", icons: ["home", "search", "cog"], hero: "download", word: "download", name: "PatternFly 5", org: "Red Hat", prefix: "fa-solid", font: "Red Hat Text", headFont: "Red Hat Display",
    weights: [[400, "body"], [700, "headings"]],
    note: "PatternFly 5 sets headings in Red Hat Display and body text in Red Hat Text, and ships Font Awesome 5 icons. PatternFly 6 moved to Red Hat's own icons, which aren't on Iconify.",
    sources: [["PatternFly 5 setup", "https://v5-archive.patternfly.org/get-started/develop"], ["PatternFly 5 typography", "https://v5-archive.patternfly.org/design-foundations/typography"]],
  },
];

// What these systems do the same way, for the top of the Design systems view
export const LESSONS = [
  ["One family for interface text", "Every system here uses a single sans family for interface text. Hierarchy comes from size and weight."],
  ["Icon size follows text size", "Carbon pairs 16 px icons with 14 px text and 20 px icons with 16 px text. Catalyst uses 16 px icons in buttons and 20 px in the sidebar."],
  ["Stroke follows weight", "Carbon thickens strokes as icons grow. Material Symbols has a weight axis so icons can match the text beside them."],
];
