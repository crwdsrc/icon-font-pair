// Filters for icon styles and fonts. Each filter group is one predicate, so we can count
// "everything except this group" and show, on every option, how many results adding it would give.
import { FONTS, SCRIPT_GROUPS } from "./fonts.js";
import { licGroup } from "./iconify.js";
import { FILL_NAME } from "./util.js";

// ---------- icon options ----------
export const FILLS = ["outline", "filled", "duotone", "multicolor"];
export const WEIGHT_GROUP = { thin: [1], light: [2], medium: [3], bold: [4, 5] };
export const IWEIGHTS = [["thin", "Thin"], ["light", "Light"], ["medium", "Medium"], ["bold", "Bold"]];
// stroke weight only describes icons drawn with lines; filled and color icons pass any stroke-weight filter
const stroked = (s) => s.fill === "outline" || s.fill === "duotone";
export const IVIS = [["rounded", "Rounded"], ["sharp", "Sharp"], ["monoline", "Monoline"], ["minimal", "Minimal"], ["detailed", "Detailed"]];
export const IGRID = [["small", "15–16 px"], ["20", "20 px"], ["24", "24 px"], ["32", "32 px and up"]];
const gridKey = (g) => (g <= 17 ? "small" : g <= 22 ? "20" : g < 30 ? "24" : "32");
export const ILIC = [["perm", "Permissive"], ["pd", "Public domain"], ["by", "Credit required"], ["sa", "Share-alike"], ["nc", "Non-commercial"]];
export const ICAT = [["UI 24px", "UI 24 px"], ["Material", "Material"], ["UI 16px / 32px", "UI 16 and 32 px"], ["UI Other / Mixed Grid", "UI mixed grid"], ["UI Multicolor", "UI color"],
  ["Emoji", "Emoji"], ["Thematic", "Thematic"], ["High Detail", "High detail"], ["Programming", "Programming"], ["Logos", "Logos"], ["Archive / Unmaintained", "Unmaintained"], ["other", "Other"]];
const catKey = (c) => (/^High Detail/.test(c) ? "High Detail" : ICAT.some(([k]) => k === c) ? c : "other");
export const ISIZE = [[0, "Any size"], [500, "500+ icons"], [1000, "1,000+ icons"], [2500, "2,500+ icons"]];

