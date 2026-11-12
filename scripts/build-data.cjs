#!/usr/bin/env node
// Builds the font catalog for Icon + Type.
// Reads google-font-metadata, vendor/google-fonts-tags.csv and vendor/fontsource/families.json and writes
// src/generated/fonts.json, which Vite bundles as its own content-hashed chunk.
// Icons come from the Iconify API at runtime, so nothing about icons is built here.
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.resolve(__dirname, "..");
const NM = path.join(ROOT, "node_modules");
const OUT = path.join(ROOT, "src", "generated");
fs.mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log("[build]", ...a);

// ---------- Fonts ----------
const GFM = path.join(NM, "google-font-metadata", "data");
const api = JSON.parse(fs.readFileSync(path.join(GFM, "api-response.json"), "utf8"));
const v2 = JSON.parse(fs.readFileSync(path.join(GFM, "google-fonts-v2.json"), "utf8"));
const vars = JSON.parse(fs.readFileSync(path.join(GFM, "variable.json"), "utf8"));
const lic = JSON.parse(fs.readFileSync(path.join(GFM, "licenses.json"), "utf8"));
const tagRows = fs.readFileSync(path.join(ROOT, "vendor", "google-fonts-tags.csv"), "utf8").trim().split("\n").map((l) => l.split(","));
const tagMax = {};
for (const [fam, , tag, score] of tagRows) { const k = fam + "|" + tag; if (!(k in tagMax) || +score > tagMax[k]) tagMax[k] = +score; }
const tags = {};
for (const [k, v] of Object.entries(tagMax)) { const [fam, tag] = k.split("|"); (tags[fam] ||= []).push([tag, v]); }

const CLASS_MAP = {
  "/Sans/Geometric": "geometric", "/Sans/Humanist": "humanist", "/Sans/Grotesque": "grotesque", "/Sans/Neo Grotesque": "neo-grotesque",
  "/Sans/Rounded": "rounded", "/Sans/Superellipse": "superellipse", "/Sans/Glyphic": "glyphic",
  "/Serif/Transitional": "transitional", "/Serif/Old Style Garalde": "old-style", "/Serif/Humanist Venetian": "old-style", "/Serif/Modern": "modern",
  "/Serif/Didone": "didone", "/Serif/Scotch": "transitional", "/Serif/Fat Face": "fat-face",
  "/Slab/Humanist": "slab", "/Slab/Geometric": "slab", "/Slab/Clarendon": "slab",
  "/Script/Handwritten": "handwritten", "/Script/Informal": "informal-script", "/Script/Upright Script": "informal-script", "/Script/Formal": "formal-script",
  "/Monospace/Monospace": "mono",
  "/Theme/Pixel": "pixel", "/Theme/Blackletter": "blackletter", "/Theme/Techno": "techno", "/Theme/Stencil": "stencil", "/Theme/Art Deco": "art-deco",
  "/Theme/Brush": "brush", "/Theme/Woodtype": "woodtype", "/Theme/Blobby": "blobby", "/Theme/Distressed": "distressed", "/Theme/Wacky": "wacky",
};

const POPULAR = new Set(["Roboto", "Open Sans", "Inter", "Montserrat", "Lato", "Poppins", "Roboto Condensed", "Oswald", "Noto Sans", "Raleway", "Nunito", "Rubik", "Ubuntu", "Playfair Display", "Merriweather", "Roboto Mono", "Roboto Slab", "PT Sans", "Kanit", "Work Sans", "Lora", "Fira Sans", "DM Sans", "Mulish", "Quicksand", "Barlow", "Manrope", "IBM Plex Sans", "Titillium Web", "Heebo", "Karla", "Libre Baskerville", "Nunito Sans", "Josefin Sans", "Bebas Neue", "Source Sans 3", "Source Serif 4", "Noto Serif", "PT Serif", "Inconsolata", "EB Garamond", "Cormorant Garamond", "Archivo", "Space Grotesk", "Plus Jakarta Sans", "Outfit", "Figtree", "Lexend", "Sora", "Urbanist", "Red Hat Display", "Libre Franklin", "Cabin", "Crimson Text", "Dancing Script", "Pacifico", "Caveat", "Lobster", "Anton", "Abril Fatface", "Bitter", "Arvo", "Zilla Slab", "JetBrains Mono", "Fira Code", "Space Mono", "IBM Plex Mono", "IBM Plex Serif", "DM Serif Display", "Fraunces", "Instrument Serif", "Instrument Sans", "Geist", "Geist Mono", "Onest", "Bricolage Grotesque", "Schibsted Grotesk", "Hanken Grotesk", "Public Sans", "Albert Sans", "Be Vietnam Pro", "Chivo", "Syne", "Unbounded", "Archivo Black", "Righteous", "Comfortaa", "Varela Round", "M PLUS Rounded 1c", "Press Start 2P", "VT323", "Silkscreen", "Permanent Marker", "Shadows Into Light", "Satisfy", "Great Vibes", "Alegreya", "Spectral", "Newsreader", "Literata", "Young Serif", "Gloock", "Rethink Sans", "Familjen Grotesk", "Atkinson Hyperlegible", "Barlow Condensed", "Teko", "Exo 2", "Orbitron", "Rajdhani", "Asap", "Overpass", "Prompt", "Jost", "Epilogue", "Lexend Deca", "Red Hat Text", "Gelasio", "Domine", "Cardo", "Old Standard TT", "Bodoni Moda", "Prata", "Cinzel", "Marcellus", "Baloo 2", "Fredoka", "Nunito", "Signika", "Hind", "Mukta", "Sarabun", "Noto Sans JP", "Noto Sans KR", "Noto Sans SC"]);


