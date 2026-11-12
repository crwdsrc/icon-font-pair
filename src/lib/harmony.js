// Harmony scoring. Three things we can read from both sides: visual weight, corner shape,
// and how the icon's fill sits with the font's category.
import { WEIGHT_NAMES, fontDesc, fontWeights, nearestWeight, hasItalic } from "./fonts.js";
import { FILL_NAME, rnd } from "./util.js";
const ROUND_SUBS = new Set(["rounded", "blobby"]); const SOFT_SUBS = new Set(["humanist", "geometric", "superellipse", "handwritten", "informal-script"]);
const SHARP_SUBS = new Set(["grotesque", "neo-grotesque", "didone", "modern", "techno", "stencil", "pixel", "blackletter", "art-deco", "mono"]);
const CAT_FIT = {
  outline: { sans: 1, mono: 0.85, serif: 0.65, display: 0.5, handwriting: 0.35 },
  duotone: { sans: 1, display: 0.75, mono: 0.7, serif: 0.6, handwriting: 0.5 },
  filled: { sans: 1, display: 0.9, serif: 0.7, mono: 0.7, handwriting: 0.5 },
  multicolor: { display: 1, handwriting: 1, sans: 0.8, serif: 0.55, mono: 0.5 },
};
export const wLevel = (w) => (w <= 100 ? 1 : w <= 200 ? 1.5 : w <= 300 ? 2 : w <= 400 ? 3 : w <= 500 ? 3.5 : w <= 600 ? 4 : w <= 700 ? 4.5 : 5);
const iconLevel = (s) => s.weight + (s.fill === "filled" ? .3 : 0);
export function bestWeight(s, f) {
  const target = iconLevel(s); let best = null, bd = 9;
  for (const w of fontWeights(f)) { const d = Math.abs(wLevel(w) - target) + (w === 400 ? -0.05 : 0); if (d < bd) { bd = d; best = w; } }
  return best;
}
export function score(s, f, w) {
  const wd = Math.abs(iconLevel(s) - wLevel(w));
  const wScore = 55 * Math.max(0, 1 - wd / 2.5);
  let corner;
  if (s.corners === "rounded") corner = ROUND_SUBS.has(f.s) ? 25 : SOFT_SUBS.has(f.s) ? 19 : SHARP_SUBS.has(f.s) ? 5 : 12;
  else if (s.corners === "sharp") corner = SHARP_SUBS.has(f.s) ? 25 : ROUND_SUBS.has(f.s) ? 2 : 13;
  else corner = ROUND_SUBS.has(f.s) ? 10 : 17;
  const fit = (CAT_FIT[s.fill] || CAT_FIT.outline)[f.c] ?? 0.6;
  const total = Math.max(0, Math.min(100, Math.round(wScore + corner + 20 * fit)));
  return { total, wd, corner, fit };
}
const an = (w) => (/^[aeiou]/i.test(w) ? "an " : "a ") + w;
export function reasons(s, f, w, sc) {
  const out = [], iconW = iconLevel(s), fontW = wLevel(w), wn = WEIGHT_NAMES[w] || w, kind = FILL_NAME[s.fill];
  if (sc.wd <= .6) out.push([1, `The ${kind.toLowerCase()} icons and ${wn} ${w} text carry the same visual weight.`]);
  else if (sc.wd >= 1.8) out.push([0, `The icons look much ${iconW > fontW ? "heavier" : "lighter"} than ${wn} ${w} text.`]);
  else out.push([1, `Icon weight sits close to ${wn} ${w}, with a slight ${iconW > fontW ? "lean toward the icon" : "lean toward the text"}.`]);
  const desc = fontDesc(f).toLowerCase();
  if (sc.fit >= .9) out.push([1, `${kind} icons sit well with ${an(desc)}.`]);
  else if (sc.fit <= .5) out.push([0, `${kind} icons and ${an(desc)} pull in different directions.`]);
  if (sc.corner >= 23) out.push([1, s.corners === "rounded" ? "Round terminals echo the rounded icon corners." : "Crisp terminals match the sharp icon corners."]);
  else if (sc.corner <= 5) out.push([0, s.corners === "rounded" ? "Sharp letterforms clash with the soft icon corners." : "Soft letterforms clash with the sharp icon corners."]);
  return out.slice(0, 4);
}

export function weightedPick(items, scoreFn, temp = 6) {
  const scored = items.map((x) => [x, scoreFn(x)]).sort((a, b) => b[1] - a[1]).slice(0, 80);
  const max = scored[0][1];
  const ws = scored.map(([, v]) => Math.exp((v - max) / temp));
  let r = Math.random() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < scored.length; i++) { r -= ws[i]; if (r <= 0) return scored[i][0]; }
  return scored[0][0];
}
// a random set first, so sets with many variants don't crowd out the rest
function randomStyle(pool) {
  const sets = [...new Set(pool.map((s) => s.prefix))];
  const k = rnd(sets);
  return rnd(pool.filter((s) => s.prefix === k));
}
// the closest icon in the same set: same name pattern, then same fill
export function sameSet(st, pool) {
  const c = pool.filter((s) => s.prefix === st.prefix);
  return c.find((s) => s.tpl === st.tpl) || c.find((s) => s.fill === st.fill) || c[0] || null;
}

// pick a pairing from the pools; locked parts of the current pick stay
export function choose({ locks, cur, mode }, poolStyles, poolFonts) {
  const [li, lf, lw] = locks;
  const harmony = mode === "harmony";
  let style = li && cur ? poolStyles.find((s) => s.id === cur.style.id) || sameSet(cur.style, poolStyles) : null;
  let font = lf && cur ? cur.font : null;
  if (!style) {
    if (font && harmony) style = weightedPick(poolStyles, (s) => score(s, font, lw && cur ? nearestWeight(font, cur.weight) : bestWeight(s, font)).total, 8);
    else style = randomStyle(poolStyles);
  }
  if (!font) {
    if (harmony) font = weightedPick(poolFonts, (f) => score(style, f, lw && cur ? nearestWeight(f, cur.weight) : bestWeight(style, f)).total + (f.p ? 3 : 0) + f.q / 25);
    else font = rnd(poolFonts);
  }
  let weight, italic = false;
  if (lw && cur) { weight = nearestWeight(font, cur.weight); italic = cur.italic && hasItalic(font, weight); }
  else {
    weight = harmony ? bestWeight(style, font) : rnd(fontWeights(font));
    italic = hasItalic(font, weight) && Math.random() < (harmony ? .1 : .25);
  }
  return { style, icon: style.name, how: style.how, font, weight, italic, score: score(style, font, weight) };
}

export const verdictOf = (n) => (n >= 85 ? ["Great match", 1] : n >= 70 ? ["Good match", 1] : n >= 52 ? ["Fair match", 0] : ["Weak match", 0]);
