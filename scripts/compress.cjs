#!/usr/bin/env node
// Writes .gz copies of the built text files next to them, for nginx gzip_static.
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const DIST = path.resolve(__dirname, "..", "dist");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
let n = 0;
for (const f of walk(DIST)) {
  if (!/\.(html|js|css|json|svg|txt)$/.test(f)) continue;
  fs.writeFileSync(f + ".gz", zlib.gzipSync(fs.readFileSync(f), { level: 9 }));
  n++;
}
console.log(`[compress] ${n} files`);
