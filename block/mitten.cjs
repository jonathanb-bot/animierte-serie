// Standbilder in der Mitte jeder Einstellung (oder an gegebenen Zeiten)
const { chromium } = require("playwright");
const path = require("path");
const FOLGE = process.env.FOLGE || "folge-01"; process.chdir(path.join(__dirname, FOLGE));
const fs = require("fs");
(async () => { await require("./server.cjs")(); const b = await chromium.launch({ executablePath: process.env.CHROMIUM || (require("fs").existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined), args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: process.env.FORMAT === "quer" ? { width: 1280, height: 720 } : { width: 720, height: 1280 } }); p.on("pageerror", e => console.log("[fehler]", e.message, e.stack)); p.on("console", m => { if (!/GL Driver|404/.test(m.text())) console.log("[seite]", m.text()); });
  await p.goto((fs.existsSync("szene.js") ? `http://127.0.0.1:8767/folge.html?folge=${FOLGE}&plan=${process.env.PLAN || "plan_final.json"}${process.env.SPRACHE ? "&sprache=" + process.env.SPRACHE : ""}${process.env.FORMAT ? "&format=" + process.env.FORMAT : ""}` : `http://127.0.0.1:8767/${FOLGE}/szene.html${process.env.PLAN ? "?plan=" + process.env.PLAN : ""}`)); await p.waitForFunction(() => window.bereit === true, null, { timeout: 180000 });
  const G = await p.evaluate(() => window.GRENZEN); const arg = process.argv[2];
  let zeiten; if (arg && arg !== "alle") zeiten = arg.split(",").map(Number); else { const D = await p.evaluate(() => window.DAUER); zeiten = G.map((g, i) => ((i ? G[i - 1] : 0) + Math.min(g, D - 0.1)) / 2); }
  fs.rmSync("bilder", { recursive: true, force: true }); fs.mkdirSync("bilder"); const t0 = Date.now();
  for (const [i, t] of zeiten.entries()) { await p.evaluate(t => window.renderAt(t), t); await p.screenshot({ path: `bilder/${String(i).padStart(2, "0")}_${t.toFixed(2)}.jpg`, type: "jpeg", quality: 88 }); }
  console.log("fertig", zeiten.length, "in", ((Date.now() - t0) / 1000).toFixed(1), "s"); await b.close(); })();
