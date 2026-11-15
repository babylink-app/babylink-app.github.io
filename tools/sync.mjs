// Copies the shared parts of index.html (head links, header, footer) into the other pages,
// so a change to the header or the footer is made once, in index.html.
// Usage, in the site folder: node tools/sync.mjs
// The parts are marked in index.html with <!-- shared:NAME --> ... <!-- /shared:NAME -->.
// The German pages (de/) take theirs from de/index.html the same way. The language link in the
// header (<a class="lang" ...>) leads to the same page in the other language.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = ['support.html', 'privacy.html', 'terms.html', 'impressum.html'];
// Pages that also exist in German, in de/ (the Impressum is one page in both languages).
const DE_PAGES = ['support.html', 'privacy.html', 'terms.html'];
const LANG_LINK = /<a class="lang" href="[^"]*"/;
const PARTS = ['head', 'header', 'footer'];

// Without markers yet (first run): what each part replaces.
const FIRST_TIME = {
  head: /<meta name="theme-color"[\s\S]*?<link rel="stylesheet" href="style.css">/,
  header: /<header class="wrap site-header">[\s\S]*?<\/header>/,
  footer: /<footer class="site-footer">[\s\S]*?<\/footer>/,
};

export function block(html, name) {
  const re = new RegExp(`<!-- shared:${name}[^>]*-->[\\s\\S]*?<!-- /shared:${name} -->`);
  const found = html.match(re);
  if (!found) throw new Error(`index.html has no shared:${name} block`);
  return found[0];
}

export function fill(html, name, part, page, lang = 'en') {
  let text = part;
  if (name === 'header' && page === 'support.html') {
    text = text.replace('<a href="support.html">', '<a href="support.html" aria-current="page">');
  }
  if (name === 'header') {
    const other =
      lang === 'de' ? `../${page}` : DE_PAGES.includes(page) ? `de/${page}` : 'de/index.html';
    text = text.replace(LANG_LINK, `<a class="lang" href="${other}"`);
  }
  const marked = new RegExp(`<!-- shared:${name}[^>]*-->[\\s\\S]*?<!-- /shared:${name} -->`);
  if (marked.test(html)) return html.replace(marked, () => text);
  if (FIRST_TIME[name].test(html)) return html.replace(FIRST_TIME[name], () => text);
  throw new Error(`${page}: no place for the ${name}`);
}

export function syncPage(index, html, page, lang = 'en') {
  return PARTS.reduce((out, name) => fill(out, name, block(index, name), page, lang), html);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const index = readFileSync(join(site, 'index.html'), 'utf8');
  for (const page of PAGES) {
    const path = join(site, page);
    writeFileSync(path, syncPage(index, readFileSync(path, 'utf8'), page));
    console.log(`${page}: header and footer updated`);
  }
  const indexDe = readFileSync(join(site, 'de', 'index.html'), 'utf8');
  for (const page of DE_PAGES) {
    const path = join(site, 'de', page);
    writeFileSync(path, syncPage(indexDe, readFileSync(path, 'utf8'), page, 'de'));
    console.log(`de/${page}: header and footer updated`);
  }
}