const SCRIPT_GROUPS = { latin: "Latin", "latin-ext": "Latin Extended", cyrillic: "Cyrillic", greek: "Greek", vietnamese: "Vietnamese", arabic: "Arabic", hebrew: "Hebrew", devanagari: "Devanagari", thai: "Thai", japanese: "Japanese", korean: "Korean", "chinese-simplified": "Chinese (Simplified)", "chinese-traditional": "Chinese (Traditional)", bengali: "Bengali", tamil: "Tamil" };


const widthOf = (name, axis) => (axis ? "variable" : /condensed|narrow|compressed|compact|cond\b/i.test(name) ? "condensed" : /expanded|extended|wide\b/i.test(name) ? "expanded" : "normal");
function classify(family) {
  const t = tags[family] || [];
  let sub = null, subScore = -1;
  for (const [tag, sc] of t) if (CLASS_MAP[tag] && sc > subScore) { sub = CLASS_MAP[tag]; subScore = sc; }
  const quality = t.filter(([tag]) => tag.startsWith("/Quality/")).map(([, s]) => s);
  const q = quality.length ? Math.round(quality.reduce((a, b) => a + b, 0) / quality.length) : 0;
  const moods = t.filter(([tag]) => tag.startsWith("/Expressive/")).sort((a, b) => b[1] - a[1]).slice(0, 4).filter(([, s]) => s >= 40).map(([tag, s]) => [tag.split("/")[2], s]);
  return { sub, q, moods };
}
const CAT = { "sans-serif": "sans", serif: "serif", display: "display", handwriting: "handwriting", monospace: "mono", other: "display" };

const fonts = [];
for (const f of api) {
  const m2 = v2[f.family.toLowerCase().replace(/ /g, "-")] || Object.values(v2).find((x) => x.family === f.family);
  if (!m2) continue;
  if (/Material (Icons|Symbols)|Noto Color Emoji|Noto Emoji/.test(f.family)) continue; // icon fonts are not text fonts
  const v = vars[m2.id];
  const wght = v?.axes?.wght ? [+v.axes.wght.min, +v.axes.wght.max] : null;
  const { sub, q, moods } = classify(f.family);
  const lt = lic[m2.id]?.license?.type || "";
  fonts.push({ l: /Apache/.test(lt) ? "Apache 2.0" : /Ubuntu/.test(lt) ? "Ubuntu Font License" : "SIL Open Font License",
    f: f.family, c: CAT[f.category] || f.category, s: sub, w: m2.weights.slice().sort((a, b) => a - b), i: m2.styles.includes("italic") ? 1 : 0, v: wght,
    sub: m2.subsets.filter((s) => SCRIPT_GROUPS[s]), q, m: moods, p: POPULAR.has(f.family) ? 1 : 0, wd: widthOf(f.family, !!v?.axes?.wdth) });
}
const googleCount = fonts.length;

