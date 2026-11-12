// Icons from the Iconify API.
// One word search returns matching icon names across every public Iconify set. From each set we keep the word itself
// and its style variants (download, download-outline, outline-download, download-24-filled), fetch those shapes,
// and read fill, weight, corners and detail from the SVG. Each kept icon is one style in the spin.
import { normQ, candidates } from "./synonyms.js";
import { FILL_NAME, WEIGHT_WORD } from "./util.js";
export const ICON_API = ["https://api.iconify.design", "https://api.simplesvg.com", "https://api.unisvg.com"];
async function apiGet(path) {
  for (const host of ICON_API) {
    try { const r = await fetch(host + path); if (r.ok) return await r.json(); } catch {}
  }
  return null;
}
export const SETS = new Map(); // prefix -> icon set info
export function setFromInfo(prefix, x = {}) {
  const lic = x.license || {}, spdx = lic.spdx || lic.title || "Unknown";
  return { id: prefix, name: x.name || prefix, total: x.total || 0, license: spdx, licTitle: lic.title || spdx, licUrl: lic.url || "",
    author: x.author?.name || "", grid: x.height, category: x.category || "", palette: !!x.palette, url: `https://icon-sets.iconify.design/${prefix}/` };
}
const addSets = (cols) => { for (const [k, v] of Object.entries(cols || {})) if (!SETS.has(k)) SETS.set(k, setFromInfo(k, v)); };
// every Iconify set is free to use; the licenses differ in what they ask of you
export const licGroup = (spdx) => (/^CC0|Unlicense/i.test(spdx) ? "pd" : /-NC/.test(spdx) ? "nc" : /-SA|GPL|MPL/.test(spdx) ? "sa" : /^CC-BY/.test(spdx) ? "by" : "perm");

