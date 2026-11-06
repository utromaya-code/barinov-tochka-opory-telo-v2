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
  assert.ok(html.includes('22 ноября'));
  assert.doesNotMatch(html, /по действующей версии сайта|уточните при обращении/);
});
test('form opens Telegram with a ready message and has a direct fallback', () => {
  assert.match(html, /<form id="lead-form" novalidate>/);
  assert.match(html, /href="https:\/\/t\.me\/vsemaya"/);
  assert.match(html, /class="mobile-cta"/);
  assert.doesNotMatch(html, /заявка успешно отправлена/i);
  const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.match(js, /t\.me\/vsemaya\?text=/);
});


test('Ilya-approved wording stays intact across redesigns', () => {
  for (const phrase of [
    'Уверенность в движении — уверенность в жизни.',
    'не обязательно самое гибкое.',
    'качеству движения, а не к достижению условного результата.',
    'Свобода движения и дыхания:',
    'Чувство лёгкости:',
    'Подвижность и сила:',
    'Улучшение функциональности:',
    'Создание гармоничного состояния:'
  ]) {
    assert.ok(html.includes(phrase), `Missing approved wording: ${phrase}`);
  }
  const practices = [
    ['Грудная клетка', 'Свобода движения и дыхания'],
    ['Шея', 'Чувство лёгкости'],
    ['Тазобедренные и ноги', 'Подвижность и сила'],
    ['Плечи и руки', 'Улучшение функциональности'],
    ['Всё тело', 'Создание гармоничного состояния']
  ];
  for (const [part, title] of practices) {
    assert.ok(html.includes(`<h3>${part}</h3><p>${title}:`), `Incorrect practice wording: ${part}`);
  }
});
test('recordings of live meetings are not silently promised', () => {
  assert.ok(html.includes('Возможность просмотра записей трёх живых лабораторий'));
  assert.ok(html.includes('уточните у организаторов перед оплатой'));
  assert.ok(html.includes('Чат поддержки с ответами на вопросы'));
  assert.ok(html.includes('шавасана'));
  assert.ok(html.includes('гимнастика для глаз'));
});