// Fontsource families that are not in the Google catalog, served from jsDelivr
  const HAND = {
    "42dot-sans": "neo-grotesque", "adwaita-mono": "mono", "adwaita-sans": "neo-grotesque", aileron: "neo-grotesque", "apfel-grotezk": "grotesque", "argentum-sans": "geometric",
    bagnard: "modern", "bagnard-sans": "humanist", "bbh-sans-bartle": "geometric", "bbh-sans-bogle": "geometric", "bbh-sans-hegarty": "geometric",
    "big-shoulders-display": "grotesque", "big-shoulders-text": "grotesque", "big-shoulders-inline-display": "art-deco", "big-shoulders-inline-text": "art-deco",
    "big-shoulders-stencil-display": "stencil", "big-shoulders-stencil-text": "stencil", "blackout-midnight": "grotesque", "blackout-sunrise": "grotesque", "blackout-two-am": "grotesque",
    "bluu-next": "didone", "briem-hand": "handwritten", "chunk-five": "slab", "clear-sans": "humanist", "coda-caption": "rounded", "comic-mono": "mono", "commit-mono": "mono",
    "cooper-hewitt": "grotesque", "dejavu-mono": "mono", "dejavu-sans": "humanist", "dejavu-serif": "transitional", firago: "humanist", "fredoka-one": "rounded",
    "fusion-pixel-12px-monospaced-sc": "pixel", "fusion-pixel-12px-proportional-sc": "pixel", "geist-sans": "neo-grotesque", "gentium-book-basic": "old-style", "hauora-sans": "humanist",
    "ia-writer-duo": "mono", "ia-writer-mono": "mono", "ia-writer-quattro": "humanist", iosevka: "mono", "iosevka-aile": "humanist", "iosevka-curly": "mono", "iosevka-curly-slab": "mono",
    junction: "humanist", karmilla: "humanist", "league-mono": "mono", lextrall: "geometric", "maple-mono": "mono", "merienda-one": "informal-script", metropolis: "geometric",
    "monaspace-argon": "mono", "monaspace-krypton": "mono", "monaspace-neon": "mono", "monaspace-radon": "mono", "monaspace-xenon": "mono", mononoki: "mono",
    "montserrat-subrayada": "geometric", "nebula-sans": "humanist", norwester: "grotesque", "noto-mono": "mono", "open-runde": "rounded", "open-sauce-one": "neo-grotesque",
    "open-sauce-sans": "neo-grotesque", "open-sauce-two": "neo-grotesque", opendyslexic: "humanist", "ostrich-sans": "grotesque", "peace-sans": "geometric",
    "pitagon-sans": "geometric", "pitagon-sans-text": "geometric", "pitagon-sans-mono": "mono", "pitagon-serif": "transitional", pretendard: "neo-grotesque",
    pushster: "informal-script", redaction: "transitional", "redaction-10": "transitional", "redaction-20": "transitional", "redaction-35": "transitional", "redaction-50": "transitional",
    "redaction-70": "transitional", "redaction-100": "transitional", "rubik-one": "rounded", "source-sans-pro": "humanist", "source-serif-pro": "transitional", "uncut-sans": "neo-grotesque", win95fa: "pixel",
  };

  const POP = new Set(["geist-sans", "metropolis", "source-sans-pro", "source-serif-pro", "pretendard", "open-runde", "commit-mono", "maple-mono", "monaspace-neon", "ia-writer-quattro", "big-shoulders-display"]);

  const LIC = { "OFL-1.1": "SIL Open Font License", "Apache-2.0": "Apache 2.0", "CC0-1.0": "CC0 public domain", mit: "MIT", Unlicense: "Unlicense public domain" };

const gNames = new Set(fonts.map((x) => x.f.toLowerCase()));
const fsFamilies = JSON.parse(fs.readFileSync(path.join(ROOT, "vendor", "fontsource", "families.json"), "utf8"));
for (const r of fsFamilies) {
  if (gNames.has(r.family.toLowerCase())) continue;
  let cat = CAT[r.category] || "display";
  if (/^monaspace|^iosevka/.test(r.id) && r.id !== "iosevka-aile" && r.id !== "iosevka-etoile") cat = "mono";
  if (r.id === "bluu-next") cat = "serif";
  const c = classify(r.family);
  const sub = c.sub || HAND[r.id] || (/^dseg/.test(r.id) ? "techno" : /^fusion-pixel/.test(r.id) ? "pixel" : null);
  fonts.push({ l: LIC[r.license] || r.license, f: r.family, c: cat, s: sub, w: r.weights.slice().sort((a, b) => a - b), i: r.styles.includes("italic") ? 1 : 0, v: null,
    sub: r.subsets.filter((s) => SCRIPT_GROUPS[s]), q: c.q, m: c.moods, p: POP.has(r.id) ? 1 : 0, wd: widthOf(r.family, false),
    src: "fs", id: r.id, fsub: "latin", ver: r.version, attr: r.attribution || "" });
}
log("fonts", fonts.length, `(${googleCount} Google, ${fonts.length - googleCount} Fontsource)`);

// ---------- write ----------
const json = JSON.stringify({ FONTS: fonts, SCRIPT_GROUPS });
fs.writeFileSync(path.join(OUT, "fonts.json"), json);
log(`src/generated/fonts.json ${(json.length / 1024).toFixed(0)} KB`);
