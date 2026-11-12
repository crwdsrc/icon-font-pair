export const rnd = (a) => a[Math.floor(Math.random() * a.length)];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const FILL_NAME = { outline: "Outline", filled: "Filled", duotone: "Duotone", multicolor: "Color" };
export const WEIGHT_WORD = { 1: "Thin", 2: "Light", 3: "Medium", 4: "Bold", 5: "Heavy" };
