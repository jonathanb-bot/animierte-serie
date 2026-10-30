#!/usr/bin/env node
// Schätzt die Laufzeit einer Storyline von „Der letzte Mann“ (ohne Stimme, gleiche Formel wie render.mjs)
// und prüft die festen Grenzen der Serie. Geschnitten wird immer nach Kapitel 2:
//   Teil 1 = Kapitel 1 + Titelkarte + Was bisher geschah + Kapitel 2
//   Teil 2 = Kapitel 3 + Kapitel 4 + Fortsetzung folgt + Check
// node der-letzte-mann/dauer.mjs der-letzte-mann/storylines/folge-01.md
import fs from "node:fs";

const datei = process.argv.slice(2).find(a => a.endsWith(".md"));
if (!datei) { console.error("Bitte Storyline angeben, z.B. der-letzte-mann/storylines/folge-01.md"); process.exit(1); }

// feste Längen (s)
const TITELKARTE = 1.0, FORTSETZUNG = 1.0;
// Grenzen aus der Serienbibel
const GRENZEN = { kapitel: [20, 22], rueckblick: [12, 15], check: 14, teil: 60, folge: 119, einstellungen: [4, 6], woerter: 20 };

// wie render.mjs: Sprechdauer nach Wortlänge und Satzzeichen, mindestens 2 s pro Einstellung
const woerter = text => text.replace(/[„“"»«]/g, "").split(/\s+/).filter(Boolean);
const einstellung = text => {
  const fest = text.match(/^\(ohne Text, ([\d,]+) s\)$/);
  if (fest) return Number(fest[1].replace(",", "."));
  const roh = woerter(text);
  const sprech = roh.reduce((a, w) => a + 0.2 + w.replace(/\*/g, "").length * 0.035 + (/[.!?…]$/.test(w) ? 0.25 : /[,:;]$/.test(w) ? 0.12 : 0), 0);
  return roh.length ? Math.max(2.0, sprech + 0.55) : 3;
};

const abschnitte = []; let aktuell = null; const warnungen = [];
for (const zeile of fs.readFileSync(datei, "utf8").split(/\r?\n/)) {
  const k = zeile.match(/^KAPITEL (\d+):\s*([^|]*)/);
  if (k) { aktuell = { art: "kapitel", nr: Number(k[1]), name: `Kapitel ${k[1]}: ${k[2].trim()}`, d: [] }; abschnitte.push(aktuell); continue; }
  if (/^WAS BISHER GESCHAH:/.test(zeile)) { aktuell = { art: "rueckblick", name: "Was bisher geschah", d: [] }; abschnitte.push(aktuell); continue; }
  if (/^TITELKARTE:/.test(zeile)) { abschnitte.push({ art: "fest", name: "Titelkarte", d: [TITELKARTE] }); aktuell = null; continue; }
  if (/^FORTSETZUNG FOLGT/.test(zeile)) { abschnitte.push({ art: "fest", name: "Fortsetzung folgt", d: [FORTSETZUNG] }); aktuell = null; continue; }
  const c = zeile.match(/^CHECK:\s*Frage:\s*(.*?)\s*\/\s*Antwort:\s*(.*)$/);
  if (c) {
    aktuell = { art: "check", name: "Check", d: [einstellung("Frage: " + c[1]), einstellung("Antwort: " + c[2])] };
    abschnitte.push(aktuell); continue;
  }
  if (aktuell?.art === "check" && /^„?Was hättest du gemacht\?/.test(zeile.trim())) { aktuell.d.push(einstellung(zeile.trim())); aktuell = null; continue; }
  if (/^(CLIFFHANGER|FAKTEN-CHECK|NEU ZU BAUEN|SCHNITT|Laufzeit|DAUER)/.test(zeile)) { aktuell = null; continue; }
  const e = zeile.match(/^\s*[*-]\s+(.*)$/);
  if (e && aktuell && aktuell.art !== "check") {
    const i = e[1].lastIndexOf(" – ");
    const text = aktuell.art === "rueckblick" && i < 0 ? e[1] : i < 0 ? "" : e[1].slice(i + 3);
    if (woerter(text).length > GRENZEN.woerter) warnungen.push(`${aktuell.name}: Einstellung mit ${woerter(text).length} Wörtern (max. ca. ${GRENZEN.woerter})`);
    aktuell.d.push(einstellung(text));
  }
}

const summe = a => a.d.reduce((x, y) => x + y, 0);
const kapitel = n => abschnitte.find(a => a.art === "kapitel" && a.nr === n);
const nach = (a, liste) => liste.includes(a);
const teil1Arten = abschnitte.filter(a => (a.art === "kapitel" && a.nr <= 2) || a.name === "Titelkarte" || a.art === "rueckblick");
const teil2Arten = abschnitte.filter(a => !nach(a, teil1Arten));
const t1 = teil1Arten.reduce((x, a) => x + summe(a), 0), t2 = teil2Arten.reduce((x, a) => x + summe(a), 0);

// Grenzen prüfen
for (const a of abschnitte) {
  const d = summe(a);
  if (a.art === "kapitel") {
    if (d < GRENZEN.kapitel[0] - 0.5 || d > GRENZEN.kapitel[1] + 0.5) warnungen.push(`${a.name}: ${d.toFixed(1)} s (Ziel ${GRENZEN.kapitel.join("–")} s)`);
    if (a.d.length < GRENZEN.einstellungen[0] || a.d.length > GRENZEN.einstellungen[1]) warnungen.push(`${a.name}: ${a.d.length} Einstellungen (Ziel ${GRENZEN.einstellungen.join("–")})`);
  }
  if (a.art === "rueckblick" && (d < GRENZEN.rueckblick[0] || d > GRENZEN.rueckblick[1])) warnungen.push(`Was bisher geschah: ${d.toFixed(1)} s (Ziel ${GRENZEN.rueckblick.join("–")} s)`);
  if (a.art === "check" && d > GRENZEN.check) warnungen.push(`Check: ${d.toFixed(1)} s (max. ${GRENZEN.check} s)`);
}
if ([1, 2, 3, 4].some(n => !kapitel(n))) warnungen.push("Es fehlen Kapitel (erwartet: 1–4).");
if (t1 > GRENZEN.teil) warnungen.push(`Teil 1: ${t1.toFixed(1)} s (max. ${GRENZEN.teil} s)`);
if (t2 > GRENZEN.teil) warnungen.push(`Teil 2: ${t2.toFixed(1)} s (max. ${GRENZEN.teil} s)`);
if (t1 + t2 > GRENZEN.folge) warnungen.push(`Folge: ${(t1 + t2).toFixed(1)} s (max. ${GRENZEN.folge} s)`);

const zeile = a => `| ${a.name} | ${a.art === "fest" ? "–" : a.d.length} | ${summe(a).toFixed(1)} s |`;
console.log("| Abschnitt | Einstellungen | Dauer |\n|---|---|---|");
teil1Arten.forEach(a => console.log(zeile(a)));
console.log(`| **Teil 1** | | **${t1.toFixed(1)} s** |`);
teil2Arten.forEach(a => console.log(zeile(a)));
console.log(`| **Teil 2** | | **${t2.toFixed(1)} s** |`);
console.log(`| **Gesamte Folge** | | **${(t1 + t2).toFixed(1)} s** |`);
if (warnungen.length) { console.log("\nHinweise:"); warnungen.forEach(w => console.log("- " + w)); process.exitCode = 1; }

// Mit Stimme: echte Längen aus audio/folge-XX/timing.json (geschrieben von python -m ton.folge)
const id = datei.match(/folge-\d+/)?.[0], serie = new URL(".", import.meta.url).pathname;
const drehbuch = `${serie}episoden/${id}.txt`, timing = `${serie}audio/${id}/timing.json`;
if (id && fs.existsSync(drehbuch) && fs.existsSync(timing)) {
  const namen = fs.readFileSync(drehbuch, "utf8").split(/\r?\n/).filter(z => /^==/.test(z)).map(z => z.replace(/=/g, "").trim());
  const t = JSON.parse(fs.readFileSync(timing, "utf8")), je = namen.map(() => 0);
  for (const e of t.einstellungen) je[e.kapitel - 1] += e.dauer;
  const grenze = namen.findIndex(n => /^Kapitel 2\b/.test(n)) + 1;
  const g1 = je.slice(0, grenze).reduce((a, b) => a + b, 0), g2 = je.slice(grenze).reduce((a, b) => a + b, 0);
  console.log("\nGemessen mit Stimme (Titelkarte bei Kapitel 1, „Fortsetzung folgt“ bei Kapitel 4):\n\n| Abschnitt | Dauer |\n|---|---|");
  namen.forEach((n, i) => { console.log(`| ${n} | ${je[i].toFixed(1)} s |`); if (i + 1 === grenze) console.log(`| **Teil 1** | **${g1.toFixed(1)} s** |`); });
  console.log(`| **Teil 2** | **${g2.toFixed(1)} s** |\n| **Gesamte Folge** | **${(g1 + g2).toFixed(1)} s** |`);
  if (g1 > GRENZEN.teil || g2 > GRENZEN.teil || g1 + g2 > GRENZEN.folge) { console.log("\nACHTUNG: Grenze mit Stimme überschritten."); process.exitCode = 1; }
}