// ---------- font options ----------
const hasMood = (f, m, min = 50) => f.m.some(([n, v]) => n === m && v >= min);
const DECOR = ["blobby", "wacky", "distressed", "brush", "blackletter", "woodtype", "art-deco", "stencil", "fat-face", "informal-script", "formal-script", "handwritten", "pixel"];
const CLEAN_SANS = ["geometric", "neo-grotesque", "grotesque", "humanist", "superellipse", "rounded", "glyphic"];
const FVIS_TEST = {
  modern: (f) => ["geometric", "neo-grotesque", "superellipse", "grotesque", "techno"].includes(f.s) || hasMood(f, "Futuristic") || hasMood(f, "Innovative"),
  // clean, quiet letterforms in any category except handwriting
  minimal: (f) => f.c !== "handwriting" && !DECOR.includes(f.s) && (f.c !== "display" || CLEAN_SANS.includes(f.s)) && (f.c !== "serif" || ["transitional", "modern", "didone", "slab", "old-style", null].includes(f.s)) && !["Loud", "Playful", "Childlike", "Awkward", "Fancy", "Excited", "Rugged", "Vintage"].some((m) => hasMood(f, m)),
  friendly: (f) => ["rounded", "humanist", "blobby", "informal-script", "handwritten"].includes(f.s) || ["Happy", "Cute", "Playful", "Sincere"].some((m) => hasMood(f, m, 60)),
  expressive: (f) => f.c === "display" || f.c === "handwriting" || ["Loud", "Artistic", "Excited", "Fancy"].some((m) => hasMood(f, m, 55)),
  geometric: (f) => f.s === "geometric",
  technical: (f) => f.c === "mono" || ["techno", "superellipse", "mono", "pixel"].includes(f.s) || ["Futuristic", "Competent"].some((m) => hasMood(f, m, 70)),
  humanist: (f) => f.s === "humanist" || f.s === "old-style",
  classic: (f) => (f.c === "serif" && ["transitional", "old-style", "didone", "modern", "slab"].includes(f.s)) || ["Vintage", "Sophisticated"].some((m) => hasMood(f, m, 60)),
};
export const FVIS = [["modern", "Modern"], ["minimal", "Minimal"], ["friendly", "Friendly"], ["expressive", "Expressive"], ["geometric", "Geometric"], ["technical", "Technical"], ["humanist", "Humanist"], ["classic", "Classic"]];
export const FSUB = [["geometric", "Geometric"], ["humanist", "Humanist"], ["grotesque", "Grotesque"], ["neo-grotesque", "Neo-grotesque"], ["rounded", "Rounded"], ["superellipse", "Superellipse"], ["glyphic", "Glyphic"], ["slab", "Slab"], ["transitional", "Transitional"], ["old-style", "Old style"], ["didone", "Didone and modern"], ["handwritten", "Handwritten"], ["script", "Script"], ["mono", "Monospace"], ["pixel", "Pixel"], ["techno", "Techno"], ["blackletter", "Blackletter"], ["deco", "Stencil and deco"], ["wacky", "Wacky and blobby"], ["none", "Unclassified"]];
const SUB_GROUP = { didone: ["didone", "modern", "fat-face"], script: ["informal-script", "formal-script", "brush"], deco: ["stencil", "art-deco", "woodtype"], wacky: ["wacky", "blobby", "distressed"] };
const subTest = (k, f) => (k === "none" ? !f.s : (SUB_GROUP[k] || [k]).includes(f.s));
export const FLIC = [["SIL Open Font License", "SIL OFL"], ["Apache 2.0", "Apache 2.0"], ["Ubuntu Font License", "Ubuntu"], ["pd", "Public domain or MIT"]];
const licKey = (f) => (/public domain|^MIT$/i.test(f.l) ? "pd" : f.l);
export const FCAT = [["sans", "Sans-serif"], ["serif", "Serif"], ["display", "Display"], ["handwriting", "Handwriting"], ["mono", "Monospace"]];
export const FWEIGHT = [["", "Any weight"], ["100", "Thin 100"], ["200", "ExtraLight 200"], ["300", "Light 300"], ["400", "Regular 400"], ["500", "Medium 500"], ["600", "SemiBold 600"], ["700", "Bold 700"], ["800", "ExtraBold 800"], ["900", "Black 900"]];
export const FWIDTH = [["", "All widths"], ["normal", "Normal width"], ["condensed", "Condensed"], ["expanded", "Expanded"], ["variable", "Variable width"]];
export const FSTYLE = [["", "All styles"], ["italic", "Has italics"], ["variable", "Variable font"], ["static", "Static font"], ["popular", "Popular picks"]];
export const FMOOD = [["", "All moods"], ...["Business", "Calm", "Competent", "Playful", "Happy", "Cute", "Futuristic", "Sophisticated", "Vintage", "Loud", "Artistic", "Rugged"].map((m) => [m, m])];
export const FSCRIPT = [["", "Any script"], ...Object.entries(SCRIPT_GROUPS).filter(([k]) => k !== "latin")];
export const FSRC = [["all", "All sources", "Google Fonts and Fontsource"], ["google", "Google Fonts", "Free, open source fonts"], ["fs", "Fontsource", "Self-hosted, open source fonts"]];
export const hasWeight = (f, n) => (f.v ? n >= f.v[0] && n <= f.v[1] : f.w.includes(n));
// a picked weight keeps only fonts that have it; spins then use that weight
const weightOk = (v, f) => !v || hasWeight(f, +v);
const styleOptOk = (v, f) => (!v ? true : v === "italic" ? !!f.i : v === "variable" ? !!f.v : v === "static" ? !f.v : v === "popular" ? !!f.p : true);

// ---------- state ----------
export const IF = { fill: new Set(), weight: new Set(), vis: new Set(), grid: new Set(), lic: new Set(), cat: new Set(), libsOff: new Set(), size: 0 };
export const FF = { src: "all", cat: new Set(), weight: "", width: "", style: "", mood: "", vis: new Set(), sub: new Set(), lic: new Set(), script: "", q: 0, search: "", excluded: new Set() };

