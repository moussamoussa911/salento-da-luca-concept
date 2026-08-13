import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4178);
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".svg":"image/svg+xml", ".webp":"image/webp", ".ico":"image/x-icon" };
const routes = { "/":"index.html", "/speisekarte":"speisekarte.html", "/reservieren":"reservieren.html", "/trattoria":"trattoria.html", "/rechtliches":"rechtliches.html" };

createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/\/$/, "") || "/";
    const requested = routes[pathname] || pathname.replace(/^\//, "");
    const safe = normalize(requested).replace(/^(\.\.[/\\])+/, "");
    let target = join(root, safe);
    try { if ((await stat(target)).isDirectory()) target = join(target, "index.html"); } catch {}
    const body = await readFile(target);
    res.writeHead(200, {"Content-Type":types[extname(target).toLowerCase()] || "application/octet-stream", "X-Robots-Tag":"noindex, nofollow", "Cache-Control":"no-cache"});
    res.end(body);
  } catch {
    res.writeHead(404,{"Content-Type":"text/html; charset=utf-8"});
    res.end(await readFile(join(root,"404.html")));
  }
}).listen(port,"0.0.0.0",()=>console.log(`Salento da Luca concept: http://127.0.0.1:${port}`));
