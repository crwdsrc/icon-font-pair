// Font catalog, labels and loaders. The catalog is built by scripts/build-data.cjs.
import data from "../generated/fonts.json";
import { sleep } from "./util.js";

export const FONTS = data.FONTS;
export const SCRIPT_GROUPS = data.SCRIPT_GROUPS;
FONTS.forEach((f, i) => (f.idx = i));
export const FONT_BY_NAME = new Map(FONTS.map((f) => [f.f, f]));
export const FONT_BY_LOWER = new Map(FONTS.map((f) => [f.f.toLowerCase(), f.f]));

export const WEIGHT_NAMES = { 100: "Thin", 200: "ExtraLight", 300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold", 900: "Black" };
export const CAT_NAME = { sans: "Sans-serif", serif: "Serif", display: "Display", handwriting: "Handwriting", mono: "Monospace" };
export const fontWeights = (f) => (f.v ? [100, 200, 300, 400, 500, 600, 700, 800, 900].filter((w) => w >= f.v[0] && w <= f.v[1]) : f.w);
export const nearestWeight = (f, w) => fontWeights(f).reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a));
export const hasItalic = (f) => !!f.i;

export function fontCssUrl(f, w, it) {
  const fam = encodeURIComponent(f.f).replace(/%20/g, "+");
  if (f.w.length === 1 && !f.i) return `https://fonts.googleapis.com/css2?family=${fam}&display=swap`;
  return `https://fonts.googleapis.com/css2?family=${fam}:ital,wght@${it ? 1 : 0},${w}&display=swap`;
}
export const fontsourceUrl = (f, w, style) => `https://cdn.jsdelivr.net/fontsource/fonts/${f.id}@${f.ver}/${f.fsub}-${w}-${style}.woff2`;
export const fontPage = (f) => (f.src === "fs"
  ? { url: `https://fontsource.org/fonts/${f.id}`, site: "Fontsource" }
  : { url: `https://fonts.google.com/specimen/${encodeURIComponent(f.f).replace(/%20/g, "+")}`, site: "Google Fonts" });

const fontLoaded = new Set();
export function loadFont(f, w, it, sampleText = "Winner") {
  const key = `${f.f}|${w}|${it ? 1 : 0}`;
  if (fontLoaded.has(key)) return Promise.resolve();
  if (f.src === "fs") {
    const style = it ? "italic" : "normal";
    const face = new FontFace(f.f, `url(${fontsourceUrl(f, w, style)}) format("woff2")`, { weight: String(w), style });
    document.fonts.add(face);
    const go = face.load().catch(() => {});
    return Promise.race([go, sleep(6000)]).then(() => { fontLoaded.add(key); });
  }
  return new Promise((resolve) => {
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = fontCssUrl(f, w, it);
    const done = () => {
      document.fonts.load(`${it ? "italic " : ""}${w} 40px "${f.f}"`, sampleText + f.f).catch(() => {}).finally(() => { fontLoaded.add(key); resolve(); });
    };
    l.onload = done; l.onerror = () => resolve();
    document.head.appendChild(l);
    setTimeout(resolve, 5000);
  });
}
