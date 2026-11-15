// Copies the shared parts of index.html (head links, header, footer) into the other pages,
// so a change to the header or the footer is made once, in index.html.
// Usage, in the site folder: node tools/sync.mjs
// The parts are marked in index.html with <!-- shared:NAME --> ... <!-- /shared:NAME -->.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = ['support.html', 'privacy.html', 'terms.html', 'impressum.html'];
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

export function fill(html, name, part, page) {
  let text = part;
  if (name === 'header' && page === 'support.html') {
    text = text.replace('<a href="support.html">', '<a href="support.html" aria-current="page">');
  }
  const marked = new RegExp(`<!-- shared:${name}[^>]*-->[\\s\\S]*?<!-- /shared:${name} -->`);
  if (marked.test(html)) return html.replace(marked, () => text);
  if (FIRST_TIME[name].test(html)) return html.replace(FIRST_TIME[name], () => text);
  throw new Error(`${page}: no place for the ${name}`);
}

export function syncPage(index, html, page) {
  return PARTS.reduce((out, name) => fill(out, name, block(index, name), page), html);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const index = readFileSync(join(site, 'index.html'), 'utf8');
  for (const page of PAGES) {
    const path = join(site, page);
    writeFileSync(path, syncPage(index, readFileSync(path, 'utf8'), page));
    console.log(`${page}: header and footer updated`);
  }
}
