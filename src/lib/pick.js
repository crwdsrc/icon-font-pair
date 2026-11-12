// Picking a pairing: a random icon set, icon, font and weight from what the filters allow.
// Locked parts of the current pairing stay.
import { fontWeights, nearestWeight, hasItalic } from "./fonts.js";
import { rnd } from "./util.js";

// a random set first, so sets with many variants don't crowd out the rest
function randomStyle(pool) {
  const k = rnd([...new Set(pool.map((s) => s.prefix))]);
  return rnd(pool.filter((s) => s.prefix === k));
}
// the closest icon in the same set: same name pattern, then same fill
export function sameSet(st, pool) {
  const c = pool.filter((s) => s.prefix === st.prefix);
  return c.find((s) => s.tpl === st.tpl) || c.find((s) => s.fill === st.fill) || c[0] || null;
}
export function choose({ locks: [li, lf, lw], cur }, poolStyles, poolFonts) {
  const style = (li && cur && (poolStyles.find((s) => s.id === cur.style.id) || sameSet(cur.style, poolStyles))) || randomStyle(poolStyles);
  const font = lf && cur ? cur.font : rnd(poolFonts);
  const weight = lw && cur ? nearestWeight(font, cur.weight) : rnd(fontWeights(font));
  const italic = hasItalic(font) && (lw && cur ? cur.italic : Math.random() < 0.2);
  return { style, icon: style.name, how: style.how, font, weight, italic };
}
