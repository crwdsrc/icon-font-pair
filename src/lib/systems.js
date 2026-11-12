// Icon sets and fonts that ship together in production design systems. Every entry is checked against the
// system's own docs (linked in `sources`). Only pairings where both halves are free and on Iconify and
// Google Fonts or Fontsource are listed.
//   prefix   Iconify set
//   prefer   the icon variant the system uses by default, matched against the icon name
//   font     family name as it appears in the font catalog
//   weights  [weight, what the system uses it for]; the first one draws the preview
//   note     what the system does, in plain words
export const SYSTEMS = [
  {
    id: "carbon", name: "Carbon", org: "IBM", prefix: "carbon", font: "IBM Plex Sans",
    weights: [[400, "body"], [600, "headings"]],
    note: "Carbon draws 16 and 20 px icons to sit beside 14 and 16 px Plex text. Larger icons get thicker strokes, from 1 px at 16 px to 2 px at 32 px.",
    sources: [["Carbon icon usage", "https://carbondesignsystem.com/elements/icons/usage/"], ["Carbon typography", "https://carbondesignsystem.com/elements/typography/overview/"]],
  },
  {
    id: "m3", name: "Material Design 3", org: "Google", prefix: "material-symbols", prefer: /-outline$/, font: "Roboto",
    weights: [[400, "body"], [500, "labels and titles"]],
    note: "M3 sets body text in Roboto Regular and labels and titles in Roboto Medium. Material Symbols has a weight axis, so icons can follow the text weight.",
    sources: [["M3 type scale", "https://developer.android.com/jetpack/compose/themes/material3"], ["Material Symbols guide", "https://developers.google.com/fonts/docs/material_symbols"]],
  },
  {
    id: "mui", name: "Material UI", org: "MUI", prefix: "ic", prefer: /^baseline-/, font: "Roboto",
    weights: [[400, "body"]],
    note: "Material UI uses Roboto by default and ships Google's Material Icons as its icon package, with the filled style as the default.",
    sources: [["Material UI installation", "https://mui.com/getting-started/installation/"]],
  },
  {
    id: "vuetify", name: "Vuetify", org: "Vuetify", prefix: "mdi", font: "Roboto",
    weights: [[400, "body"]],
    note: "Vuetify defaults to Material Design Icons, a community set larger than Google's own, and to Roboto for text.",
    sources: [["Vuetify icon fonts", "https://vuetifyjs.com/en/features/icon-fonts/"], ["Vuetify SASS variables", "https://www.mintlify.com/vuetifyjs/vuetify/customization/sass-variables"]],
  },
  {
    id: "primer-brand", name: "Primer Brand", org: "GitHub", prefix: "octicon", prefer: /-24$/, font: "Mona Sans",
    weights: [[400, "body"]],
    note: "GitHub's marketing UI sets Mona Sans from Regular to ExtraBold and uses Octicons next to text, such as custom list bullets.",
    sources: [["GitHub typography", "https://brand.github.com/foundations/typography"], ["GitHub iconography", "https://brand.github.com/graphic-elements/iconography"], ["Primer Brand", "https://primer.style/brand"]],
  },
  {
    id: "pajamas", name: "Pajamas", org: "GitLab", prefix: "pajamas", font: "Inter",
    weights: [[400, "body"], [600, "buttons"]],
    note: "GitLab Sans is Inter with character disambiguation turned on. GitLab says to use Inter where GitLab Sans isn't available. Buttons use SemiBold.",
    sources: [["Pajamas type fundamentals", "https://design.gitlab.com/product-foundations/type-fundamentals"], ["GitLab brand typography", "https://design.gitlab.com/brand-design/typography"]],
  },
  {
    id: "catalyst", name: "Catalyst", org: "Tailwind Labs", prefix: "heroicons", prefer: /-16-solid$/, font: "Inter",
    weights: [[400, "body"]],
    note: "Catalyst is designed with Inter and expects 16 px solid Heroicons in buttons and 20 px solid icons in the sidebar.",
    sources: [["Catalyst docs", "https://catalyst.tailwindui.com/docs"]],
  },
  {
    id: "shadcn", name: "shadcn/ui", org: "shadcn", prefix: "lucide", font: "Geist",
    weights: [[400, "body"]],
    note: "New shadcn/ui projects have used Lucide by default since November 2024. The registry's base styles install Geist as the sans font.",
    sources: [["shadcn/ui icons change", "https://ui.shadcn.com/docs/changelog/2024-11-icons"], ["shadcn CLI v4 fonts", "https://shadcnstudio.com/blog/shadcn-cli-v4-registry-base-and-registry-font"]],
  },
  {
    id: "nuxt-ui", name: "Nuxt UI", org: "Nuxt", prefix: "lucide", font: "Public Sans",
    weights: [[400, "body"], [600, "section headings"]],
    note: "Nuxt UI draws its own component icons from Lucide through Iconify, and its docs set Public Sans as the sans font.",
    sources: [["Nuxt UI fonts", "https://ui.nuxt.com/getting-started/fonts"], ["Nuxt UI icons", "https://ui.nuxt.com/getting-started/icons"]],
  },
  {
    id: "flowbite", name: "Flowbite", org: "Themesberg", prefix: "flowbite", prefer: /-outline$/, font: "Inter",
    weights: [[400, "body"]],
    note: "Flowbite's default theme loads Inter from 300 to 800. Flowbite Icons come in outline and solid versions.",
    sources: [["Flowbite README", "https://github.com/themesberg/flowbite#readme"], ["Flowbite icons for React", "https://github.com/themesberg/flowbite-react-icons"]],
  },
  {
    id: "clarity", name: "Clarity", org: "VMware", prefix: "clarity", prefer: /-line$/, font: "Clarity City",
    weights: [[400, "body"], [500, "semibold"]],
    note: "Clarity never goes heavier than semibold, to keep a light look. Clarity City is based on Metropolis.",
    sources: [["Clarity typography", "https://core.clarity.design/foundation/typography"], ["Clarity icons", "https://core.clarity.design/foundation/icons"]],
  },
  {
    id: "uswds", name: "USWDS", org: "US government", prefix: "ic", prefer: /^baseline-/, font: "Public Sans",
    weights: [[400, "body"]],
    note: "Most USWDS icons are Google Material Icons, plus a few USWDS drew. USWDS also made Public Sans, based on Libre Franklin.",
    sources: [["USWDS package", "https://github.com/uswds/uswds"], ["Public Sans", "https://github.com/uswds/public-sans"]],
  },
];

// What these systems do the same way, for the top of the Suggestions view
export const LESSONS = [
  ["One family for interface text", "Every system here uses a single sans family for interface text. Hierarchy comes from size and weight."],
  ["Icon size follows text size", "Carbon pairs 16 px icons with 14 px text and 20 px icons with 16 px text. Catalyst uses 16 px icons in buttons and 20 px in the sidebar."],
  ["Stroke follows weight", "Carbon thickens strokes as icons grow. Material Symbols has a weight axis so icons can match the text beside them."],
];
