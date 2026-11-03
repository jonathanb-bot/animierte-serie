#!/usr/bin/env node
// Plant Posts bei Zernio ein (TikTok + Instagram), ohne Claude.
//   ZERNIO_API_KEY=... node posten/zernio.mjs            -> alle offenen Posts aus plan.json einplanen
//   ... node posten/zernio.mjs --nur tiktok-08,insta-01-1 -> nur diese
//   ... node posten/zernio.mjs --konten                   -> nur verbundene Konten anzeigen
//   ... node posten/zernio.mjs --analyse                  -> Analytics aller veröffentlichten Posts + Konten -> posten/analyse.json
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
// Schlüssel für einen schon eingeplanten Post: das Konto, über das er eingeplant wurde (st.yt), sonst wie früher nach Plattform
const keyVon = (post, st) => (st && typeof st.yt === "boolean" ? (st.yt ? KEY_YT : KEY) : keyFuer(post?.platform));
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
const alleKonten = (konten.json.accounts || []).map(a => ({ ...a, _yt: false }));
if (KEY_YT) {
  const k2 = await api("GET", "/accounts", null, KEY_YT);
  if (k2.ok) alleKonten.push(...(k2.json.accounts || []).map(a => ({ ...a, _yt: true })));
  else console.log("Zweites Zernio-Konto (2. Schlüssel) nicht erreichbar:", k2.status);
}
// Alle aktiven Konten beider Schlüssel (z. B. auch der englische Account im 2. Zernio-Konto, Jonathan 3.11.)
let liste = alleKonten.filter(a => a.isActive !== false);
console.log("Verbundene Konten:", liste.map(a => `${a.platform}:${a.username || a.displayName}${a._yt ? " (2. Zernio-Konto)" : ""}`).join(", ") || "keine");
if (args.includes("--konten")) {
  for (const a of alleKonten) console.log(`  ${a._yt ? "2. Zernio-Konto" : "Hauptkonto   "} | ${a.platform} | ${a.username || "-"} | ${a.displayName || "-"} | aktiv: ${a.isActive !== false}`);
  process.exit(0);
}

