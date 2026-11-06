const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
test('all local asset links exist', () => {
  const refs = [...html.matchAll(/(?:src|href)="(assets\/[^"?#]+|styles\.css|app\.js|config\.js)"/g)].map(m => m[1]);
  assert.ok(refs.length >= 8);
  for (const ref of refs) assert.ok(fs.existsSync(path.join(root, ref)), ref);
});
test('all on-page anchors resolve to an id', () => {
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.match(html, new RegExp(`id="${id}"`));
});
test('current tariff prices and FAQ content are present', () => {
  for (const price of ['24 900', '29 900', '49 900']) assert.ok(html.includes(price));
  assert.ok((html.match(/<details>/g) || []).length >= 5);
  assert.ok(html.includes('Даты ближайшего потока'));
});
test('unconfigured form is hidden and there is an honest fallback', () => {
  assert.match(html, /<form id="lead-form" method="post" hidden>/);
  assert.match(html, /Написать в Telegram/);
  assert.match(html, /id="selected-tariff"/);
  assert.doesNotMatch(html, /заявка успешно отправлена/i);
});