export const ICON_GROUPS = {
  fill: (s) => !IF.fill.size || IF.fill.has(s.fill),
  weight: (s) => !IF.weight.size || !stroked(s) || [...IF.weight].some((k) => WEIGHT_GROUP[k].includes(s.weight)),
  vis: (s) => !IF.vis.size || [...IF.vis].some((k) => s.traits.has(k)),
  grid: (s) => !IF.grid.size || IF.grid.has(gridKey(s.grid)),
  lic: (s) => !IF.lic.size || IF.lic.has(licGroup(s.lib.license)),
  cat: (s) => !IF.cat.size || IF.cat.has(catKey(s.lib.category)),
  libs: (s) => !IF.libsOff.has(s.prefix),
  size: (s) => !IF.size || s.count >= IF.size,
};
export const FONT_GROUPS = {
  excluded: (f) => !FF.excluded.has(f.f),
  src: (f) => FF.src === "all" || FF.src === (f.src === "fs" ? "fs" : "google"),
  cat: (f) => !FF.cat.size || FF.cat.has(f.c),
  weight: (f) => weightOk(FF.weight, f),
  width: (f) => !FF.width || (f.wd || "normal") === FF.width,
  style: (f) => styleOptOk(FF.style, f),
  mood: (f) => !FF.mood || f.m.some(([n]) => n === FF.mood),
  vis: (f) => !FF.vis.size || [...FF.vis].some((k) => FVIS_TEST[k](f)),
  sub: (f) => !FF.sub.size || [...FF.sub].some((k) => subTest(k, f)),
  lic: (f) => !FF.lic.size || FF.lic.has(licKey(f)),
  script: (f) => !FF.script || f.sub.includes(FF.script),
  q: (f) => !FF.q || f.q >= FF.q,
  search: (f) => !FF.search || f.f.toLowerCase().includes(FF.search),
};
// pass = items passing every group, base[g] = items passing every group except g
export function facetBase(items, groups) {
  const keys = Object.keys(groups), base = Object.fromEntries(keys.map((k) => [k, []])), pass = [];
  for (const x of items) {
    let n = 0, failK = null;
    for (const k of keys) { if (!groups[k](x)) { n++; failK = k; if (n > 1) break; } }
    if (n === 0) { pass.push(x); for (const k of keys) base[k].push(x); }
    else if (n === 1) base[failK].push(x);
  }
  return { pass, base };
}
const countAll = (items, groups) => items.filter((x) => Object.values(groups).every((g) => g(x))).length;
// temporarily change state, count, restore
function tryCount(apply, items, groups, baseList, groupKey) {
  const undo = apply();
  const n = baseList ? baseList.filter(groups[groupKey]).length : countAll(items, groups);
  undo();
  return n;
}
const addTo = (set, v) => () => { const had = set.has(v); set.add(v); return () => { if (!had) set.delete(v); }; };
const setVal = (obj, k, v) => () => { const old = obj[k]; obj[k] = v; return () => { obj[k] = old; }; };
const chain = (...fns) => () => { const undos = fns.map((f) => f()); return () => undos.reverse().forEach((u) => u()); };

// ---------- contradictions that resolve themselves: picking one side turns the other off ----------
const NONOUTLINE = ["filled", "duotone", "multicolor"];
const dropMonoline = () => { const had = IF.vis.has("monoline"); IF.vis.delete("monoline"); return () => { if (had) IF.vis.add("monoline"); }; };
const keepOutlineOnly = () => { const old = [...IF.fill]; old.forEach((x) => NONOUTLINE.includes(x) && IF.fill.delete(x)); return () => { IF.fill.clear(); old.forEach((x) => IF.fill.add(x)); }; };
// each returns a note for the toast when it changed something
export function resolveIconFill() {
  if ([...IF.fill].some((x) => NONOUTLINE.includes(x)) && IF.vis.has("monoline")) { IF.vis.delete("monoline"); return "Turned off Monoline. Filled, duotone and color icons aren't drawn with a single line."; }
}
export function resolveMonoline() {
  const drop = [...IF.fill].filter((x) => NONOUTLINE.includes(x));
  if (IF.vis.has("monoline") && drop.length) { drop.forEach((x) => IF.fill.delete(x)); return `Turned off ${drop.map((x) => FILL_NAME[x]).join(", ")}. Monoline icons are outline only.`; }
}

