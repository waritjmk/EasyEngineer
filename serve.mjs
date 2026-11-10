// Tiny static server for local preview: node serve.mjs  ->  http://localhost:4173
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "docs");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".json": "application/json" };

createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (p.endsWith("\\") || p.endsWith("/")) p += "index.html";
  const file = join(dir, p);
  if (!file.startsWith(dir)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
  }
}).listen(4173, () => console.log("http://localhost:4173"));