// shapes, cached for the session
export const ICONS = new Map();    // "prefix:name" -> { body, vb } or null when the set has no such icon
const iconWait = new Map(); // "prefix:name" -> pending promise
export const hasIcon = (prefix, name) => !!ICONS.get(`${prefix}:${name}`);
function shapeOf(data, name) {
  // an alias can point at another icon with a flip or a quarter turn
  let ic = data.icons?.[name], cur = name, al, guard = 0;
  const tf = { h: false, v: false, r: 0 };
  while (!ic && (al = data.aliases?.[cur]) && guard++ < 5) {
    if (al.hFlip) tf.h = !tf.h;
    if (al.vFlip) tf.v = !tf.v;
    tf.r += al.rotate || 0; cur = al.parent; ic = data.icons?.[cur];
  }
  if (!ic) return null;
  if (ic.hFlip) tf.h = !tf.h;
  if (ic.vFlip) tf.v = !tf.v;
  tf.r += ic.rotate || 0;
  const l = ic.left ?? data.left ?? 0, t = ic.top ?? data.top ?? 0, w = ic.width || data.width || 16, h = ic.height || data.height || 16;
  const tr = [];
  if (tf.r % 4) tr.push(`rotate(${(tf.r % 4) * 90} ${l + w / 2} ${t + h / 2})`);
  if (tf.h) tr.push(`translate(${2 * l + w} 0) scale(-1 1)`);
  if (tf.v) tr.push(`translate(0 ${2 * t + h}) scale(1 -1)`);
  // shapes come from the network and go into the page as markup, so drop anything that could run script
  const body = String(ic.body).replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "").replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "").replace(/(href\s*=\s*["'])\s*javascript:[^"']*/gi, "$1#");
  return { body: tr.length ? `<g transform="${tr.join(" ")}">${body}</g>` : body, vb: [l, t, w, h] };
}
export function loadIconItems(items) { // items: [{ prefix, name }]
  const waits = [], groups = new Map();
  for (const { prefix, name } of items) {
    if (!prefix || !name) continue;
    const k = `${prefix}:${name}`;
    if (ICONS.has(k)) continue;
    if (iconWait.has(k)) { waits.push(iconWait.get(k)); continue; }
    const list = groups.get(prefix) || [];
    if (!list.includes(name)) list.push(name);
    groups.set(prefix, list);
  }
  for (const [prefix, names] of groups) {
    for (let i = 0; i < names.length; i += 40) {
      const chunk = names.slice(i, i + 40);
      const p = apiGet(`/${prefix}.json?icons=${chunk.map(encodeURIComponent).join(",")}`).then((data) => {
        for (const n of chunk) {
          iconWait.delete(`${prefix}:${n}`);
          if (data) ICONS.set(`${prefix}:${n}`, shapeOf(data, n)); // no data means network trouble: leave uncached so a later call retries
        }
      });
      chunk.forEach((n) => iconWait.set(`${prefix}:${n}`, p));
      waits.push(p);
    }
  }
  return Promise.all(waits);
}
let uid = 0;
export function iconSVG(prefix, name) {
  const ic = ICONS.get(`${prefix}:${name}`); if (!ic) return null;
  let body = ic.body;
  if (body.includes('id="')) { const u = "_" + (++uid).toString(36); body = body.replace(/id="([^"]+)"/g, `id="$1${u}"`).replace(/url\(#([^)]+)\)/g, `url(#$1${u})`).replace(/href="#([^"]+)"/g, `href="#$1${u}"`); }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ic.vb.join(" ")}" aria-hidden="true">${body}</svg>`;
}

// ---------- reading names ----------
// name tokens that change how an icon is drawn but not what it shows
const SIZE_TOK = new Set(["12", "16", "20", "24", "28", "32", "48", "xs", "sm", "md", "lg", "xl", "small", "mini", "micro"]);
const STYLE_TOK = new Set([...SIZE_TOK, ..."outline outlined line lines linear lined o stroke stroked fill filled solid glyph baseline bold light thin regular medium heavy black duotone twotone two tone duo bulk broken rounded round sharp color colored flat".split(" ")]);
// tokens that turn the meaning around, such as download-off
const NEG_TOK = new Set("off slash slashed disabled disable cancel crossed x minus remove error".split(" "));
const styleTok = (n) => n.split("-").filter((t) => STYLE_TOK.has(t));
// where the word sits in a name, so other words can be drawn in the same style: outline-{n}, {n}-24-filled
function tplOf(name) {
  const out = []; let put = false;
  for (const t of name.split("-")) { if (STYLE_TOK.has(t)) out.push(t); else if (!put) { out.push("{n}"); put = true; } }
  return put ? out.join("-") : "{n}";
}
// 0: the word, 1: the word plus style tokens, 2: a longer name that contains the word
function rankName(name, q) {
  if (name === q) return 0;
  const parts = name.split("-"), n = q.split("-").length;
  for (let i = 0; i + n <= parts.length; i++) {
    if (parts.slice(i, i + n).join("-") !== q) continue;
    const rest = [...parts.slice(0, i), ...parts.slice(i + n)];
    if (rest.every((t) => STYLE_TOK.has(t))) return 1;
    if (rest.some((t) => NEG_TOK.has(t))) return null;
    return 2;
  }
  return null;
}
const sizeRank = (tok) => { const s = tok.find((t) => SIZE_TOK.has(t)); return !s ? 0 : s === "24" ? 1 : s === "20" ? 2 : 3; };
const coreOf = (n) => n.split("-").filter((t) => !STYLE_TOK.has(t)).join("-");
// one icon per look, at most six per set; sizes of the same look count once, 24 px first
function variants(list) {
  const seen = new Map();
  const sorted = list.map((x) => ({ ...x, tok: styleTok(x.n) }))
    .sort((a, b) => a.r - b.r || sizeRank(a.tok) - sizeRank(b.tok) || a.tok.length - b.tok.length || (a.n < b.n ? -1 : 1));
  for (const x of sorted) { const key = x.tok.filter((t) => !SIZE_TOK.has(t)).sort().join("-"); if (!seen.has(key)) seen.set(key, x); }
  return [...seen.values()].slice(0, 6);
}
// which icons to keep from one set: the word and its variants, else the closest longer name and its variants
function pickNames(names, qs) {
  const ranked = [];
  for (const n of names) {
    let r = null;
    for (const q of qs) { const v = rankName(n, q); if (v != null && (r == null || v < r)) r = v; }
    if (r != null) ranked.push({ n, r });
  }
  const own = ranked.filter((x) => x.r <= 1);
  if (own.length) return variants(own);
  const part = ranked.filter((x) => x.r === 2);
  if (!part.length) return [];
  const best = part.map((x) => coreOf(x.n)).sort((a, b) => a.split("-").length - b.split("-").length || a.length - b.length || (a < b ? -1 : 1))[0];
  return variants(part.filter((x) => coreOf(x.n) === best));
}

// ---------- reading shapes ----------
// For icons drawn as filled paths, a 48 px raster tells filled from outline and gives a line weight.
// core: the widest solid spot (twice the largest distance from ink to empty space), in 24 px grid units. Outline
// drawings stay near their line width, solid shapes go well past it. thick: average line width, ink area over edge length.
const CORE_FILLED = 5.5, DETAIL = [10, 48];
const MN = 48, mCtx = Object.assign(document.createElement("canvas"), { width: MN, height: MN }).getContext("2d", { willReadFrequently: true });
function measure(ic) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        mCtx.clearRect(0, 0, MN, MN); mCtx.drawImage(img, 0, 0, MN, MN);
        const d = mCtx.getImageData(0, 0, MN, MN).data, ink = new Uint8Array(MN * MN), dt = new Float32Array(MN * MN);
        let area = 0, edge = 0, mx = 0;
        for (let i = 0; i < MN * MN; i++) if (d[i * 4 + 3] >= 128) { ink[i] = 1; area++; }
        const at = (x, y) => (x < 0 || y < 0 || x >= MN || y >= MN ? 0 : ink[y * MN + x]);
        // two-pass chamfer distance to the nearest empty pixel
        for (let y = 0; y < MN; y++) for (let x = 0; x < MN; x++) {
          const i = y * MN + x; if (!ink[i]) continue;
          if (!at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1)) edge++;
          dt[i] = Math.min(x ? dt[i - 1] + 1 : 1, y ? dt[i - MN] + 1 : 1, x && y ? dt[i - MN - 1] + 1.414 : 1, y && x < MN - 1 ? dt[i - MN + 1] + 1.414 : 1);
        }
        for (let y = MN - 1; y >= 0; y--) for (let x = MN - 1; x >= 0; x--) {
          const i = y * MN + x; if (!ink[i]) continue;
          dt[i] = Math.min(dt[i], x < MN - 1 ? dt[i + 1] + 1 : 1, y < MN - 1 ? dt[i + MN] + 1 : 1, x < MN - 1 && y < MN - 1 ? dt[i + MN + 1] + 1.414 : 1, x && y < MN - 1 ? dt[i + MN - 1] + 1.414 : 1);
          if (dt[i] > mx) mx = dt[i];
        }
        const k = 24 / MN;
        resolve({ core: 2 * mx * k, thick: edge ? (2 * area / edge) * k : 0 });
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${MN}" height="${MN}" viewBox="${ic.vb.join(" ")}">${ic.body}</svg>`);
  });
}
// line width in 24 px grid units to a weight from 1 (thin) to 5 (heavy); measured widths read a little wide
const lineLevel = (w, measured) => { const o = measured ? 0.1 : 0; return w < 1.25 + o ? 1 : w < 1.75 + o ? 2 : w < 2.25 + o ? 3 : w < 2.75 + o ? 4 : 5; };
const FILL_TOK = { outline: ["outline", "outlined", "line", "lines", "linear", "lined", "o", "stroke", "stroked", "broken", "regular"], filled: ["fill", "filled", "solid", "glyph", "baseline"], duotone: ["duotone", "twotone", "two", "duo", "bulk", "tone"] };
const W_TOK = { thin: 1, light: 2, bold: 4, heavy: 5, black: 5 };
async function makeStyle(set, n, ic, how) {
  const tok = styleTok(n), has = (k) => FILL_TOK[k].some((t) => tok.includes(t)), b = ic.body;
  const usesStroke = /stroke="(?!none)[^"]*"/.test(b);
  const strokeOnly = usesStroke && !/fill="(?!none)[^"]*"/.test(b);
  const translucent = /opacity="0?\.\d+"/.test(b);
  const m = set.palette || strokeOnly ? null : await measure(ic);
  let fill;
  if (set.palette) fill = "multicolor";
  else if (has("duotone") || (translucent && !has("filled") && !has("outline"))) fill = "duotone";
  else if (has("outline")) fill = "outline";
  else if (has("filled")) fill = "filled";
  else if (usesStroke) fill = "outline";
  else fill = m && m.core >= CORE_FILLED ? "filled" : "outline";
  const tokW = tok.map((t) => W_TOK[t]).find(Boolean);
  const sw = +(b.match(/stroke-width="([\d.]+)"/)?.[1] || (usesStroke ? 1 : 0));
  let weight;
  if (tokW) weight = tokW;
  else if (usesStroke) weight = lineLevel((sw * 24) / ic.vb[3], false);
  else if (fill === "filled") weight = 4;
  else if (fill === "multicolor") weight = 3;
  else weight = m ? lineLevel(m.thick, true) : 3;
  let corners = tok.includes("rounded") || tok.includes("round") ? "rounded" : tok.includes("sharp") ? "sharp" : null;
  if (!corners && usesStroke) corners = /stroke-line(?:cap|join)="round"/.test(b) ? "rounded" : "sharp";
  const cmds = [...b.matchAll(/\sd="([^"]*)"/g)].reduce((a, m) => a + (m[1].match(/[mlhvcsqtaz]/gi) || []).length, 0) + (b.match(/<(?:circle|rect|ellipse|line|polyline|polygon)\b/g) || []).length * 3;
  const traits = new Set();
  if (corners) traits.add(corners);
  if (fill === "outline" && strokeOnly) traits.add("monoline");
  if (cmds <= DETAIL[0]) traits.add("minimal"); else if (cmds >= DETAIL[1]) traits.add("detailed");
  const label = [FILL_NAME[fill], tokW ? WEIGHT_WORD[tokW].toLowerCase() : "", tok.includes("sharp") ? "sharp" : tok.includes("rounded") || tok.includes("round") ? "rounded" : ""].filter(Boolean).join(", ");
  return { id: `${set.id}:${n}`, prefix: set.id, name: n, lib: set, how, tpl: tplOf(n), fill, weight, corners, stroke: usesStroke ? sw : 0, traits, label, grid: Math.round(ic.vb[3]), count: set.total };
}

