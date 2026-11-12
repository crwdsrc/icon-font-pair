// Markup for lockups (icon plus text in the picked font), icon alignment, links and the code snippet.
import { iconSVG, licGroup, NAV } from "./iconify.js";
import { fontsourceUrl, nearestWeight } from "./fonts.js";
import { wLevel } from "./harmony.js";
import { esc } from "./util.js";
import { ui } from "./ui-icons.js";

export const fontCss = (f, w, it) => `font-family:'${esc(f.f)}',system-ui,sans-serif;font-weight:${w};font-style:${it ? "italic" : "normal"}`;
export const subWeight = (p) => nearestWeight(p.font, 400);
export const capWord = (s) => { const w = s.trim().split(/\s+/)[0] || "Home"; return w[0].toUpperCase() + w.slice(1); };
export const setMono = (L) => `<span class="nm">${esc(L.name.replace(/[^A-Z]/g, "").slice(0, 2) || L.name.slice(0, 2))}</span>`;

// an icon followed by text; opts.arrow adds a trailing arrow, opts.weight overrides the font weight
export function lockup(p, text, opts = {}) {
  const svg = iconSVG(p.style.prefix, p.icon) || "";
  const w = opts.weight || p.weight, it = opts.weight ? false : p.italic;
  return `<span class="lk" style="${fontCss(p.font, w, it)}"><span class="ic">${svg}</span><span class="tx">${esc(text)}</span>${opts.arrow ? `<span class="ic2">${ui("arrow-right")}</span>` : ""}</span>`;
}
// the same set's icon for home, explore or profile, drawn like the current icon
export function iconFor(p, concept) {
  const n = NAV.get(`${p.style.prefix}|${p.style.tpl}`)?.[concept];
  return n ? iconSVG(p.style.prefix, n) : null;
}

// stroke icons can follow the font weight
export function strokeFor(s, w, on) {
  if (!on || !s.stroke) return null;
  return +(s.stroke * Math.max(.45, Math.min(1.9, wLevel(w) / s.weight))).toFixed(2);
}
export function applyStroke(root, p, on) {
  const sw = strokeFor(p.style, p.weight, on);
  root.querySelectorAll(".ic svg [stroke], .ficon svg [stroke], .cicon svg [stroke]").forEach((el) => (el.style.strokeWidth = sw || ""));
}

// Size and place each icon so it spans the text's cap height on one line, or the block of lines when the text wraps.
const mctx = document.createElement("canvas").getContext("2d");
export function fitLockups(root = document) {
  root.querySelectorAll(".lk").forEach((lk) => {
    const tx = lk.querySelector(".tx"); if (!tx) return;
    const cs = getComputedStyle(tx);
    const fs = parseFloat(cs.fontSize);
    let lh = parseFloat(cs.lineHeight); if (!lh) lh = fs * 1.2;
    mctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    const m = mctx.measureText("HXE");
    const capH = m.actualBoundingBoxAscent || fs * .7;
    const fa = m.fontBoundingBoxAscent || fs * .9, fd = m.fontBoundingBoxDescent || fs * .25;
    const lines = Math.max(1, Math.round(tx.getBoundingClientRect().height / lh));
    const capTop = (lh - (fa + fd)) / 2 + fa - capH;         // cap top inside the first line box
    const vis = (lines - 1) * lh + capH;                       // first cap top to last baseline
    const k = lines > 1 ? 1.12 : 1.28;                         // icons carry padding inside their grid
    const size = Math.max(10, vis * k);
    const top = capTop + vis / 2 - size / 2;
    for (const ic of lk.querySelectorAll(":scope > .ic, :scope > .ic2")) {
      const s2 = ic.classList.contains("ic2") ? Math.min(size, capH * 1.25) : size;
      ic.style.width = ic.style.height = s2.toFixed(1) + "px";
      ic.style.marginTop = (capTop + vis / 2 - s2 / 2).toFixed(1) + "px";
    }
    lk.style.paddingTop = top < 0 ? (-top).toFixed(1) + "px" : "";
  });
}

// sets with their own per-icon pages link there, everything else goes to the icon's page on Iconify
export function iconPage(p, query) {
  const n = p.icon, e = encodeURIComponent;
  switch (p.style.prefix) {
    case "lucide": return { url: `https://lucide.dev/icons/${e(n)}`, site: "lucide.dev" };
    case "tabler": return { url: `https://tabler.io/icons/icon/${e(n.replace(/-filled$/, ""))}`, site: "tabler.io" };
    case "bi": return { url: `https://icons.getbootstrap.com/icons/${e(n)}/`, site: "icons.getbootstrap.com" };
    case "bx": case "bxs": return { url: `https://boxicons.com/icons/${e(n.replace(/^bxs?-/, ""))}?free=true&q=${e(query.trim())}`, site: "boxicons.com" };
  }
  return { url: `https://icon-sets.iconify.design/${p.style.prefix}/${e(n)}/`, site: "Iconify" };
}

export function snippet(p, text, size, strokeMatch) {
  const sw = strokeFor(p.style, p.weight, strokeMatch);
  let svg = iconSVG(p.style.prefix, p.icon, "", true) || "";
  if (sw) svg = svg.replace(/stroke-width="[^"]*"/g, `stroke-width="${sw}"`);
  svg = svg.replace(' aria-hidden="true" >', ' aria-hidden="true">');
  const fam = encodeURIComponent(p.font.f).replace(/%20/g, "+");
  const axis = p.italic ? `:ital,wght@1,${p.weight}` : p.font.w.length === 1 && !p.font.v ? "" : `:wght@${p.weight}`;
  const L = p.style.lib, g = licGroup(L.license);
  const credit = ["by", "sa", "nc"].includes(g) ? `\n<!-- Icon: ${L.name}${L.author ? ` by ${L.author}` : ""}, ${L.licTitle}. Credit the author where you use it${g === "nc" ? ", and don't use it commercially" : ""}. -->` : "";
  const alt = `\n<!-- Or let Iconify draw it: <script src="https://cdn.jsdelivr.net/npm/iconify-icon@2/dist/iconify-icon.min.js"></script> then <iconify-icon icon="${p.style.prefix}:${p.icon}"></iconify-icon> -->`;
  const fb = { sans: "sans-serif", serif: "serif", mono: "monospace", display: "sans-serif", handwriting: "cursive" }[p.font.c];
  const head = p.font.src === "fs"
    ? `<!-- Fontsource via jsDelivr. To self-host: npm install @fontsource/${p.font.id} and import "@fontsource/${p.font.id}/${p.weight}${p.italic ? "-italic" : ""}.css" -->
<style>
@font-face {
  font-family: "${p.font.f}";
  font-style: ${p.italic ? "italic" : "normal"};
  font-weight: ${p.weight};
  font-display: swap;
  src: url(${fontsourceUrl(p.font, p.weight, p.italic ? "italic" : "normal")}) format("woff2");
}
</style>`
    : `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${fam}${axis}&display=swap" rel="stylesheet">`;
  return `${head}${credit}${alt}

<span class="lockup">
  ${svg}
  <span>${esc(text.trim())}</span>
</span>

<style>
.lockup {
  display: inline-flex;
  align-items: center;
  gap: 0.28em;
  font-family: "${p.font.f}", ${fb};
  font-weight: ${p.weight};${p.italic ? "\n  font-style: italic;" : ""}
  font-size: ${size}px;
  line-height: 1.08;
}
/* Sized to the cap height so icon and text read at the same visual height */
.lockup svg { width: 0.92em; height: 0.92em; flex: none; }
</style>`;
}
