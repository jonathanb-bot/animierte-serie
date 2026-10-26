#!/usr/bin/env node
// Rendert eine Folge: node render.mjs episoden/folge-01.json [--fps 30] [--vorschau] [--von 0 --bis 20]
import { chromium } from "playwright";
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const flag = n => args.includes("--" + n);
import { parse } from "./drehbuch.mjs";
const datei = args.find(a => /\.(json|txt)$/.test(a));
if (!datei) { console.error("Bitte Folge angeben, z.B. episoden/folge-01.txt"); process.exit(1); }

const castDatei = path.join(ROOT, "figuren.json");
const cast = fs.existsSync(castDatei) ? JSON.parse(fs.readFileSync(castDatei, "utf8")) : {};
const ep = datei.endsWith(".txt") ? parse(fs.readFileSync(datei, "utf8"), cast) : { ...JSON.parse(fs.readFileSync(datei, "utf8")) };
if (!datei.endsWith(".txt")) ep.figuren = { ...cast, ...(ep.figuren || {}) };
const id = path.basename(datei).replace(/\.(json|txt)$/, "");
const vorschau = flag("vorschau");
const FPS = Number(opt("fps", vorschau ? 15 : ep.fps || 30));
const W = 1080, H = 1920;

const dauerVon = f => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
// Echte Wortzeiten (audio/folge-XX/NNN.json, z. B. von `python -m ton.folge`) den Drehbuch-Wörtern zuordnen
const norm = w => w.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
function wortzeiten(roh, datei) {
  if (!fs.existsSync(datei)) return null;
  const wz = JSON.parse(fs.readFileSync(datei, "utf8"));
  const out = []; let j = 0;
  for (const w of roh) {
    const ziel = norm(w);
    if (!ziel) { out.push(null); continue; }
    let acc = "", a = null, b = null;
    while (j < wz.length && acc.length < ziel.length) { if (a === null) a = wz[j].start; acc += norm(wz[j].w); b = wz[j].ende; j++; }
    if (a === null || acc !== ziel) return null;
    out.push([a, b]);
  }
  return out.map((z, k) => z || [out[k - 1]?.[1] ?? 0, out[k - 1]?.[1] ?? 0]);
}

