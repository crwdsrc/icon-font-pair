#!/usr/bin/env node
// Serves dist/ locally for a quick check. Production uses nginx (see Dockerfile).
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST = path.resolve(__dirname, "..", "dist");
const PORT = Number(process.env.PORT) || 8080;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml" };

if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("dist/ is empty. Run `npm run build` first.");
  process.exit(1);
}

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (url === "/healthz") { res.writeHead(200, { "Content-Type": "text/plain" }); return res.end("ok"); }
  const file = path.join(DIST, url === "/" ? "index.html" : url);
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("Not found"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Preview on http://localhost:${PORT}`));
