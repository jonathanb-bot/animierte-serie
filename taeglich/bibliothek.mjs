// Bildbibliothek: Hunderte fertige Hintergründe („Platten“) im Kurzgesagt-Stil, einmal geprüft und freigegeben,
// danach in jeder Folge nur noch herausgegriffen und gezoomt/geschwenkt (Jonathans Wunsch 2.11.).
//
//   node taeglich/bibliothek.mjs                    # alle Varianten aus VARIANTEN erzeugen (fehlende/geänderte), Katalog + Übersichten
//   node taeglich/bibliothek.mjs --nur id1,id2      # nur diese Bilder (z. B. vor dem Rendern einer Folge im frischen Container)
//   node taeglich/bibliothek.mjs --fuer <drehbuch>  # alle Bilder, die ein Drehbuch benutzt
//   node taeglich/bibliothek.mjs --freigeben id1,id2|grossstadt|alle   /   --sperren id1,id2
//
// Katalog (im Git): taeglich/bibliothek/katalog.json – pro Bild Kulisse, Angaben, Kamera-/Figurenhöhe, Lichter, Fingerabdruck,
// freigegeben. Die Bilder selbst (2700×4800, doppelte Auflösung) liegen in ausgabe/bibliothek/ (nicht im Git): Sie sind
// reproduzierbar, gleicher Name = gleiches Bild. Drehbuch: [bild id=grossstadt-nacht-v07 du lina zoom-rein] Text …
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KATALOG = path.join(ROOT, "taeglich", "bibliothek", "katalog.json");
const AUS = path.join(ROOT, "ausgabe", "bibliothek");
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : null; };

// Kamera-Mitte wie drehbuch.mjs (Alltags-/Kurzgesagt-Kulissen mit Figuren: 1080, sonst 960)
const KAMERA_Y = { grossstadt: 1080, landschaft: 1080, wald: 1080, rechenzentrum: 1080, weltall: 960, netz: 960, polarlicht: 960, auge: 960 };
const ZEITEN = ["tag", "morgen", "abend", "nacht"];
const nr = n => String(n).padStart(2, "0");

// Welche Varianten es gibt. Jede Zeile = ein Bild. Später einfach erweitern (mehr Kulissen, mehr Varianten).
function VARIANTEN() {
  const out = [];
  // Großstadt: mit Dach vorne (für Einstellungen mit Figuren) und „-weit“ ohne Dach (nur Skyline)
  for (const zeit of ZEITEN) for (let v = 1; v <= 8; v++) {
    out.push({ id: `grossstadt-${zeit}-v${nr(v)}`, kulisse: "grossstadt", angaben: { zeit, variante: v, dach: true } });
    out.push({ id: `grossstadt-${zeit}-weit-v${nr(v)}`, kulisse: "grossstadt", angaben: { zeit, variante: v, dach: false } });
  }
  for (const zeit of ZEITEN) for (const see of [false, true]) for (let v = 1; v <= 4; v++)
    out.push({ id: `landschaft-${zeit}${see ? "-see" : ""}-v${nr(v)}`, kulisse: "landschaft", angaben: { zeit, see, variante: v } });
  for (const zeit of ZEITEN) for (const nebel of [false, true]) for (let v = 1; v <= 4; v++)
    out.push({ id: `wald-${zeit}${nebel ? "-nebel" : ""}-v${nr(v)}`, kulisse: "wald", angaben: { zeit, nebel, variante: v } });
  return out;
}

const katalog = fs.existsSync(KATALOG) ? JSON.parse(fs.readFileSync(KATALOG, "utf8")) : { _info: "", bilder: {} };
katalog._info = "Bildbibliothek (taeglich/bibliothek.mjs). Bilder in ausgabe/bibliothek/<id>.jpg, reproduzierbar. Nur freigegebene Bilder in Folgen benutzen. Drehbuch: [bild id=<id> …].";
const speichern = () => { fs.mkdirSync(path.dirname(KATALOG), { recursive: true }); fs.writeFileSync(KATALOG, JSON.stringify(katalog, null, 1) + "\n"); };