// ---------- counts on every option ----------
// returns, per control, [{ v, label, n, sel }] where n is the result count if this option were added or chosen
export function computeFacets(STYLES, IB, FB) {
  const opt = (v, label, n, sel) => ({ v, label, n, sel, zero: n === 0 && !sel });
  const ic = (apply, g) => tryCount(apply, STYLES, ICON_GROUPS, IB.base[g], g);
  const fc = (apply, g) => tryCount(apply, FONTS, FONT_GROUPS, FB.base[g], g);
  return {
    fill: FILLS.map((v) => opt(v, FILL_NAME[v],
      NONOUTLINE.includes(v) && IF.vis.has("monoline") ? tryCount(chain(addTo(IF.fill, v), dropMonoline), STYLES, ICON_GROUPS) : ic(addTo(IF.fill, v), "fill"), IF.fill.has(v))),
    iweight: IWEIGHTS.map(([v, l]) => opt(v, l, ic(addTo(IF.weight, v), "weight"), IF.weight.has(v))),
    ivis: IVIS.map(([v, l]) => opt(v, l,
      v === "monoline" && [...IF.fill].some((x) => NONOUTLINE.includes(x)) ? tryCount(chain(addTo(IF.vis, v), keepOutlineOnly), STYLES, ICON_GROUPS) : ic(addTo(IF.vis, v), "vis"), IF.vis.has(v))),
    igrid: IGRID.map(([v, l]) => opt(v, l, ic(addTo(IF.grid, v), "grid"), IF.grid.has(v))),
    ilic: ILIC.map(([v, l]) => opt(v, l, ic(addTo(IF.lic, v), "lic"), IF.lic.has(v))),
    icat: ICAT.map(([v, l]) => opt(v, l, ic(addTo(IF.cat, v), "cat"), IF.cat.has(v))),
    isize: ISIZE.map(([v, l]) => opt(v, l, ic(setVal(IF, "size", v), "size"), IF.size === v)),
    fsrc: FSRC.map(([v, l, d]) => ({ ...opt(v, l, fc(setVal(FF, "src", v), "src"), FF.src === v), desc: d })),
    fcat: FCAT.map(([v, l]) => opt(v, l, fc(addTo(FF.cat, v), "cat"), FF.cat.has(v))),
    fweight: FWEIGHT.map(([v, l]) => opt(v, l, fc(setVal(FF, "weight", v), "weight"), FF.weight === v)),
    fwidth: FWIDTH.map(([v, l]) => opt(v, l, fc(setVal(FF, "width", v), "width"), FF.width === v)),
    fstyle: FSTYLE.map(([v, l]) => opt(v, l, fc(setVal(FF, "style", v), "style"), FF.style === v)),
    fmood: FMOOD.map(([v, l]) => opt(v, l, fc(setVal(FF, "mood", v), "mood"), FF.mood === v)),
    fscript: FSCRIPT.map(([v, l]) => opt(v, l, fc(setVal(FF, "script", v), "script"), FF.script === v)),
    fvis: FVIS.map(([v, l]) => opt(v, l, fc(addTo(FF.vis, v), "vis"), FF.vis.has(v))),
    fsub: FSUB.map(([v, l]) => opt(v, l, fc(addTo(FF.sub, v), "sub"), FF.sub.has(v))),
    flic: FLIC.map(([v, l]) => opt(v, l, fc(addTo(FF.lic, v), "lic"), FF.lic.has(v))),
  };
}

