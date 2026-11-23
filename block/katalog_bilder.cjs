// Vorschaubilder der Bibliothek: node block/katalog_bilder.cjs [name,name,… | gruppe:Figuren | alle]
// → block/katalog/<name>.jpg und block/katalog/uebersicht.jpg (Kontaktbogen mit Namen). Server: python3 -m http.server 8767 --directory block
const { chromium } = require("playwright"); const path = require("path"); const fs = require("fs"); const { execFileSync } = require("child_process");
const ORDNER = path.join(__dirname, "katalog");
(async () => { const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: 720, height: 1280 } }); p.on("pageerror", e => console.log("[fehler]", e.message)); p.on("console", m => { if (!/GL Driver|404/.test(m.text())) console.log("[seite]", m.text()); });
  await p.goto("http://127.0.0.1:8767/katalog.html"); await p.waitForFunction(() => window.bereit === true, null, { timeout: 180000 });
  const alle = await p.evaluate(() => window.NAMEN), gruppen = await p.evaluate(() => window.GRUPPEN); const arg = process.argv[2] || "alle";
  const namen = arg === "alle" ? alle : arg.startsWith("gruppe:") ? alle.filter(n => gruppen[n].startsWith(arg.slice(7))) : arg.split(",");
  fs.mkdirSync(ORDNER, { recursive: true });
  for (const n of namen) { try { await p.evaluate(n => window.zeige(n), n); await p.screenshot({ path: path.join(ORDNER, n + ".jpg"), type: "jpeg", quality: 88 }); } catch (e) { console.log("✗", n, e.message.split("\n")[0]); } }
  await b.close(); console.log("fertig", namen.length, "Bilder in", ORDNER);
  if (arg === "alle") execFileSync("python3", [path.join(__dirname, "katalog_uebersicht.py")], { stdio: "inherit" }); })();
