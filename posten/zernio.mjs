#!/usr/bin/env node
// Plant Posts bei Zernio ein (TikTok + Instagram), ohne Claude.
//   ZERNIO_API_KEY=... node posten/zernio.mjs            -> alle offenen Posts aus plan.json einplanen
//   ... node posten/zernio.mjs --nur tiktok-08,insta-01-1 -> nur diese
//   ... node posten/zernio.mjs --konten                   -> nur verbundene Konten anzeigen
// Was eingeplant wurde, steht danach in posten/status.json (wird nie doppelt gesendet).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const API = "https://zernio.com/api/v1";
const KEY = process.env.ZERNIO_API_KEY;
if (!KEY) { console.error("ZERNIO_API_KEY fehlt (GitHub-Secret)."); process.exit(1); }
const args = process.argv.slice(2);
const nur = (() => { const i = args.indexOf("--nur"); return i >= 0 ? args[i + 1].split(",").map(s => s.trim()) : null; })();

const plan = JSON.parse(fs.readFileSync(path.join(DIR, "plan.json"), "utf8"));
const statusDatei = path.join(DIR, "status.json");
const status = fs.existsSync(statusDatei) ? JSON.parse(fs.readFileSync(statusDatei, "utf8")) : {};
const speichern = () => fs.writeFileSync(statusDatei, JSON.stringify(status, null, 1) + "\n");

async function api(methode, pfad, body) {
  const r = await fetch(API + pfad, {
    method: methode,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 500) }; }
  return { ok: r.ok, status: r.status, json };
}

// Verbundene Konten holen
const konten = await api("GET", "/accounts");
if (!konten.ok) { console.error("Konten konnten nicht geladen werden:", konten.status, JSON.stringify(konten.json).slice(0, 400)); process.exit(1); }
const liste = (konten.json.accounts || []).filter(a => a.isActive !== false);
console.log("Verbundene Konten:", liste.map(a => `${a.platform}:${a.username || a.displayName}`).join(", ") || "keine");
if (args.includes("--konten")) process.exit(0);
const konto = p => liste.find(a => a.platform === p);

let neu = 0, fehler = 0;
for (const post of plan.posts) {
  if (nur && !nur.includes(post.id)) continue;
  if (status[post.id]?.ok) continue;
  const acc = konto(post.platform);
  if (!acc) { console.log(`✗ ${post.id}: kein ${post.platform}-Konto verbunden`); fehler++; continue; }

  const platformSpecificData = post.platform === "tiktok"
    ? { privacyLevel: "PUBLIC_TO_EVERYONE", allowComment: true, allowDuet: true, allowStitch: true,
        commercialContentType: "none", videoMadeWithAi: true, contentPreviewConfirmed: true, expressConsentGiven: true }
    : (plan.instagram || {});
  const body = {
    content: post.text,
    mediaItems: [{ type: "video", url: post.video }],
    platforms: [{ platform: post.platform, accountId: acc._id, ...(Object.keys(platformSpecificData).length ? { platformSpecificData } : {}) }],
    scheduledFor: post.zeit,
    timezone: "Europe/Berlin",
    metadata: { serie: "24-stock", postId: post.id },
  };
  const r = await api("POST", "/posts", body);
  const id = r.json?.post?._id || r.json?._id || r.json?.id || null;
  status[post.id] = { ok: r.ok, zeit: post.zeit, zernioId: id, http: r.status, antwort: r.ok ? undefined : JSON.stringify(r.json).slice(0, 600), am: new Date().toISOString() };
  speichern();
  if (r.ok) { neu++; console.log(`✓ ${post.id} eingeplant für ${post.zeit} (${id})`); }
  else { fehler++; console.log(`✗ ${post.id}: HTTP ${r.status} ${JSON.stringify(r.json).slice(0, 400)}`); }
  await new Promise(res => setTimeout(res, 1500));
}
console.log(`Fertig: ${neu} neu eingeplant, ${fehler} Fehler.`);
process.exit(fehler && !neu ? 1 : 0);