// Freigeben / Sperren
for (const [flag, wert] of [["freigeben", true], ["sperren", false]]) {
  const w = opt(flag);
  if (!w) continue;
  const ids = Object.keys(katalog.bilder).filter(id => w === "alle" || w.split(",").some(x => id === x || katalog.bilder[id].kulisse === x));
  for (const id of ids) katalog.bilder[id].freigegeben = wert;
  speichern(); console.log(`${ids.length} Bilder ${wert ? "freigegeben" : "gesperrt"}`); process.exit(0);
}

let liste = VARIANTEN();
const alle = Object.fromEntries(liste.map(v => [v.id, v]));
for (const [id, m] of Object.entries(katalog.bilder)) if (!alle[id]) alle[id] = { id, kulisse: m.kulisse, angaben: m.angaben };
if (opt("nur")) liste = opt("nur").split(",").map(id => alle[id] || (() => { throw new Error("unbekannt: " + id); })());
if (opt("fuer")) {
  const ids = [...fs.readFileSync(opt("fuer"), "utf8").matchAll(/^\[bild\b[^\]]*\bid=([\w-]+)/gm)].map(m => m[1]);
  liste = [...new Set(ids)].map(id => alle[id] || (() => { throw new Error("unbekannt: " + id); })());
}

fs.mkdirSync(AUS, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM, args: ["--headless=new", "--no-sandbox"] } : {});
const page = await browser.newPage({ viewport: { width: 2700, height: 4800 } });
await page.goto("file://" + path.join(ROOT, "engine", "index.html"));
await page.evaluate(async () => { await document.fonts.load("900 80px Titel"); await document.fonts.load("700 40px HUD"); });
await page.evaluate(() => window.init({ W: 1080, H: 1920, dauer: 1, figuren: {}, szenen: [] }));
let neu = 0;
for (const v of liste) {
  const ky = KAMERA_Y[v.kulisse] ?? 960;
  const meta = await page.evaluate(([k, a, y]) => window.platte(k, a, y), [v.kulisse, v.angaben, ky]);
  const datei = path.join(AUS, `${v.id}.jpg`);
  const buf = await page.screenshot({ type: "jpeg", quality: 92, clip: { x: 0, y: 0, width: meta.breite, height: meta.hoehe } });
  fs.writeFileSync(datei, buf);
  const fingerabdruck = createHash("sha256").update(buf).digest("hex").slice(0, 16);
  const alt = katalog.bilder[v.id];
  if (!alt || alt.fingerabdruck !== fingerabdruck) neu++;
  katalog.bilder[v.id] = { kulisse: v.kulisse, angaben: v.angaben, kamera_y: ky, figur_y: meta.figur_y, figur_skala: meta.figur_skala,
    dunkel: meta.dunkel, lichter: meta.lichter, fingerabdruck,
    // Ein geändertes Bild muss neu freigegeben werden
    freigegeben: alt && alt.fingerabdruck === fingerabdruck ? !!alt.freigegeben : false };
}
await browser.close();
speichern();
console.log(`${liste.length} Bilder erzeugt (${neu} neu oder verändert) → ${path.relative(ROOT, AUS)}/`);

// Übersichten (nur beim Erzeugen ganzer Kulissen): sichtbarer Ausschnitt, 8 × 4 pro Blatt, mit Namen
if (!opt("nur") && !opt("fuer")) {
  const nachKulisse = {};
  for (const v of liste) (nachKulisse[v.kulisse] ||= []).push(v.id);
  for (const [k, ids] of Object.entries(nachKulisse)) {
    for (let b = 0; b * 32 < ids.length; b++) {
      const teil = ids.slice(b * 32, b * 32 + 32);
      const ins = teil.flatMap(id => ["-i", path.join(AUS, `${id}.jpg`)]);
      const filt = teil.map((id, i) => `[${i}]crop=2160:3840:270:480,scale=270:480,drawtext=text='${id}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6[t${i}]`).join(";");
      const kette = teil.map((_, i) => `[t${i}]`).join("");
      const ziel = path.join(AUS, `uebersicht-${k}-${b + 1}.jpg`);
      execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...ins, "-filter_complex", `${filt};${kette}xstack=inputs=${teil.length}:layout=${teil.map((_, i) => `${(i % 8) * 274}_${Math.floor(i / 8) * 484}`).join("|")}:fill=black`, "-frames:v", "1", "-q:v", "3", ziel]);
      console.log("Übersicht:", path.relative(ROOT, ziel));
    }
  }
}
