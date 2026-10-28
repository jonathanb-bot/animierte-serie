// Liest ein Drehbuch im einfachen Textformat (siehe README) und macht daraus Szenen-Objekte.
const AUSDRUECKE = ["neutral", "froh", "traurig", "schreck", "angst", "wuetend", "muede", "entschlossen", "besorgt", "misstrauisch", "zombie", "neugierig", "stur", "angewidert"];
const POSEN = ["steht", "winkt", "zeigt", "zeigt_links", "zeigt_hoch", "haende_hoch", "angst", "psst", "denkt", "huefte", "traegt", "taschenlampe", "lauscht", "geht", "rennt", "zombie", "zombie_geht", "sitzt", "duckt", "klettert", "haelt", "haelt_hoch", "verschraenkt", "umarmt", "springt", "zeigt_haende", "handy", "fuchtelt", "rutscht"];
const ZEITEN = ["tag", "morgen", "abend", "nacht", "rot"];
const KAMERAS = ["ruhig", "zoom-rein", "zoom-raus", "schwenk-hoch", "schwenk-runter", "schwenk-links", "schwenk-rechts", "nah", "weit", "fahrt"];
const PARTIKEL = ["staub", "asche", "schnee"];
const LISTEN = ["figuren", "figuren_dach", "orte", "laeden", "durchgestrichen"];
const STANDARD_KAMERAS = ["zoom-rein", "ruhig", "schwenk-links", "zoom-raus", "schwenk-rechts", "zoom-rein", "schwenk-hoch"];

const ETAGE_Y = n => 300 + (24 - n) * 300 + 150;

function tokenize(s) {
  const out = []; const re = /([\w\-äöüÄÖÜß]+)=("([^"]*)"|[^\s\]]+)|("[^"]*")|([^\s]+)/g; let m;
  while ((m = re.exec(s))) {
    if (m[1]) out.push([m[1], m[3] !== undefined ? m[3] : m[2]]);
    else out.push([null, (m[4] || m[5]).replace(/^"|"$/g, "")]);
  }
  return out;
}
const wert = v => (v === "true" ? true : v === "false" ? false : /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v);

function kameraFuer(s, preset, i) {
  const typ = s.typ;
  let fx = 540, fy = 960, z = 1;
  if (typ === "skyline") { fx = 540; fy = 760; z = 1.1; }
  if (typ === "hochhaus") { const e = s.etage ?? 24; fx = 540; fy = ETAGE_Y(e); z = 1.0; }
  if (typ === "wohnung" || typ === "treppenhaus" || typ === "bad") { fy = 1050; }
  if (typ === "strasse") { fy = 1150; }
  if (typ === "dach") { fy = 1050; }
  if (s.fokus) [fx, fy] = String(s.fokus).split(",").map(Number);
  if (s.zoom) z = Number(s.zoom);
  const P = {
    "ruhig": [{ zoom: z, x: fx, y: fy }, { zoom: z * 1.05 }],
    "zoom-rein": [{ zoom: z, x: fx, y: fy }, { zoom: z * 1.2 }],
    "zoom-raus": [{ zoom: z * 1.22, x: fx, y: fy }, { zoom: z }],
    "schwenk-hoch": [{ zoom: z * 1.15, x: fx, y: fy + 220 }, { y: fy - 220 }],
    "schwenk-runter": [{ zoom: z * 1.15, x: fx, y: fy - 220 }, { y: fy + 220 }],
    "schwenk-links": [{ zoom: z * 1.2, x: fx + 150, y: fy }, { x: fx - 150 }],
    "schwenk-rechts": [{ zoom: z * 1.2, x: fx - 150, y: fy }, { x: fx + 150 }],
    "nah": [{ zoom: z * 1.45, x: fx, y: fy }, { zoom: z * 1.55 }],
    "weit": [{ zoom: z, x: fx, y: fy }, { zoom: z * 1.03 }],
  };
  if (typ === "hochhaus" && s.bis_etage != null) return { von: { zoom: z, x: fx, y: fy }, bis: { y: ETAGE_Y(s.bis_etage), zoom: s.zoom_bis ?? z }, kurve: "sanft" };
  if (typ === "skyline" && preset === "fahrt") return { von: { zoom: 1.0, x: 540, y: 1100 }, bis: { zoom: 2.2, x: 540, y: 470 }, kurve: "sanft" };
  if (s.fokus_bis || s.zoom_bis) {
    const [bx, by] = s.fokus_bis ? String(s.fokus_bis).split(",").map(Number) : [fx, fy];
    return { von: { zoom: z, x: fx, y: fy }, bis: { zoom: Number(s.zoom_bis ?? z), x: bx, y: by }, kurve: "sanft" };
  }
  const name = preset || (typ === "titel" ? "ruhig" : typ === "objekt" ? "ruhig" : typ === "karte" ? "zoom-rein" : STANDARD_KAMERAS[i % STANDARD_KAMERAS.length]);
  const [von, bis] = P[name] || P["ruhig"];
  return { von, bis, kurve: name.startsWith("schwenk") ? "weich" : "sanft" };
}

