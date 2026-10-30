#!/usr/bin/env node
// Plant Posts bei Zernio ein (TikTok + Instagram), ohne Claude.
//   ZERNIO_API_KEY=... node posten/zernio.mjs            -> alle offenen Posts aus plan.json einplanen
//   ... node posten/zernio.mjs --nur tiktok-08,insta-01-1 -> nur diese
//   ... node posten/zernio.mjs --konten                   -> nur verbundene Konten anzeigen
// Was eingeplant wurde, steht danach in posten/status.json (wird nie doppelt gesendet).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import os from "node:os";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const API = "https://zernio.com/api/v1";
const KEY = process.env.ZERNIO_API_KEY;
const KEY_YT = process.env.ZERNIO_API_KEY_YT || ""; // zweites Zernio-Konto nur für YouTube
if (!KEY) { console.error("ZERNIO_API_KEY fehlt (GitHub-Secret)."); process.exit(1); }
const keyFuer = plattform => (plattform === "youtube" && KEY_YT ? KEY_YT : KEY);
const args = process.argv.slice(2);
const nur = (() => { const i = args.indexOf("--nur"); return i >= 0 ? args[i + 1].split(",").map(s => s.trim()) : null; })();

const plan = JSON.parse(fs.readFileSync(path.join(DIR, "plan.json"), "utf8"));
const statusDatei = path.join(DIR, "status.json");
const status = fs.existsSync(statusDatei) ? JSON.parse(fs.readFileSync(statusDatei, "utf8")) : {};
const speichern = () => fs.writeFileSync(statusDatei, JSON.stringify(status, null, 1) + "\n");

async function api(methode, pfad, body, key = KEY) {
  const r = await fetch(API + pfad, {
    method: methode,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 500) }; }
  return { ok: r.ok, status: r.status, json };
}

// Verbundene Konten holen
const konten = await api("GET", "/accounts");
if (!konten.ok) { console.error("Konten konnten nicht geladen werden:", konten.status, JSON.stringify(konten.json).slice(0, 400)); process.exit(1); }
let liste = (konten.json.accounts || []).filter(a => a.isActive !== false);
if (KEY_YT) {
  const k2 = await api("GET", "/accounts", null, KEY_YT);
  if (k2.ok) liste = liste.concat((k2.json.accounts || []).filter(a => a.isActive !== false && a.platform === "youtube").map(a => ({ ...a, _yt: true })));
  else console.log("YouTube-Konto (2. Schlüssel) nicht erreichbar:", k2.status);
}
console.log("Verbundene Konten:", liste.map(a => `${a.platform}:${a.username || a.displayName}`).join(", ") || "keine");
if (args.includes("--konten")) process.exit(0);

// --status: bei Zernio nachfragen, was aus den fälligen Posts geworden ist
if (args.includes("--status")) {
  const jetzt = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") + "T" + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  for (const post of plan.posts) {
    const st = status[post.id];
    if (!st?.zernioId || post.zeit.slice(0, 16) > iso(jetzt)) continue;
    const r = await api("GET", `/posts/${st.zernioId}`, null, keyFuer(post.platform));
    const p = r.json?.post || r.json || {};
    const pl = (p.platforms || [])[0] || {};
    const info = { status: p.status, plattform: pl.status, url: pl.platformPostUrl || pl.url || pl.publishedUrl, fehler: pl.errorMessage || pl.error || p.error };
    st.ergebnis = info; speichern();
    console.log(`${post.id} (${post.zeit}): ${JSON.stringify(info)}${r.ok ? "" : " HTTP " + r.status + " " + JSON.stringify(r.json).slice(0, 300)}`);
  }
  process.exit(0);
}
const konto = p => liste.find(a => a.platform === p);

// Geplante Posts zurückziehen: Einträge in plan.loeschen (IDs aus status.json)
for (const pid of plan.loeschen || []) {
  const st = status[pid];
  if (!st?.zernioId || st.geloescht) continue;
  const pp = plan.posts.find(x => x.id === pid);
  const r = await api("DELETE", `/posts/${st.zernioId}`, null, keyFuer(pp?.platform));
  st.geloescht = r.ok; st.ok = false; st.loeschHttp = r.status; st.loeschAntwort = r.ok ? undefined : JSON.stringify(r.json).slice(0, 300);
  speichern();
  console.log(r.ok ? `🗑 ${pid} zurückgezogen` : `✗ ${pid} konnte nicht zurückgezogen werden: HTTP ${r.status} ${JSON.stringify(r.json).slice(0, 300)}`);
}