// ---------- Timing ----------
let start = 0;
const szenen = ep.szenen.map((s, i) => {
  const nr = String(i + 1).padStart(3, "0"), nr2 = String(i + 1).padStart(2, "0");
  const kandidaten = [s.audio, `audio/${id}/${nr}.mp3`, `audio/${id}/${nr}.wav`, `audio/${id}/${nr2}.mp3`].filter(Boolean).map(p => path.join(ROOT, p));
  const audio = kandidaten.find(p => fs.existsSync(p));
  const roh = (s.text || "").replace(/[„“"»«]/g, "").split(/\s+/).filter(Boolean);
  const sprechDauer = audio ? dauerVon(audio) : roh.reduce((a, w) => a + 0.2 + w.replace(/\*/g, "").length * 0.035 + (/[.!?…]$/.test(w) ? 0.25 : /[,:;]$/.test(w) ? 0.12 : 0), 0);
  const dauer = s.dauer || (audio ? sprechDauer + 0.35 : roh.length ? Math.max(2.0, sprechDauer + 0.55) : 3);
  // Wörter gleichmäßig nach Länge verteilen (Satzzeichen = kleine Pause)
  const gew = roh.map(w => w.replace(/\*/g, "").length + 3 + (/[.!?…]$/.test(w) ? 4 : /[,:;]$/.test(w) ? 2 : 0));
  const summe = gew.reduce((a, b) => a + b, 0) || 1;
  const t0 = audio ? 0.05 : 0.15, t1 = audio ? sprechDauer - 0.05 : Math.min(dauer - 0.3, t0 + sprechDauer);
  let acc = t0;
  const echt = audio ? wortzeiten(roh, audio.replace(/\.(mp3|wav)$/, ".json")) : null;
  const woerter = roh.map((w, k) => {
    const len = (gew[k] / summe) * (t1 - t0);
    const key = /^\*.*\*[.,!?…:;]?$/.test(w);
    const o = echt ? { w: w.replace(/\*/g, ""), start: echt[k][0], ende: echt[k][1], key }
                   : { w: w.replace(/\*/g, ""), start: acc, ende: acc + len, key };
    acc += len; return o;
  });
  const o = { ...s, start, dauer, woerter, _audio: audio || null };
  start += dauer;
  return o;
});
const gesamt = start;
const von = Number(opt("von", 0)), bis = Math.min(Number(opt("bis", gesamt)), gesamt);
const frames = Math.round((bis - von) * FPS);
console.log(`Folge ${id}: ${szenen.length} Szenen, ${gesamt.toFixed(1)} s, rendere ${frames} Frames @ ${FPS} fps`);

// ---------- Nur Standbilder (schnelle Kontrolle): --bilder ----------
if (flag("bilder")) {
  const dir = path.join(ROOT, "ausgabe", `${id}-bilder`); fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto("file://" + path.join(ROOT, "engine", "index.html"));
  await page.evaluate(async () => { await document.fonts.load("900 80px Titel"); await document.fonts.load("700 40px HUD"); });
  await page.evaluate(d => window.init(d), { W, H, dauer: gesamt, figuren: ep.figuren, untertitel_y: ep.untertitel_y, szenen });
  const nur = opt("nur", null); // z.B. --nur 1-12
  const [na, nb] = nur ? nur.split("-").map(Number) : [1, szenen.length];
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  for (const [i, s] of szenen.entries()) {
    if (i + 1 < na || i + 1 > (nb || na)) continue;
    await page.evaluate(t => window.zeichne(t), s.start + s.dauer * 0.6);
    await page.screenshot({ path: path.join(dir, `${String(i + 1).padStart(3, "0")}.jpg`), type: "jpeg", quality: 85 });
  }
  await browser.close();
  console.log("Bilder in", path.relative(ROOT, dir));
  process.exit(0);
}

// ---------- Ton ----------
fs.mkdirSync(path.join(ROOT, "ausgabe"), { recursive: true });
const tmp = fs.mkdtempSync(path.join(ROOT, "ausgabe", ".tmp-"));
const tonDatei = path.join(tmp, "ton.wav");
{
  const inputs = [], filter = [], mix = [];
  let n = 0;
  // Musik oder Atmo
  const musik = ep.musik && fs.existsSync(path.join(ROOT, ep.musik)) ? path.join(ROOT, ep.musik) : null;
  if (musik) {
    inputs.push("-stream_loop", "-1", "-i", musik);
    filter.push(`[${n}:a]atrim=0:${gesamt},volume=${ep.musik_lautstaerke ?? 0.16},afade=t=out:st=${Math.max(0, gesamt - 1.5)}:d=1.5[m]`); mix.push("[m]"); n++;
  } else {
    inputs.push("-f", "lavfi", "-i", `anoisesrc=color=brown:amplitude=0.6:d=${gesamt}`);
    inputs.push("-f", "lavfi", "-i", `sine=frequency=55:d=${gesamt}`);
    filter.push(`[${n}:a]lowpass=f=180,volume=0.25[a1]`, `[${n + 1}:a]volume=0.05[a2]`, `[a1][a2]amix=inputs=2:normalize=0,afade=t=in:d=1,afade=t=out:st=${Math.max(0, gesamt - 1.5)}:d=1.5[m]`);
    mix.push("[m]"); n += 2;
  }
  // Whoosh bei jedem Schnitt
  const schnitte = szenen.slice(1).filter((s, i) => s.typ !== szenen[i].typ || s.whoosh).map(s => s.start);
  if (schnitte.length && ep.whoosh !== false) {
    inputs.push("-f", "lavfi", "-i", "anoisesrc=color=pink:amplitude=0.9:d=0.5");
    filter.push(`[${n}:a]highpass=f=400,lowpass=f=3500,afade=t=in:d=0.18,afade=t=out:st=0.18:d=0.32,volume=0.13,asplit=${schnitte.length}${schnitte.map((_, i) => `[w${i}]`).join("")}`);
    schnitte.forEach((t, i) => { const ms = Math.max(0, Math.round((t - 0.2) * 1000)); filter.push(`[w${i}]adelay=${ms}|${ms}[wd${i}]`); mix.push(`[wd${i}]`); });
    n++;
  }
  // Stimme
  for (const s of szenen) if (s._audio) {
    inputs.push("-i", s._audio);
    const ms = Math.round(s.start * 1000);
    filter.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms},volume=${ep.stimme_lautstaerke ?? 1.0}[v${n}]`); mix.push(`[v${n}]`); n++;
  }
  filter.push(`${mix.join("")}amix=inputs=${mix.length}:normalize=0:duration=longest,atrim=0:${gesamt},alimiter=limit=0.95[out]`);
  execFileSync("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", filter.join(";"), "-map", "[out]", "-ar", "48000", "-ac", "2", tonDatei]);
}

// ---------- Bild ----------
const ziel = path.join(ROOT, "ausgabe", `${id}${vorschau ? "-vorschau" : ""}.mp4`);
const ff = spawn("ffmpeg", ["-y", "-v", "error",
  "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
  "-ss", String(von), "-i", tonDatei,
  "-map", "0:v", "-map", "1:a", "-shortest",
  "-c:v", "libx264", "-preset", "veryfast", "-crf", vorschau ? "28" : "19", "-pix_fmt", "yuv420p",
  ...(vorschau ? ["-vf", "scale=540:960"] : []),
  "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", ziel], { stdio: ["pipe", "inherit", "inherit"] });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto("file://" + path.join(ROOT, "engine", "index.html"));
await page.evaluate(async () => { await document.fonts.load("900 80px Titel"); await document.fonts.load("700 40px HUD"); });
await page.evaluate(d => window.init(d), { W, H, dauer: gesamt, figuren: ep.figuren, untertitel_y: ep.untertitel_y, szenen });

const schreib = buf => new Promise(r => (ff.stdin.write(buf) ? r() : ff.stdin.once("drain", r)));
const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  await page.evaluate(t => window.zeichne(t), von + f / FPS);
  const buf = await page.screenshot({ type: "jpeg", quality: vorschau ? 80 : 93 });
  await schreib(buf);
  if (f % (FPS * 5) === 0) console.log(`  ${(f / FPS).toFixed(0)} s / ${((bis - von)).toFixed(0)} s  (${((Date.now() - t0) / 1000).toFixed(0)} s Rechenzeit)`);
}
ff.stdin.end();
await new Promise(r => ff.on("close", r));
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Fertig: ${path.relative(ROOT, ziel)}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
