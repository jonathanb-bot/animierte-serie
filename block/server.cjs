// Kleiner Webserver für block/ (Port 8767), damit render.cjs und mitten.cjs ohne extra Server laufen (auch im GitHub-Workflow).
// Läuft schon einer auf dem Port (z. B. python3 -m http.server 8767 --directory block), wird der benutzt.
const http = require("http"), fs = require("fs"), path = require("path");
const WURZEL = __dirname;
const TYP = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".wav": "audio/wav", ".mp3": "audio/mpeg", ".woff2": "font/woff2", ".ttf": "font/ttf", ".glb": "model/gltf-binary", ".hdr": "application/octet-stream" };
module.exports = (port = 8767) => new Promise((ok) => {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
    const datei = path.join(WURZEL, path.normalize(p).replace(/^(\.\.[/\\])+/, ""));
    if (!datei.startsWith(WURZEL)) { res.writeHead(403); return res.end(); }
    fs.readFile(datei, (err, d) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { "Content-Type": TYP[path.extname(datei).toLowerCase()] || "application/octet-stream" }); res.end(d); });
  });
  srv.on("error", (e) => { if (e.code === "EADDRINUSE") ok(null); else throw e; });
  srv.listen(port, "127.0.0.1", () => { srv.unref(); ok(srv); });
});