// ---------- a way out when nothing is left ----------
const pick = (list, keys) => [...keys].map((x) => list.find(([k]) => k === x)?.[1] ?? x).join(", ");
const ICON_GROUP_LABEL = {
  fill: () => `Icon style: ${[...IF.fill].map((x) => FILL_NAME[x]).join(", ")}`,
  weight: () => `Stroke weight: ${pick(IWEIGHTS, IF.weight)}`,
  vis: () => `Icon traits: ${pick(IVIS, IF.vis)}`,
  grid: () => `Design grid: ${pick(IGRID, IF.grid)}`,
  lic: () => `Icon license: ${pick(ILIC, IF.lic)}`,
  cat: () => `Icon set category: ${pick(ICAT, IF.cat)}`,
  libs: () => `${IF.libsOff.size} icon sets turned off`,
  size: () => `Set size: ${IF.size}+ icons`,
};
const FONT_GROUP_LABEL = {
  excluded: () => `${FF.excluded.size} excluded families`,
  src: () => `Source: ${FF.src === "fs" ? "Fontsource" : "Google Fonts"}`,
  cat: () => `Category: ${pick(FCAT, FF.cat)}`,
  weight: () => `Weight: ${pick(FWEIGHT, [FF.weight])}`,
  width: () => pick(FWIDTH, [FF.width]),
  style: () => pick(FSTYLE, [FF.style]),
  mood: () => `Mood: ${FF.mood}`,
  vis: () => `Font style: ${pick(FVIS, FF.vis)}`,
  sub: () => `Classification: ${pick(FSUB, FF.sub)}`,
  lic: () => `Font license: ${pick(FLIC, FF.lic)}`,
  script: () => `Script: ${SCRIPT_GROUPS[FF.script]}`,
  q: () => `Minimum quality ${FF.q}`,
  search: () => `Name contains “${FF.search}”`,
};
export const ICON_CLEAR = {
  all: () => { for (const k of ["fill", "weight", "vis", "grid", "lic", "cat"]) IF[k].clear(); IF.size = 0; },
  fill: () => IF.fill.clear(), weight: () => IF.weight.clear(), vis: () => IF.vis.clear(), grid: () => IF.grid.clear(),
  lic: () => IF.lic.clear(), cat: () => IF.cat.clear(), libs: () => IF.libsOff.clear(), size: () => (IF.size = 0),
};
export const FONT_CLEAR = {
  all: () => { for (const k of ["cat", "vis", "sub", "lic"]) FF[k].clear(); Object.assign(FF, { src: "all", weight: "", width: "", style: "", mood: "", script: "", q: 0, search: "" }); },
  excluded: () => FF.excluded.clear(), src: () => (FF.src = "all"), cat: () => FF.cat.clear(), weight: () => (FF.weight = ""), width: () => (FF.width = ""),
  style: () => (FF.style = ""), mood: () => (FF.mood = ""), vis: () => FF.vis.clear(), sub: () => FF.sub.clear(), lic: () => FF.lic.clear(),
  script: () => (FF.script = ""), q: () => (FF.q = 0), search: () => (FF.search = ""),
};
const isDefaultIcon = (g) => (g === "size" ? !IF.size : !IF[g === "libs" ? "libsOff" : g].size);
const isDefaultFont = (g) => (["cat", "vis", "sub", "lic", "excluded"].includes(g) ? !FF[g].size : g === "src" ? FF.src === "all" : !FF[g]);
// up to three filters to remove, the ones that bring back the most results first
export function wayOut(kind, B) {
  const labels = kind === "icon" ? ICON_GROUP_LABEL : FONT_GROUP_LABEL;
  return Object.keys(labels).map((g) => ({ g, n: B.base[g].length })).filter(({ g, n }) => n > 0 && !(kind === "icon" ? isDefaultIcon(g) : isDefaultFont(g)))
    .sort((a, b) => b.n - a.n).slice(0, 3).map((x) => ({ ...x, label: labels[x.g]() }));
}
export function resetFilters() {
  for (const s of [IF.fill, IF.weight, IF.vis, IF.grid, IF.lic, IF.cat, IF.libsOff, FF.cat, FF.vis, FF.sub, FF.lic]) s.clear();
  IF.size = 0; Object.assign(FF, { src: "all", weight: "", width: "", style: "", mood: "", script: "", q: 0, search: "" });
}
