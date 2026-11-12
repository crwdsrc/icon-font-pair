// App state and actions. Filter state and the icon engine are plain modules; after any change, recompute()
// builds one read-only `view` snapshot (pools, counts on every option, hints) that the components render.
import { FONTS, FONT_BY_NAME, FONT_BY_LOWER, nearestWeight, loadFont } from "./fonts.js";
import { STYLES, WORD, SETS, searchWord, searchSeq, onWordChange, loadIconItems, loadNav, setFromInfo } from "./iconify.js";
import { IF, FF, ICON_GROUPS, FONT_GROUPS, facetBase, computeFacets, wayOut, ICON_CLEAR, FONT_CLEAR, resetFilters,
  resolveIconFill, resolveMonoline, hasWeight, SHARED } from "./filters.js";
import { choose, sameSet } from "./pick.js";
import { subWeight } from "./render.js";
import { rnd, sleep, reducedMotion } from "./util.js";

const load = (k, fallback) => { try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const KEYS = { saved: "pairing-saved-spins", excluded: "pairing-excluded-families", theme: "pairing-theme", dir: "pairing-direction", decor: "pairing-hide-decorative" };
const modeFromHash = () => (location.hash === "#suggestions" ? "suggest" : "random");

class App {
  mode = $state(modeFromHash()); // "random" or "suggest"
  q = $state("download");
  text = $state("Download all");
  locks = $state([false, false, false]);
  cur = $state.raw(null);       // the current pairing
  frame = $state.raw(null);     // what the preview shows while the spin shuffles
  spinning = $state(false);
  theme = $state("light");      // preview only
  dir = $state("ltr");          // preview only
  size = $state(56);
  strokeMatch = $state(true);
  history = $state.raw([]);
  saved = $state.raw([]);
  excluded = $state.raw([]);
  view = $state.raw(null);
  status = $state("");
  toastEl = null;
}
export const app = new App();
export const toast = (msg) => app.toastEl?.create(msg, { duration: 3500 });

// ---------- view ----------
export function recompute() {
  const IB = facetBase(STYLES, ICON_GROUPS), FB = facetBase(FONTS, FONT_GROUPS);
  const poolStyles = IB.pass, poolFonts = FB.pass, w = WORD;
  const hint = {
    empty: ["Type an icon name, such as star or rocket.", true],
    search: [`Searching Iconify for “${w.raw}”.`, false],
    offline: ["Couldn't reach the Iconify API. Check your connection, then edit the word to try again.", true],
    none: [`No icon set has an icon for “${w.raw}”. Try a simpler word, such as heart or home.`, true],
  }[w.status] || [`Found in ${w.sets} icon set${w.sets === 1 ? "" : "s"}${w.related ? `, ${w.related} through a related word` : ""}.${w.status === "loading" ? ` Loading shapes, ${w.loaded} of ${w.sets}.` : ""}`, false];
  // why the spin can't run, and filters to remove
  const block = { waiting: false, lines: [], fixes: [] };
  if (!poolStyles.length && !(app.locks[0] && app.cur)) {
    if (!STYLES.length && (w.status === "search" || w.status === "loading")) { block.waiting = true; block.lines.push(`Loading icons for “${w.raw}”.`); }
    else if (w.status === "offline") block.lines.push("Couldn't reach the Iconify API, so there are no icons to spin.");
    else if (!STYLES.length) block.lines.push(`No icon set has an icon for “${w.raw}”. Try a simpler word.`);
    else {
      block.lines.push(`No icon style fits these filters and “${w.raw}”.`);
      const outs = wayOut("icon", IB);
      // when no single filter is to blame, offer to clear them all
      block.fixes.push(...(outs.length ? outs : [{ g: "all", label: "all icon filters", n: STYLES.filter(ICON_GROUPS.libs).length }]).map((x) => ({ ...x, kind: "icon", unit: "style" })));
    }
  }
  if (!poolFonts.length && !(app.locks[1] && app.cur)) {
    block.lines.push("No font fits these filters.");
    const outs = wayOut("font", FB);
    block.fixes.push(...(outs.length ? outs : [{ g: "all", label: "all font filters", n: FONTS.filter(FONT_GROUPS.excluded).length }]).map((x) => ({ ...x, kind: "font", unit: "font" })));
  }
  // icon sets for the current word, most matches first
  const inPlay = new Map(); for (const s of IB.base.libs) inPlay.set(s.prefix, (inPlay.get(s.prefix) || 0) + 1);
  const first = new Map(); for (const s of STYLES) if (!first.has(s.prefix)) first.set(s.prefix, s);
  const sets = [...first.keys()].map((k) => ({ set: SETS.get(k) || first.get(k).lib, sample: first.get(k), n: inPlay.get(k) || 0, on: !IF.libsOff.has(k) }))
    .sort((a, b) => b.n - a.n || (a.set.name < b.set.name ? -1 : 1));
  const dup = new Set(sets.map((x) => x.set.name).filter((n, i, a) => a.indexOf(n) !== i));
  sets.forEach((x) => (x.name = dup.has(x.set.name) ? `${x.set.name} (${x.set.id})` : x.set.name));
  app.view = {
    poolStyles, poolFonts, styles: STYLES.length, fonts: FONTS.length, word: { ...w }, hint,
    icount: w.status === "search" ? "Searching" : `${poolStyles.length} of ${STYLES.length} styles`,
    fcount: `${poolFonts.length.toLocaleString()} of ${FONTS.length.toLocaleString()} fonts`,
    facets: computeFacets(STYLES, IB, FB), block, sets,
    ff: { src: FF.src, cat: [...FF.cat], weight: FF.weight, width: FF.width, style: FF.style, mood: FF.mood, script: FF.script, q: FF.q, search: FF.search },
    decor: { on: SHARED.hideDecor, fonts: FONTS.length - FONTS.filter(FONT_GROUPS.decor).length, sets: new Set(STYLES.filter((s) => !ICON_GROUPS.decor(s)).map((s) => s.prefix)).size },
    if: { size: IF.size, weightNote: IF.weight.size > 0 && ([...IF.fill].some((x) => x === "filled" || x === "multicolor") || !IF.fill.size) },
  };
}
onWordChange(recompute);

// ---------- filter actions ----------
const toggle = (set, v) => (set.has(v) ? set.delete(v) : set.add(v));
// in the randomizer, filters for a kept icon set or typeface are switched off; suggestions ignore keeps
export const iconLocked = () => app.mode === "random" && app.locks[0] && !!app.cur;
export const fontLocked = () => app.mode === "random" && app.locks[1] && !!app.cur;
const after = (note) => { if (note) toast(note); recompute(); };
export const filters = {
  toggleIcon(group, v) {
    if (iconLocked()) return;
    toggle(IF[group], v);
    after(group === "fill" ? resolveIconFill() : group === "vis" && v === "monoline" ? resolveMonoline() : null);
  },
  setDecor(on) { SHARED.hideDecor = on; store(KEYS.decor, on); recompute(); },
  setIconSize(v) { if (iconLocked()) return; IF.size = +v; recompute(); },
  toggleFont(group, v) { if (fontLocked()) return; toggle(FF[group], v); recompute(); },
  setFontCats(list) { if (fontLocked()) return; FF.cat.clear(); list.forEach((c) => FF.cat.add(c)); recompute(); },
  setFont(k, v) {
    if (fontLocked()) return;
    FF[k] = v;
    recompute();
  },
  // picking a weight also filters fonts to ones that have it, and switches the current pairing to it when its font does
  setWeight(v) {
    FF.weight = v; recompute(); // also allowed while the typeface is kept: it then picks among that font's weights
    const cur = app.cur;
    if (!v || !cur || !hasWeight(cur.font, +v) || cur.weight === +v) return;
    const p = { ...cur, weight: +v, italic: false };
    loadFont(p.font, p.weight, false, app.text).then(() => { if (app.cur === cur) app.cur = p; });
  },
  setLib(prefix, on) { if (iconLocked()) return; on ? IF.libsOff.delete(prefix) : IF.libsOff.add(prefix); recompute(); },
  allLibs(on) { if (iconLocked()) return; if (on) IF.libsOff.clear(); else STYLES.forEach((s) => IF.libsOff.add(s.prefix)); recompute(); },
  clear(kind, g) {
    (kind === "icon" ? ICON_CLEAR : FONT_CLEAR)[g]();
    if (kind === "font" && g === "excluded") syncExcluded();
    if (g === "decor") store(KEYS.decor, false);
    recompute(); toast("Filter removed");
  },
  reset() { resetFilters(); store(KEYS.decor, true); recompute(); toast("Filters reset. Excluded families stay excluded."); },
};

// ---------- excluded families ----------
function syncExcluded() { app.excluded = [...FF.excluded].sort(); store(KEYS.excluded, app.excluded); }
export const excluded = {
  // returns a hint for the form
  add(raw) {
    if (fontLocked()) return null;
    const q = raw.trim().toLowerCase(); if (!q) return null;
    let name = FONT_BY_LOWER.get(q);
    if (!name) {
      const part = FONTS.filter((f) => f.f.toLowerCase().includes(q));
      if (part.length !== 1) return { bad: true, text: part.length ? `${part.length} families match. Pick one from the list.` : "No family with that name." };
      name = part[0].f;
    }
    const had = FF.excluded.has(name);
    this.exclude(name);
    return { bad: false, text: had ? `${name} is already excluded.` : `Excluded ${name}.` };
  },
  exclude(name) {
    FF.excluded.add(name);
    if (app.cur?.font.f === name && app.locks[1]) setLock(1, false);
    syncExcluded(); recompute();
  },
  remove(name) { if (fontLocked()) return; FF.excluded.delete(name); syncExcluded(); recompute(); },
  clear() { if (fontLocked()) return; FF.excluded.clear(); syncExcluded(); recompute(); },
};

// ---------- word ----------
// a new word keeps the current icon set when it has the word, otherwise takes a random icon for it
export async function setWord(v) {
  app.q = v;
  const { done, seq } = searchWord(v);
  await done;
  if (seq !== searchSeq || !app.cur || app.spinning) return;
  const pool = app.view.poolStyles;
  const m = sameSet(app.cur.style, pool) || (pool.length ? rnd(pool) : null);
  if (!m) return;
  const p = { ...app.cur, style: m, icon: m.name, how: m.how };
  await ensureLoaded(p);
  if (seq === searchSeq) app.cur = p;
}

// ---------- spin ----------
const loadedPairs = []; // [font, weight, italic] already loaded, for the shuffle
async function ensureLoaded(p) {
  await Promise.all([loadIconItems([{ prefix: p.style.prefix, name: p.icon }]), loadNav(p.style), loadFont(p.font, p.weight, p.italic, app.text), loadFont(p.font, subWeight(p), false, app.text)]);
  loadedPairs.push([p.font, p.weight, p.italic]);
}
export function setLock(i, on) { const l = [...app.locks]; l[i] = on; app.locks = l; recompute(); }
// a kept icon set or typeface doesn't need anything left in its pool
export const canSpin = (v = app.view) => !!v && (app.locks[0] && app.cur ? true : v.poolStyles.length > 0) && (app.locks[1] && app.cur ? true : v.poolFonts.length > 0);
export async function spin() {
  const { poolStyles, poolFonts } = app.view;
  if (app.spinning || !canSpin()) return;
  app.spinning = true; app.status = "Spinning";
  const pick = choose({ locks: app.locks, cur: app.cur, weight: FF.weight }, poolStyles, poolFonts);
  const ready = ensureLoaded(pick);
  const t0 = performance.now(), minT = reducedMotion() ? 0 : 950, cur = app.cur;
  if (minT && cur) {
    let i = 0;
    while (performance.now() - t0 < minT) {
      const s = app.locks[0] ? cur.style : rnd(poolStyles);
      const fp = app.locks[1] ? [cur.font, cur.weight, cur.italic] : rnd(loadedPairs.length ? loadedPairs : [[cur.font, cur.weight, cur.italic]]);
      app.frame = { style: s, icon: s.name, font: fp[0], weight: app.locks[2] ? cur.weight : fp[1], italic: fp[2] };
      await sleep(70 + i++ * 6);
    }
  }
  await ready;
  app.frame = null; app.cur = pick; app.spinning = false;
  app.history = [{ ...pick, text: app.text }, ...app.history].slice(0, 10);
}
export async function restore(p) {
  if (app.spinning) return;
  if (p.text != null && p.text !== app.text) app.text = p.text;
  await ensureLoaded(p);
  app.cur = p;
}

// ---------- saved (this browser only) ----------
// A saved pairing keeps what it needs to redraw without a new search: the icon's set, name and traits, and the font.
const SET_KEEP = ["name", "total", "license", "licTitle", "licUrl", "author", "grid", "category", "palette"];
const STYLE_KEEP = ["tpl", "fill", "weight", "corners", "stroke", "label", "grid"];
const pickKeys = (o, ks) => Object.fromEntries(ks.map((k) => [k, o[k]]));
const saveKey = (x) => [x.p, x.i, x.f, x.w, x.it ? 1 : 0, x.t].join("|");
const toRecord = (p, text) => ({ v: 2, p: p.style.prefix, i: p.icon, h: p.how, set: pickKeys(p.style.lib, SET_KEEP), st: { ...pickKeys(p.style, STYLE_KEEP), traits: [...p.style.traits] },
  f: p.font.f, w: p.weight, it: !!p.italic, t: text, at: Date.now() });
export function fromRecord(x) {
  const lib = SETS.get(x.p) || { ...setFromInfo(x.p), ...x.set };
  const style = { ...x.st, traits: new Set(x.st.traits), id: `${x.p}:${x.i}`, prefix: x.p, name: x.i, lib, how: x.h || "exact", count: lib.total };
  const font = FONT_BY_NAME.get(x.f);
  return { style, icon: x.i, how: style.how, font, weight: x.w, italic: x.it, text: x.t, at: x.at };
}
export const saves = {
  isSaved(p, text) { return !!p && app.saved.some((x) => saveKey(x) === saveKey(toRecord(p, text))); },
  toggle() {
    if (!app.cur) return;
    const rec = toRecord(app.cur, app.text), k = saveKey(rec), i = app.saved.findIndex((x) => saveKey(x) === k);
    if (i >= 0) { app.saved = app.saved.filter((_, j) => j !== i); toast("Removed from saved"); }
    else { app.saved = [rec, ...app.saved]; toast("Saved. Find it under Saved on the right."); }
    if (!store(KEYS.saved, app.saved)) toast("This browser blocked local storage, so saves last only until you close the page.");
  },
  remove(i) { const name = app.saved[i].f; app.saved = app.saved.filter((_, j) => j !== i); store(KEYS.saved, app.saved); toast(`Removed ${name} pairing`); },
  clear() { app.saved = []; store(KEYS.saved, []); toast("Removed all saved pairings"); },
  warm() { return Promise.allSettled(app.saved.map(fromRecord).flatMap((p) => [loadIconItems([{ prefix: p.style.prefix, name: p.icon }]), loadFont(p.font, p.weight, p.italic, p.text)])); },
};

// ---------- preview settings, remembered in this browser ----------
export function setTheme(t) { app.theme = t; store(KEYS.theme, t); }
export function setDir(d) { app.dir = d; store(KEYS.dir, d); }

// ---------- view: randomizer or suggestions, kept in the address so either can be linked ----------
export function setMode(m) {
  if (app.mode === m) return;
  app.mode = m;
  history.replaceState(null, "", m === "suggest" ? "#suggestions" : location.pathname + location.search);
  recompute(); // locks only switch filters off in the randomizer
}
addEventListener("hashchange", () => setMode(modeFromHash()));
// open a suggestion in the randomizer
export async function openPairing(p) {
  await restore({ ...p, text: app.text });
  app.history = [{ ...p, text: app.text }, ...app.history].slice(0, 10);
  setMode("random");
  scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
}

// ---------- start ----------
export async function start() {
  app.saved = load(KEYS.saved, []).filter((x) => x && x.v === 2 && x.p && x.i && FONT_BY_NAME.has(x.f));
  for (const n of load(KEYS.excluded, [])) { const name = FONT_BY_LOWER.get(String(n).toLowerCase()); if (name) FF.excluded.add(name); }
  app.excluded = [...FF.excluded].sort();
  if (load(KEYS.theme, "light") === "dark") app.theme = "dark";
  if (load(KEYS.dir, "ltr") === "rtl") app.dir = "rtl";
  SHARED.hideDecor = load(KEYS.decor, true) !== false;
  const { ready } = searchWord(app.q);
  await ready;
  recompute(); // shapes stream in with throttled redraws, so take a fresh view before the first pick
  const { poolStyles, poolFonts } = app.view;
  if (!poolStyles.length || !poolFonts.length) return;
  const pick = choose({ locks: app.locks, cur: null, weight: FF.weight }, poolStyles, poolFonts);
  await ensureLoaded(pick);
  app.cur = pick;
  // warm a few fonts so the spin shuffle has variety
  const sample = poolFonts.filter((f) => f.p && f.src !== "fs").sort(() => Math.random() - .5).slice(0, 8);
  for (const f of sample) { const w = nearestWeight(f, 500); await loadFont(f, w, false, app.text); loadedPairs.push([f, w, false]); }
}
