#!/usr/bin/env node
// Refreshes vendor/fontsource/families.json from the published @fontsource packages.
// Usage:
//   node scripts/update-fontsource.cjs             refresh every family already listed
//   node scripts/update-fontsource.cjs id1 id2     also add these Fontsource ids
// Needs network access to the npm registry. Families also on Google Fonts are skipped at build time.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "vendor", "fontsource", "families.json");
const current = JSON.parse(fs.readFileSync(FILE, "utf8"));
const ids = [...new Set(current.map((f) => f.id).concat(process.argv.slice(2)))].sort();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fontsource-"));
const out = [];

for (const id of ids) {
  try {
    const tgz = execFileSync("npm", ["pack", `@fontsource/${id}`, "--silent", "--pack-destination", tmp], { encoding: "utf8" }).trim().split("\n").pop();
    const dir = path.join(tmp, id);
    fs.mkdirSync(dir, { recursive: true });
    execFileSync("tar", ["xzf", path.join(tmp, tgz), "-C", dir, "package/metadata.json", "package/package.json"]);
    const m = JSON.parse(fs.readFileSync(path.join(dir, "package", "metadata.json"), "utf8"));
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package", "package.json"), "utf8"));
    if (!m.subsets.includes("latin")) { console.log(`skip ${id}: no latin subset`); continue; }
    out.push({ id: m.id, family: m.family, category: m.category, subsets: m.subsets, weights: m.weights, styles: m.styles, variable: !!m.variable,
      license: m.license?.type || "", attribution: m.license?.attribution || "", version: pkg.version, type: m.type });
    console.log(`ok   ${id} ${pkg.version}`);
  } catch (e) {
    console.log(`fail ${id}: ${e.message.split("\n")[0]}`);
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
fs.writeFileSync(FILE, JSON.stringify(out, null, 1) + "\n");
console.log(`\nWrote ${out.length} families to vendor/fontsource/families.json`);