// --analyse: Auswertung für Claude (Jonathans Wunsch 1.11.: vor jeder Staffel schauen, was gut ankam).
// Holt die Post-Analytics aller Posts der letzten 60 Tage (GET /analytics, seitenweise), Konto-Insights je Plattform
// und die besten Posting-Zeiten. Schreibt posten/analyse.json (nur Zahlen und kurze Texte, keine Zugangsdaten).
if (args.includes("--analyse")) {
  const zahlen = (o, tiefe = 0, pre = "") => {
    const out = {};
    if (!o || typeof o !== "object" || tiefe > 3) return out;
    for (const [k, v] of Object.entries(o)) {
      if (/token|secret|password|cookie|auth/i.test(k)) continue;
      if (typeof v === "number") out[pre + k] = v;
      else if (typeof v === "string" && v.length <= 60 && /date|time|status|platform|type|username|name|updated/i.test(k)) out[pre + k] = v;
      else if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(out, zahlen(v, tiefe + 1, pre + k + "."));
      else if (Array.isArray(v) && v.length && typeof v[0] === "object" && tiefe < 2) v.slice(0, 5).forEach((e, n) => Object.assign(out, zahlen(e, tiefe + 1, `${pre}${k}[${n}].`)));
    }
    return out;
  };
  const tag = d => d.toISOString().slice(0, 10);
  const jetzt = new Date(), von = new Date(jetzt - 60 * 864e5), von30 = new Date(jetzt - 30 * 864e5);
  const warte = () => new Promise(res => setTimeout(res, 400));
  const ergebnis = { erstellt: jetzt.toISOString(), konten: [], posts: [], best_time: {}, fehler: [] };
  const zuPlan = {}; // Zernio-Post-ID -> Plan-Eintrag
  for (const post of plan.posts) { const st = status[post.id]; if (st?.zernioId) zuPlan[st.zernioId] = post; }
  // Konten: Follower aus /accounts, dazu die Insights der Plattform
  const insights = { tiktok: "/analytics/tiktok/account-insights", instagram: "/analytics/instagram/account-insights", youtube: "/analytics/youtube/channel-insights" };
  for (const acc of liste) {
    const key = acc._yt ? KEY_YT : KEY;
    const e = { platform: acc.platform, username: acc.username || acc.displayName, follower: acc.followersCount ?? null, konto: zahlen(acc) };
    if (insights[acc.platform]) {
      const r = await api("GET", `${insights[acc.platform]}?accountId=${acc._id}&fromDate=${tag(von30)}&toDate=${tag(jetzt)}`, null, key);
      if (r.ok) e.insights_30_tage = zahlen(r.json); else { e.insights_fehler = `HTTP ${r.status} ${JSON.stringify(r.json).slice(0, 240)}`; ergebnis.fehler.push(`${acc.platform}: Insights HTTP ${r.status}`); }
      await warte();
    }
    ergebnis.konten.push(e);
    console.log(`Konto ${acc.platform}:${e.username} Follower=${e.follower} Insights ${e.insights_fehler || "ok"}`);
  }
  // Posts: alle der letzten 60 Tage, je Zernio-Konto (YouTube hat einen eigenen Schlüssel)
  const gesehen = new Set();
  for (const [name, key] of [["haupt", KEY], ["yt", KEY_YT]]) {
    if (!key) continue;
    for (let page = 1; page <= 20; page++) {
      const r = await api("GET", `/analytics?source=all&fromDate=${tag(von)}&toDate=${tag(jetzt)}&limit=100&page=${page}`, null, key);
      if (!r.ok) { ergebnis.fehler.push(`Posts (${name}) Seite ${page}: HTTP ${r.status} ${JSON.stringify(r.json).slice(0, 240)}`); console.log(`Posts (${name}): HTTP ${r.status} ${JSON.stringify(r.json).slice(0, 300)}`); break; }
      const liste2 = r.json.posts || r.json.data || [];
      if (page === 1 && r.json.overview) ergebnis[`ueberblick_${name}`] = zahlen(r.json.overview);
      for (const p of liste2) {
        const zid = p.latePostId || p.postId;
        if (gesehen.has(zid + (p.platform || ""))) continue;
        gesehen.add(zid + (p.platform || ""));
        const pl = zuPlan[p.latePostId] || zuPlan[p.postId];
        ergebnis.posts.push({
          id: pl?.id || null, platform: p.platform || pl?.platform, serie: pl?.serie || (pl ? "24-stock" : "extern"),
          zeit: pl?.zeit || (p.publishedAt || p.scheduledFor || "").slice(0, 19), video: pl ? (pl.video.split("/youtube-upload/")[1] || pl.video) : null,
          text: (p.content || "").split("\n")[0].slice(0, 80), url: p.platformPostUrl || null, typ: p.mediaProductType || p.mediaType || null,
          sync: p.syncStatus || null, analytics: zahlen(p.analytics || {}),
        });
      }
      console.log(`Posts (${name}) Seite ${page}: ${liste2.length}`);
      await warte();
      if (liste2.length < 100) break;
    }
  }
  for (const plat of ["tiktok", "instagram", "youtube"]) {
    const r = await api("GET", `/analytics/best-time?platform=${plat}`, null, plat === "youtube" && KEY_YT ? KEY_YT : KEY);
    if (r.ok) ergebnis.best_time[plat] = r.json; else ergebnis.fehler.push(`best-time ${plat}: HTTP ${r.status}`);
    await warte();
  }
  fs.writeFileSync(path.join(DIR, "analyse.json"), JSON.stringify(ergebnis, null, 1) + "\n");
  const mitZahlen = ergebnis.posts.filter(p => Object.keys(p.analytics).length).length;
  console.log(`Fertig: ${ergebnis.konten.length} Konten, ${ergebnis.posts.length} Posts (${mitZahlen} mit Zahlen), ${ergebnis.fehler.length} Fehler → posten/analyse.json`);
  for (const f of ergebnis.fehler.slice(0, 10)) console.log("  Fehler: " + f);
  process.exit(0);
}

