#!/usr/bin/env node
// Schätzt die Dauer einer Storyline (ohne Stimme, gleiche Formel wie render.mjs) und teilt sie in Teile von max. 59 s.
// node der-alien/dauer.mjs der-alien/storylines/folge-01.md [--max 59]
import fs from "node:fs";

const args = process.argv.slice(2);
const datei = args.find(a => a.endsWith(".md"));
const MAX = args.includes("--max") ? Number(args[args.indexOf("--max") + 1]) : 59;
if (!datei) { console.error("Bitte Storyline angeben, z.B. der-alien/storylines/folge-01.md"); process.exit(1); }

// wie render.mjs: Sprechdauer nach Wortlänge und Satzzeichen, mindestens 2 s pro Einstellung
const einstellung = text => {
  const fest = text.match(/^\(ohne Text, ([\d,]+) s\)$/);
  if (fest) return Number(fest[1].replace(",", "."));
  const roh = text.replace(/[„“"»«]/g, "").split(/\s+/).filter(Boolean);
  const sprech = roh.reduce((a, w) => a + 0.2 + w.replace(/\*/g, "").length * 0.035 + (/[.!?…]$/.test(w) ? 0.25 : /[,:;]$/.test(w) ? 0.12 : 0), 0);
  return roh.length ? Math.max(2.0, sprech + 0.55) : 3;
};

const einheiten = []; let aktuell = null;
for (const zeile of fs.readFileSync(datei, "utf8").split(/\r?\n/)) {
  const k = zeile.match(/^KAPITEL (\d+):\s*([^|]*)/);
  if (k) { aktuell = { name: `Kapitel ${k[1]}: ${k[2].trim()}`, d: [] }; einheiten.push(aktuell); continue; }
  if (/^Was bisher geschah/.test(zeile)) { aktuell = { name: "Was bisher geschah", d: [], rueckblick: true }; einheiten.push(aktuell); continue; }
  if (/^(CLIFFHANGER|FAKTEN-CHECK|NEU ZU BAUEN|DAUER)/.test(zeile)) { aktuell = null; continue; }
  const c = zeile.match(/^CHECK:\s*Frage:\s*(.*?)\s*\/\s*Antwort:\s*(.*)$/);
  if (c) { einheiten.push({ name: "Check", d: [einstellung("Check! " + c[1]), einstellung(c[2]), 3.5] }); aktuell = null; continue; }
  const e = zeile.match(/^\s*[*-]\s+(.*)$/);
  if (e && aktuell) {
    const i = e[1].lastIndexOf(" – ");
    // Rückblick-Stichpunkte sind reiner Erzähltext
    aktuell.d.push(einstellung(aktuell.rueckblick || i < 0 ? e[1] : e[1].slice(i + 3)));
  }
}
// "Was bisher geschah" kommt nach Kapitel 1 (Kalter Einstieg + Titelkarte)
const r = einheiten.findIndex(u => u.rueckblick);
if (r > 1) einheiten.splice(1, 0, ...einheiten.splice(r, 1));

const len = einheiten.map(u => u.d.reduce((a, b) => a + b, 0));
const mmss = t => (t = Math.round(t), `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`);
console.log("| Abschnitt | Einstellungen | Dauer |\n|---|---|---|");
einheiten.forEach((u, i) => console.log(`| ${u.name} | ${u.d.length} | ${len[i].toFixed(1)} s |`));
const gesamt = len.reduce((a, b) => a + b, 0);
console.log(`| **Gesamt** | ${einheiten.reduce((a, u) => a + u.d.length, 0)} | **${mmss(gesamt)}** |\n`);

// so wenige Teile wie möglich, der längste so kurz wie möglich (wie render.mjs --teile)
const n = len.length, summe = (i, j) => len.slice(i, j).reduce((a, b) => a + b, 0);
for (let k = 1; k <= n; k++) {
  let f = Array(n + 1).fill(Infinity); f[0] = 0; const von = [];
  for (let t = 1; t <= k; t++) {
    const g = Array(n + 1).fill(Infinity), w = [];
    for (let j = 1; j <= n; j++) for (let i = 0; i < j; i++) { const d = summe(i, j); if (d <= MAX && Math.max(f[i], d) < g[j]) { g[j] = Math.max(f[i], d); w[j] = i; } }
    f = g; von.push(w);
  }
  if (f[n] === Infinity) continue;
  const teile = []; for (let j = n, t = k - 1; t >= 0; t--) { const i = von[t][j]; teile.unshift([i, j]); j = i; }
  console.log("| Teil | Inhalt | Dauer |\n|---|---|---|");
  teile.forEach(([i, j], x) => console.log(`| ${x + 1}/${k} | ${einheiten.slice(i, j).map(u => u.name.replace(/:.*/, "")).join(", ")} | ${summe(i, j).toFixed(1)} s |`));
  process.exit(0);
}
console.error(`Ein Abschnitt ist allein länger als ${MAX} s, bitte kürzen.`);
process.exit(1);