// ---------- word search ----------
export let STYLES = [];   // icons kept for the current word; each one is a style to spin
export let WORD = { raw: "", status: "empty", sets: 0, related: 0, loaded: 0 };
export let searchSeq = 0;
const CAT_ORDER = ["UI 24px", "Material", "UI 16px / 32px", "UI Other / Mixed Grid", "UI Multicolor", "Thematic", "Emoji", "High Detail", "High Detail Multicolor", "", "Programming", "Logos", "Flags", "Location", "Holiday / Seasonal", "Apps", "Archive / Unmaintained"];
const catRank = (c) => { const i = CAT_ORDER.indexOf(c); return i < 0 ? CAT_ORDER.indexOf("") : i; };
function bySet(icons) {
  const m = new Map();
  for (const id of icons || []) { const i = id.indexOf(":"), k = id.slice(0, i); if (!m.has(k)) m.set(k, []); m.get(k).push(id.slice(i + 1)); }
  return m;
}
// The public API returns at most 128 names per search and has no paging, so a common word like "download"
// would reach only part of the sets. Searching in batches of sets (the prefixes parameter) reaches all of them:
// a batch that hits the cap is split in two and searched again.
const searchPath = (q, prefixes) => `/search?query=${encodeURIComponent(q.replace(/-/g, " "))}&limit=999${prefixes ? `&prefixes=${prefixes.map(encodeURIComponent).join(",")}` : ""}`;
const COL_KEY = "pairing-iconify-collections", COL_TTL = 24 * 3600e3, BATCH = 20;
let colsWait = null;
// every public set, from /collections; kept in this browser for a day
function loadCollections() {
  return (colsWait ||= (async () => {
    try { const c = JSON.parse(localStorage.getItem(COL_KEY) || "null"); if (c && Date.now() - c.at < COL_TTL) { addSets(c.sets); return Object.keys(c.sets); } } catch {}
    const sets = await apiGet("/collections");
    if (!sets) { colsWait = null; return null; }
    addSets(sets);
    try { localStorage.setItem(COL_KEY, JSON.stringify({ at: Date.now(), sets })); } catch {}
    return Object.keys(sets);
  })());
}
async function searchBatch(q, prefixes) {
  const res = await apiGet(searchPath(q, prefixes));
  if (!res) return null;
  if (prefixes.length > 1 && res.icons?.length >= (res.limit || 128)) {
    const mid = Math.ceil(prefixes.length / 2);
    const [a, b] = await Promise.all([searchBatch(q, prefixes.slice(0, mid)), searchBatch(q, prefixes.slice(mid))]);
    return { icons: [...(a?.icons || []), ...(b?.icons || [])], collections: { ...a?.collections, ...b?.collections } };
  }
  return res;
}
async function searchAll(q) {
  const prefixes = await loadCollections();
  if (!prefixes) return apiGet(searchPath(q)); // no set list: one plain search
  const batches = [];
  for (let i = 0; i < prefixes.length; i += BATCH) batches.push(prefixes.slice(i, i + BATCH));
  const parts = await Promise.all(batches.map((b) => searchBatch(q, b)));
  if (parts.every((x) => !x)) return null;
  return { icons: parts.flatMap((x) => x?.icons || []), collections: Object.assign({}, ...parts.map((x) => x?.collections || {})) };
}
const singular = (q) => q.replace(/(ies)$/, "y").replace(/(?<!s)s$/, "");
// the page registers how to redraw: changed() right away, changedSoon() at most every 200 ms while shapes stream in
let onChange = () => {};
export const onWordChange = (fn) => (onChange = fn);
let rcT = 0;
const changed = () => { clearTimeout(rcT); rcT = 0; onChange(); };
const changedSoon = () => { if (!rcT) rcT = setTimeout(() => { rcT = 0; onChange(); }, 200); };
// returns { ready, done }: ready once the first sets have shapes, done when every set has loaded
export function searchWord(raw) {
  const seq = ++searchSeq, q = normQ(raw), list = (STYLES = []);
  WORD = { raw: raw.trim(), status: q ? "search" : "empty", sets: 0, related: 0, loaded: 0 };
  let readyFn; const ready = new Promise((r) => (readyFn = r));
  const live = () => seq === searchSeq;
  const done = (async () => {
    changed();
    if (!q) return;
    const own = [...new Set([q, singular(q)])];
    const res = await searchAll(q);
    if (!live()) return;
    if (!res) { WORD.status = "offline"; changed(); return; }
    addSets(res.collections);
    const plan = new Map(); // prefix -> { set, items, how }
    for (const [k, names] of bySet(res.icons)) {
      const items = pickNames(names, own);
      if (items.length) plan.set(k, { set: SETS.get(k) || setFromInfo(k), items, how: items[0].r <= 1 ? "exact" : "partial" });
    }
    // few matches: also look up related words, such as trophy for winner
    if (plan.size < 12) {
      const rel = candidates(raw).filter((c) => !own.includes(c)).slice(0, 4);
      const more = await Promise.all(rel.map((c) => searchAll(c)));
      if (!live()) return;
      more.forEach((r, i) => {
        if (!r) return;
        addSets(r.collections);
        for (const [k, names] of bySet(r.icons)) {
          if (plan.has(k)) continue;
          const items = pickNames(names, [rel[i]]).filter((x) => x.r <= 1);
          if (items.length) plan.set(k, { set: SETS.get(k) || setFromInfo(k), items, how: "related" });
        }
      });
    }
    const jobs = [...plan.values()].sort((a, b) => (a.how === "related") - (b.how === "related") || catRank(a.set.category) - catRank(b.set.category) || b.set.total - a.set.total);
    Object.assign(WORD, { status: jobs.length ? "loading" : "none", sets: jobs.length, related: jobs.filter((j) => j.how === "related").length });
    changed();
    const readyAt = Math.min(jobs.length, 12);
    let next = 0;
    const worker = async () => {
      while (next < jobs.length) {
        const job = jobs[next++];
        await loadIconItems(job.items.map((x) => ({ prefix: job.set.id, name: x.n })));
        if (!live()) return;
        for (const x of job.items) {
          const ic = ICONS.get(`${job.set.id}:${x.n}`);
          if (ic) list.push(await makeStyle(job.set, x.n, ic, job.how));
        }
        if (!live()) return;
        if (++WORD.loaded >= readyAt) readyFn();
        changedSoon();
      }
    };
    await Promise.all(Array.from({ length: Math.min(6, jobs.length) }, worker));
    if (!live()) return;
    WORD.status = list.length ? "done" : "none";
    changed();
  })().finally(() => readyFn());
  return { ready, done, seq };
}

// the same set's matching icon for home, explore and profile, in the style of the current icon
export const NAV = new Map(); // "prefix|tpl" -> { home, compass, user }
const NAV_WORDS = { home: ["home", "house"], compass: ["compass", "explore"], user: ["user", "person", "account"] };
export async function loadNav(style) {
  const key = `${style.prefix}|${style.tpl}`;
  if (NAV.has(key)) return;
  const names = (w) => [...new Set([style.tpl.replace("{n}", w), w])];
  await loadIconItems(Object.values(NAV_WORDS).flat().flatMap(names).map((name) => ({ prefix: style.prefix, name })));
  NAV.set(key, Object.fromEntries(Object.entries(NAV_WORDS).map(([k, ws]) => [k, ws.flatMap(names).find((n) => hasIcon(style.prefix, n))])));
}