export function parse(text, cast = {}) {
  const ep = { titel: "", figuren: { ...cast }, szenen: [], kapitel: [] };
  let hud = null, zeit = null, look = null, i = 0;
  for (const roh of text.split(/\r?\n/)) {
    const zeile = roh.trim();
    if (!zeile || zeile.startsWith("//")) continue;
    if (zeile.startsWith("# ")) { ep.titel = zeile.slice(2).trim(); continue; }
    if (zeile.startsWith("==")) { ep.kapitel.push({ name: zeile.replace(/=/g, "").trim(), ab: ep.szenen.length }); continue; }
    if (zeile.startsWith("@")) {
      const [cmd, ...rest] = zeile.slice(1).split(/\s+/);
      if (cmd === "musik") ep.musik = rest[0];
      else if (cmd === "serie") ep.serie = rest.join(" ");
      else if (cmd === "mund") ep.mund = rest[0];
      else if (cmd === "musik_lautstaerke") ep.musik_lautstaerke = Number(rest[0]);
      else if (cmd === "whoosh") ep.whoosh = rest[0] !== "aus";
      else if (cmd === "zeit") zeit = rest[0];
      else if (cmd === "look") look = Number(rest[0]); // Farblook für alle folgenden Einstellungen (0 = aus)
      else if (cmd === "hud") {
        if (rest[0] === "aus") { hud = null; continue; }
        const neu = { ...(hud || {}), balken: [...((hud && hud.balken) || [])] };
        for (const [k, v] of tokenize(rest.join(" "))) {
          if (k === "tag") neu.tag = v; else if (k === "zeit") neu.zeit = v; else if (k === "nacht") neu.nacht = v === "true";
          else if (k) {
            const label = k.replace(/_/g, " ");
            const idx = neu.balken.findIndex(b => b[0] === label);
            if (v === "aus") { if (idx >= 0) neu.balken.splice(idx, 1); continue; }
            const m = v.match(/^([\d.,]+)\/([\d.,]+)(.*)$/);
            if (!m && !/^[a-zäöüß_]+$/i.test(v)) throw new Error("HUD-Wert falsch: " + k + "=" + v);
            // Zahl/Maximum (z.B. 34/100%, 4/4, 36/100%+ für „lädt“) oder Text (z.B. nicht_verbunden)
            const b = m ? [label, Number(m[1].replace(",", ".")), Number(m[2].replace(",", ".")), m[3] || ""] : [label, null, null, v.replace(/_/g, " ")];
            if (idx >= 0) neu.balken[idx] = b; else neu.balken.push(b);
          }
        }
        hud = neu;
      }
      continue;
    }
    const m = zeile.match(/^\[([^\]]*)\]\s*(.*)$/);
    if (!m) { // Fortsetzungszeile -> an letzten Text anhängen
      if (ep.szenen.length) ep.szenen[ep.szenen.length - 1].text += " " + zeile;
      continue;
    }
    const toks = tokenize(m[1]);
    const s = { typ: toks[0][1], text: m[2].trim() };
    let preset = null;
    const posen = {}, ausdruecke = {}, figuren = [];
    for (const [k, v] of toks.slice(1)) {
      if (k) {
        if (LISTEN.includes(k)) s[k] = v.split(",").map(x => x.trim());
        else if (k === "objekte") s[k] = v.split("|").map(x => x.trim());
        else if (k === "horden") s[k] = v.split("|").flatMap(x => /[a-z]/i.test(x) ? x.split(",") : [x]).map(x => x.trim());
        else if (k === "kamera") preset = v;
        else if (k === "sagt") s.sprecher = v;
        else s[k] = wert(v);
        continue;
      }
      if (v.includes(":")) { const [n, x] = v.split(":"); if (POSEN.includes(x)) posen[n] = x; else ausdruecke[n] = x; if (!figuren.includes(n) && n in ep.figuren) figuren.push(n); continue; }
      if (v in ep.figuren || /^zombie\d+$/.test(v)) figuren.push(v);
      else if (AUSDRUECKE.includes(v)) s.ausdruck = v;
      else if (POSEN.includes(v)) s.pose = v;
      else if (ZEITEN.includes(v)) s.zeit = v;
      else if (KAMERAS.includes(v)) preset = v;
      else if (PARTIKEL.includes(v)) s.partikel = v;
      else if (v === "blende") s.uebergang = "blende";
      else s[v] = true;
    }
    if (figuren.length) { if (s.typ === "gesicht") s.figur = figuren[0]; else s.figuren = figuren; }
    if (Object.keys(posen).length) s.posen = posen;
    if (Object.keys(ausdruecke).length) s.ausdruecke = ausdruecke;
    if (!s.zeit && zeit) s.zeit = zeit;
    if (s.look === undefined && look != null) s.look = look;
    if (s.typ === "gesicht" && !s.ort) s.ort = "wohnung";
    // Wer spricht? Text in Anführungszeichen -> die (einzige/erste) Figur
    if (!s.sprecher && /[„“"»«]/.test(s.text)) s.sprecher = s.figur || (s.figuren || [])[0];
    if (s.wackeln === true) s.wackeln = 1;
    if (s.hud === false) s.hud = null; else if (hud && !["titel", "objekt", "karte"].includes(s.typ)) s.hud = { ...hud, nacht: (s.zeit || zeit) === "nacht" };
    s.kamera = kameraFuer(s, preset, i);
    ep.szenen.push(s); i++;
  }
  return ep;
}