// Prüfung vor jedem Post: Video laden; Ton muss da sein, so lang wie das Bild und hörbar laut (Stimme).
// Gibt null zurück, wenn alles passt, sonst den Grund.
async function pruefe(url) {
  const tmp = path.join(os.tmpdir(), "pruef-" + Date.now() + ".mp4");
  try {
    const r = await fetch(url);
    if (!r.ok) return `Video nicht abrufbar (HTTP ${r.status})`;
    fs.writeFileSync(tmp, Buffer.from(await r.arrayBuffer()));
    const dauer = s => Number(spawnSync("ffprobe", ["-v", "error", "-select_streams", s, "-show_entries", "stream=duration", "-of", "csv=p=0", tmp]).stdout.toString().trim() || 0);
    const v = dauer("v:0"), a = dauer("a:0");
    if (!v) return "keine Bildspur";
    if (!a) return "keine Tonspur";
    if (Math.abs(v - a) > 0.5) return `Ton (${a.toFixed(1)} s) und Bild (${v.toFixed(1)} s) unterschiedlich lang`;
    const log = spawnSync("ffmpeg", ["-nostats", "-i", tmp, "-map", "0:a:0", "-af", "ebur128", "-f", "null", "-"]).stderr.toString();
    const m = log.match(/I:\s+(-?[\d.]+) LUFS\s*\n\s*Threshold/);
    const lufs = m ? Number(m[1]) : null;
    if (lufs === null) return "Lautheit nicht messbar";
    if (lufs < -24) return `Ton zu leise (${lufs} LUFS) – vermutlich fehlt die Stimme`;
    return null;
  } catch (e) {
    return "Prüfung fehlgeschlagen: " + String(e.message).slice(0, 200);
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

let neu = 0, fehler = 0;
for (const post of plan.posts) {
  if (nur && !nur.includes(post.id)) continue;
  if (status[post.id]?.ok || status[post.id]?.geloescht || (plan.loeschen || []).includes(post.id)) continue;
  // Nie verspätet nachposten: Zeitpunkt muss mindestens 10 Minuten in der Zukunft liegen
  { const j = new Date(Date.now() + 10 * 60000).toLocaleString("sv-SE", { timeZone: "Europe/Berlin" }).replace(" ", "T").slice(0, 16);
    if (post.zeit.slice(0, 16) < j) { console.log(`– ${post.id}: Zeit ${post.zeit} ist vorbei, übersprungen`); continue; } }
  const acc = konto(post.platform);
  if (!acc) { console.log(`✗ ${post.id}: kein ${post.platform}-Konto verbunden`); fehler++; continue; }
  const problem = await pruefe(post.video);
  if (problem) {
    console.log(`✗ ${post.id}: NICHT eingeplant – ${problem}`);
    status[post.id] = { ok: false, zeit: post.zeit, pruefung: problem, am: new Date().toISOString() }; speichern();
    fehler++; continue;
  }
  console.log(`  ${post.id}: Prüfung ok (Bild, Ton, Lautstärke)`);

  const platformSpecificData = post.platform === "tiktok"
    ? { privacyLevel: "PUBLIC_TO_EVERYONE", allowComment: true, allowDuet: true, allowStitch: true,
        commercialContentType: "none", videoMadeWithAi: true, contentPreviewConfirmed: true, expressConsentGiven: true }
    : post.platform === "youtube"
    ? { title: post.titel, visibility: "public", madeForKids: false, categoryId: "24" }
    : (plan.instagram || {});
  const body = {
    content: post.text,
    mediaItems: [{ type: "video", url: post.video }],
    platforms: [{ platform: post.platform, accountId: acc._id, ...(Object.keys(platformSpecificData).length ? { platformSpecificData } : {}) }],
    scheduledFor: post.zeit,
    timezone: "Europe/Berlin",
    metadata: { serie: "24-stock", postId: post.id },
  };
  if (post.platform === "youtube") body.tags = ["zombie", "animation", "story", "24 stock", "shorts"];
  const r = await api("POST", "/posts", body, keyFuer(post.platform));
  const id = r.json?.post?._id || r.json?._id || r.json?.id || null;
  status[post.id] = { ok: r.ok, zeit: post.zeit, zernioId: id, http: r.status, antwort: r.ok ? undefined : JSON.stringify(r.json).slice(0, 600), am: new Date().toISOString() };
  speichern();
  if (r.ok) { neu++; console.log(`✓ ${post.id} eingeplant für ${post.zeit} (${id})`); }
  else { fehler++; console.log(`✗ ${post.id}: HTTP ${r.status} ${JSON.stringify(r.json).slice(0, 400)}`); }
  await new Promise(res => setTimeout(res, 1500));
}
console.log(`Fertig: ${neu} neu eingeplant, ${fehler} Fehler.`);
process.exit(fehler && !neu ? 1 : 0);