// --abgleich [--echt]: geplante Posts bei Zernio mit plan.json abgleichen (Zernio ist die Wahrheit).
// Doppelte oder falsch terminierte Posts werden gelöscht (nur mit --echt), status.json wird neu aufgebaut.
if (args.includes("--abgleich")) {
  const echt = args.includes("--echt");
  const plat = Object.fromEntries(plan.posts.map(p => [p.id, p]));
  const seen = {};
  for (const [name, key] of [["haupt", KEY], ["yt", KEY_YT]]) {
    if (!key) continue;
    let page = 1, alle = [];
    while (true) {
      const r = await api("GET", `/posts?status=scheduled&limit=100&page=${page}`, null, key);
      if (!r.ok) { console.log(`Liste ${name}: HTTP ${r.status} ${JSON.stringify(r.json).slice(0, 300)}`); break; }
      const posts = r.json.posts || r.json.data || [];
      alle = alle.concat(posts);
      if (posts.length < 100) break; page++;
    }
    console.log(`Konto ${name}: ${alle.length} geplante Posts bei Zernio`);
    for (const z of alle) {
      const pid = z.metadata?.postId;
      const zeit = String(z.scheduledFor || "");
      const soll = plat[pid];
      const berlin = zeit ? new Date(zeit).toLocaleString("sv-SE", { timeZone: "Europe/Berlin" }).replace(" ", "T").slice(0, 16) : "";
      const passt = soll && soll.zeit.slice(0, 16) === berlin && !seen[pid];
      if (passt) { seen[pid] = true; status[pid] = { ok: true, zeit: soll.zeit, zernioId: z._id, am: new Date().toISOString() }; console.log(`= ${pid} ${berlin}`); }
      else {
        console.log(`${echt ? "🗑" : "(würde löschen)"} ${pid || "?"} ${berlin} ${soll ? (seen[pid] ? "doppelt" : "falsche Zeit, soll " + soll.zeit) : "nicht im Plan"}`);
        if (echt) await api("DELETE", `/posts/${z._id}`, null, key);
      }
    }
  }
  if (echt) {
    // Einträge ohne gültigen geplanten Post bei Zernio: veröffentlichte behalten, Rest neu einplanen lassen
    for (const p of plan.posts) if (!seen[p.id] && status[p.id] && !status[p.id].ergebnis?.status?.startsWith("pub")) {
      const bald = new Date(Date.now() + 10 * 60000).toLocaleString("sv-SE", { timeZone: "Europe/Berlin" }).replace(" ", "T").slice(0, 16);
      if (p.zeit.slice(0, 16) > bald) delete status[p.id];
    }
    speichern();
  }
  process.exit(0);
}

// --status: bei Zernio nachfragen, was aus den fälligen Posts geworden ist
if (args.includes("--status")) {
  const jetzt = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") + "T" + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  for (const post of plan.posts) {
    const st = status[post.id];
    if (!st?.zernioId || post.zeit.slice(0, 16) > iso(jetzt)) continue;
    const r = await api("GET", `/posts/${st.zernioId}`, null, keyVon(post, st));
    const p = r.json?.post || r.json || {};
    const pl = (p.platforms || [])[0] || {};
    const info = { status: p.status, plattform: pl.status, url: pl.platformPostUrl || pl.url || pl.publishedUrl, fehler: pl.errorMessage || pl.error || p.error };
    st.ergebnis = info; speichern();
    console.log(`${post.id} (${post.zeit}): ${JSON.stringify(info)}${r.ok ? "" : " HTTP " + r.status + " " + JSON.stringify(r.json).slice(0, 300)}`);
  }
  process.exit(0);
}
// Konto für einen Post. Mit post.konto (Benutzername) genau dieses Konto. Ohne Angabe die bisherigen Standardkonten:
// TikTok/Instagram aus dem Hauptkonto, YouTube aus dem 2. Zernio-Konto. So landet nie ein deutsches Video zufällig
// auf dem englischen Account (der liegt im 2. Zernio-Konto, Jonathan 3.11.).
const konto = post => post.konto
  ? liste.find(a => a.platform === post.platform && [a.username, a.displayName].includes(post.konto))
  : liste.find(a => a.platform === post.platform && a._yt === (post.platform === "youtube" && !!KEY_YT));

