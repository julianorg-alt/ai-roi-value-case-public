import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { compute } from '../src/roi.mjs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('files linked from the page exist in both languages', () => {
  for (const lang of ['fr', 'en']) {
    for (const p of [`template/value-case.${lang}.md`, `examples/bim-model-checking.${lang}.md`]) {
      assert.ok(existsSync(new URL(`../${p}`, import.meta.url)), p);
    }
  }
});

test('figures quoted in the filled example match the calculator', () => {
  const r = compute({
    users: 10, adoptionPct: 100, tasksPerUserMonth: 20, minutesBefore: 10, minutesAfter: 2,
    reworkSharePct: 0, reworkMinutes: 0, hourlyCost: 55, capturePct: 25,
    seatCostMonth: 0, aiCostPerTask: 0, runCostMonth: 0, setupCost: 0, horizonMonths: 12,
    rampStartPct: 100, rampMonths: 1, discountPctYear: 0,
  });
  assert.equal(Math.round(r.valueMonth), 367);
  assert.equal(Math.round(r.totalValue), 4400);
  assert.equal(Math.round(r.hoursSavedMonth * 10) / 10, 26.7);
  assert.match(read('examples/bim-model-checking.fr.md'), /367 € par mois[\s\S]*4 400 €/);
  assert.match(read('examples/bim-model-checking.en.md'), /€367 a month[\s\S]*€4,400/);
});

test('the page has no external script and loads the app module', () => {
  const html = read('index.html');
  assert.ok(!/<script[^>]+src="https?:/.test(html));
  assert.match(html, /<script type="module" src="src\/app\.mjs">/);
});

test('published files do not name the product of the example', () => {
  const files = ['index.html', 'README.md', 'src/app.mjs', 'src/roi.mjs',
    'template/value-case.fr.md', 'template/value-case.en.md',
    'examples/bim-model-checking.fr.md', 'examples/bim-model-checking.en.md'];
  for (const f of files) assert.doesNotMatch(read(f), /seve\s*-?\s*up/i, f);
});
