// Rendert szene.html Bild für Bild und legt den Ton darunter. --bilder t1,t2,… nur Standbilder.
const { chromium } = require("playwright");
const path = require("path");
const FOLGE = process.env.FOLGE || "folge-01"; process.chdir(path.join(__dirname, FOLGE));
const { execFileSync } = require("child_process");
const fs = require("fs");
const FPS = Number(process.env.FPS || 60);
const bi = process.argv.indexOf("--bilder"); const nurBilder = bi > 0;
const von = Number(process.env.VON || 0), bis = process.env.BIS ? Number(process.env.BIS) : null, ordner = process.env.ORDNER || "frames";
(async () => { await require("./server.cjs")();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || (require("fs").existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined), args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  // SKALA=1.5 → 1080×1920, SKALA=2 → 1440×2560 (Qualitätstest 24.11.); Standard 1 = 720×1280 wie bisher
  const QUER = process.env.FORMAT === "quer";   // FORMAT=quer: 1280×720 (mit SKALA=2 → 2560×1440), lange Videos
  const page = await browser.newPage({ viewport: QUER ? { width: 1280, height: 720 } : { width: 720, height: 1280 }, deviceScaleFactor: Number(process.env.SKALA || 1) });
  page.on("console", m => console.log("[seite]", m.text()));
  page.on("pageerror", e => console.log("[fehler]", e.message));
  await page.goto((fs.existsSync("szene.js") ? `http://127.0.0.1:8767/folge.html?folge=${FOLGE}&plan=${process.env.PLAN || "plan_final.json"}${process.env.SPRACHE ? "&sprache=" + process.env.SPRACHE : ""}${process.env.FORMAT ? "&format=" + process.env.FORMAT : ""}` : `http://127.0.0.1:8767/${FOLGE}/szene.html${process.env.PLAN ? "?plan=" + process.env.PLAN : ""}`));
  await page.waitForFunction(() => window.bereit === true, null, { timeout: 120000 });
  const DAUER = await page.evaluate(() => window.DAUER);
  const n = Math.round(DAUER * FPS);
  // LISTE=datei: nur diese Bildnummern (eine pro Zeile) neu rendern, z. B. nach entflackern.py --liste
  const liste = process.env.LISTE ? fs.readFileSync(process.env.LISTE, "utf8").split(/\s+/).filter(Boolean).map(Number) : null;
  const zeiten = nurBilder ? process.argv[bi + 1].split(",").map(Number) : liste ? liste.map(k => k / FPS) : Array.from({ length: n }, (_, i) => i / FPS).slice(von, bis ?? n);
  if (nurBilder) { fs.rmSync("bilder", { recursive: true, force: true }); fs.mkdirSync("bilder"); } else fs.mkdirSync(ordner, { recursive: true });
  let i = 0; const t0 = Date.now();
  for (const t of zeiten) {
    const nr = liste ? liste[i] : von + i; const name0 = nurBilder ? null : `${ordner}/${String(nr).padStart(5, "0")}.jpg`;
    if (name0 && process.env.WEITER && fs.existsSync(name0)) { i++; continue; }   // WEITER=1: schon fertige Bilder überspringen
    await page.evaluate(t => window.renderAt(t), t);
    const name = nurBilder ? `bilder/${String(i).padStart(3, "0")}_${t.toFixed(2)}.jpg` : `${ordner}/${String(nr).padStart(5, "0")}.jpg`;
    await page.screenshot({ path: name, type: "jpeg", quality: 93, timeout: 180000 }); i++;
    if (i % 60 === 0) console.log(`${i}/${zeiten.length} Bilder, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  console.log(`fertig ${i} Bilder in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  await browser.close();
})();