// Geplante Posts zurückziehen: Einträge in plan.loeschen (IDs aus status.json)
for (const pid of plan.loeschen || []) {
  const st = status[pid];
  if (!st?.zernioId || st.geloescht) continue;
  const pp = plan.posts.find(x => x.id === pid);
  const r = await api("DELETE", `/posts/${st.zernioId}`, null, keyVon(pp, st));
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
  // Uhrzeit geändert und noch nicht veröffentlicht? Alten Termin bei Zernio löschen und neu einplanen.
  { const st = status[post.id];
    const bald = new Date(Date.now() + 10 * 60000).toLocaleString("sv-SE", { timeZone: "Europe/Berlin" }).replace(" ", "T").slice(0, 16);
    const neueFassung = post.fassung && (st?.fassung || 1) !== post.fassung; // Video neu gerendert → neu einplanen
    if (st?.ok && st.zernioId && (st.zeit !== post.zeit || neueFassung) && st.zeit.slice(0, 16) > bald) {
      const d = await api("DELETE", `/posts/${st.zernioId}`, null, keyVon(post, st));
      console.log(d.ok ? `↻ ${post.id}: ${st.zeit} → ${post.zeit}${neueFassung ? " (neue Fassung " + post.fassung + ")" : ""}` : `✗ ${post.id}: alter Termin nicht löschbar (HTTP ${d.status})`);
      if (d.ok) delete status[post.id]; else { fehler++; continue; }
      speichern();
    } }
  if (status[post.id]?.ok || status[post.id]?.geloescht || (plan.loeschen || []).includes(post.id)) continue;
  // Nie verspätet nachposten: Zeitpunkt muss mindestens 10 Minuten in der Zukunft liegen
  { const j = new Date(Date.now() + 10 * 60000).toLocaleString("sv-SE", { timeZone: "Europe/Berlin" }).replace(" ", "T").slice(0, 16);
    if (post.zeit.slice(0, 16) < j) { console.log(`– ${post.id}: Zeit ${post.zeit} ist vorbei, übersprungen`); continue; } }
  const acc = konto(post);
  if (!acc) { console.log(`✗ ${post.id}: kein ${post.platform}-Konto ${post.konto || ""} verbunden`); fehler++; continue; }
  const problem = await pruefe(post.video);
  if (problem) {
    console.log(`✗ ${post.id}: NICHT eingeplant – ${problem}`);
    status[post.id] = { ok: false, zeit: post.zeit, pruefung: problem, am: new Date().toISOString() }; speichern();
    fehler++; continue;
  }
  console.log(`  ${post.id}: Prüfung ok (Bild, Ton, Lautstärke)`);

  const platformSpecificData = post.platform === "tiktok"
    ? { privacyLevel: "PUBLIC_TO_EVERYONE", allowComment: true, allowDuet: true, allowStitch: true,
        commercialContentType: "none", videoMadeWithAi: false /* KI-Haken aus: Jonathans Vorgabe 2.11., Issue #15 */, contentPreviewConfirmed: true, expressConsentGiven: true }
    : post.platform === "youtube"
    ? { title: post.titel, visibility: "public", madeForKids: false, categoryId: "24" }
    : (plan.instagram || {});
  const body = {
    content: post.text,
    mediaItems: [{ type: "video", url: post.video }],
    platforms: [{ platform: post.platform, accountId: acc._id, ...(Object.keys(platformSpecificData).length ? { platformSpecificData } : {}) }],
    scheduledFor: post.zeit,
    timezone: "Europe/Berlin",
    metadata: { serie: post.serie || "24-stock", postId: post.id },
  };
  // KI-Haken aus (Issue #15): Laut Zernio-Doku (docs.zernio.com/platforms/tiktok/posts) muss TikTok die Einstellungen
  // als `tiktokSettings` auf oberster Ebene bekommen. platformSpecificData allein reichte nicht (Jonathan 3.11.).
  if (post.platform === "tiktok") body.tiktokSettings = { ...platformSpecificData, videoMadeWithAi: false };
  if (post.platform === "youtube") body.tags = post.tags || ["zombie", "animation", "story", "24 stock", "shorts"];
  const r = await api("POST", "/posts", body, acc._yt ? KEY_YT : KEY);
  const id = r.json?.post?._id || r.json?._id || r.json?.id || null;
  status[post.id] = { ok: r.ok, zeit: post.zeit, fassung: post.fassung, zernioId: id, yt: acc._yt, konto: acc.username || acc.displayName, http: r.status, antwort: r.ok ? undefined : JSON.stringify(r.json).slice(0, 600), am: new Date().toISOString() };
  speichern();
  if (r.ok) { neu++; console.log(`✓ ${post.id} eingeplant für ${post.zeit} (${id})`);
    if (post.platform === "tiktok") { const w = JSON.stringify(r.json?.warnings || r.json?.post?.warnings || ""); const ki = JSON.stringify(r.json).match(/"(videoMadeWithAi|video_made_with_ai|isAigc)":\s*(true|false)/g);
      console.log(`  KI-Kennzeichnung laut Zernio: ${ki ? ki.join(", ") : "nicht in der Antwort"}${w && w !== '""' ? " | Hinweise: " + w.slice(0, 300) : ""}`); } }
  else { fehler++; console.log(`✗ ${post.id}: HTTP ${r.status} ${JSON.stringify(r.json).slice(0, 400)}`); }
  await new Promise(res => setTimeout(res, 1500));
}
console.log(`Fertig: ${neu} neu eingeplant, ${fehler} Fehler.`);
process.exit(fehler && !neu ? 1 : 0);
