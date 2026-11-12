// Suggestions: the design-system pairings in systems.js, checked against the current word and filters.
// Each one draws with the word's icon from the system's set and its font at the system's body weight,
// or at the picked weight when the font has it. Pairings that fail a filter say which ones.
import { SYSTEMS } from "./systems.js";
import { STYLES, WORD, SETS } from "./iconify.js";
import { FONT_BY_NAME, nearestWeight } from "./fonts.js";
import { ICON_GROUPS, FONT_GROUPS, ICON_GROUP_LABEL, FONT_GROUP_LABEL, FF, hasWeight } from "./filters.js";

const failing = (x, groups) => Object.keys(groups).filter((g) => !groups[g](x));

// the system's default variant first, then the order the search ranked them in
function bestStyle(sys) {
  const all = STYLES.filter((s) => s.prefix === sys.prefix);
  const ranked = sys.prefer ? [...all.filter((s) => sys.prefer.test(s.name)), ...all.filter((s) => !sys.prefer.test(s.name))] : all;
  let best = null, fails = [];
  for (const s of ranked) {
    const f = failing(s, ICON_GROUPS);
    if (!f.length) return { style: s, fails: [] };
    if (!best || f.length < fails.length) { best = s; fails = f; }
  }
  return { style: best, fails };
}

export function suggestions() {
  const pending = WORD.status === "search" || WORD.status === "loading";
  const picked = +FF.weight;
  return SYSTEMS.map((sys) => {
    const font = FONT_BY_NAME.get(sys.font);
    const setName = SETS.get(sys.prefix)?.name || sys.prefix;
    const { style, fails: iFails } = bestStyle(sys);
    const fFails = font ? failing(font, FONT_GROUPS) : [];
    const reasons = [];
    if (!style) reasons.push({ label: pending ? `Looking for “${WORD.raw}” in ${setName}` : `${setName} has no icon for “${WORD.raw}”`, pending });
    for (const g of iFails) reasons.push(g === "libs" ? { kind: "lib", g: sys.prefix, label: `${setName} is turned off in Icon sets` } : { kind: "icon", g, label: ICON_GROUP_LABEL[g]() });
    for (const g of fFails) reasons.push(g === "excluded" ? { kind: "font", g, label: `${sys.font} is excluded` } : { kind: "font", g, label: FONT_GROUP_LABEL[g]() });
    const weight = !font ? 400 : picked && hasWeight(font, picked) ? picked : nearestWeight(font, sys.weights[0][0]);
    const p = style && font ? { style, icon: style.name, how: style.how, font, weight, italic: false } : null;
    return { sys, font, setName, p, ok: !!p && !reasons.length, reasons };
  });
}
