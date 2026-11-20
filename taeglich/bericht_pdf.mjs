// Bericht (Markdown) als PDF: node taeglich/bericht_pdf.mjs <bericht.md> [ausgabe.pdf]
// pandoc macht HTML (Tabellen, Überschriften), Chromium (Playwright) druckt A4.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // global installiert (require geht, import nicht)

const ein = process.argv[2];
if (!ein) { console.error('Aufruf: node taeglich/bericht_pdf.mjs <bericht.md> [ausgabe.pdf]'); process.exit(1); }
const aus = process.argv[3] || ein.replace(/\.md$/, '.pdf');
const titel = (readFileSync(ein, 'utf8').match(/^#\s+(.+)$/m) || [, basename(ein)])[1];

const css = `
@page { size: A4; margin: 16mm 14mm 18mm; }
body { font-family: "DejaVu Sans", Arial, sans-serif; font-size: 10pt; line-height: 1.45; color: #1d2330; }
h1 { font-size: 20pt; color: #2b3a8c; border-bottom: 3px solid #2b3a8c; padding-bottom: 4px; margin-top: 0; }
h2 { font-size: 14pt; color: #2b3a8c; margin-top: 18px; border-bottom: 1px solid #c9cfe6; padding-bottom: 2px; page-break-after: avoid; }
h3 { font-size: 11.5pt; color: #3d4a73; margin-top: 12px; page-break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 8.5pt; page-break-inside: auto; }
tr { page-break-inside: avoid; }
th { background: #2b3a8c; color: #fff; text-align: left; padding: 4px 5px; }
td { border-bottom: 1px solid #dde1ef; padding: 3px 5px; vertical-align: top; }
tr:nth-child(even) td { background: #f4f6fc; }
code { font-size: 8.5pt; background: #eef0f7; padding: 0 3px; border-radius: 3px; }
blockquote { border-left: 4px solid #f0a020; margin: 8px 0; padding: 4px 10px; background: #fff7e8; }
a { color: #2b3a8c; }
`;
const html = execFileSync('pandoc', [ein, '-f', 'gfm', '-t', 'html5', '-s',
  '--metadata', `pagetitle=${titel}`], { encoding: 'utf8' })
  .replace('</head>', `<style>${css}</style></head>`);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.pdf({ path: aus, format: 'A4', printBackground: true, displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: `<div style="font-size:7pt;width:100%;text-align:center;color:#888">${titel.replace(/</g,'&lt;')} · Seite <span class="pageNumber"></span>/<span class="totalPages"></span></div>`,
  margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' } });
await browser.close();
console.log('PDF:', aus);
