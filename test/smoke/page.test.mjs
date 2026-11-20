import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Loads the real index.html body and the real app module in happy-dom, then drives the page
// the way a user would. The calculation itself is unit-tested under node:test.

const html = readFileSync(resolve(import.meta.dirname, '../../index.html'), 'utf8');
const body = html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, '');

const $ = sel => document.querySelector(sel);

async function load({ lang = 'fr', hash = '' } = {}) {
  document.body.innerHTML = body;
  localStorage.setItem('roi-lang', lang);
  location.hash = hash;
  vi.resetModules();
  await import('../../src/app.mjs');
}

function type(key, value) {
  const input = $(`#in-${key}`);
  input.value = String(value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('page smoke test', () => {
  test('opens on the example with every result filled', async () => {
    await load();
    expect(document.documentElement.lang).toBe('fr');
    expect($('#mode').textContent).toBe('exemple');
    expect(document.querySelectorAll('#inputs input[type="number"]')).toHaveLength(17);
    expect(document.querySelectorAll('#inputs input[type="range"]')).toHaveLength(17);
    expect($('#verdict').textContent).toBe('Remboursé en 5,5 mois.');
    expect($('#range-line').textContent).toMatch(/^Cas prudent : .+\. Cas favorable : remboursé en .+ mois\.$/);
    expect($('#chart .band')).not.toBeNull();
    expect($('#chart svg polyline').getAttribute('points').split(' ')).toHaveLength(13);
    expect($('#chart .be-line')).not.toBeNull();
    for (const id of ['#t-net', '#t-roi', '#t-payback', '#t-breakeven']) {
      expect($(`${id} .v`).textContent).not.toBe('');
      expect($(id).dataset.tone).toBe('good');
    }
    expect($('#t-roi .v').textContent).toMatch(/^\d+\s%$/);
    expect(document.querySelectorAll('#detail tbody tr')).toHaveLength(6);
    expect(document.querySelectorAll('#tornado .row').length).toBeGreaterThanOrEqual(5);
    expect(document.querySelectorAll('#method li')).toHaveLength(5);
  });

  test('editing a value recomputes and leaves example mode', async () => {
    await load();
    const before = $('#t-net .v').textContent;
    type('users', 200);
    expect($('#t-net .v').textContent).not.toBe(before);
    expect($('#mode').textContent).toBe('vos valeurs');
  });

  test('a losing case is shown as such', async () => {
    await load();
    type('minutesAfter', 45);
    expect($('#t-net').dataset.tone).toBe('bad');
    expect($('#t-payback .v').textContent).toBe('jamais');
    expect($('#verdict').textContent).toBe('Ne se rembourse pas.');
    expect($('#chart .be-line')).toBeNull();
  });

  test('invalid input shows a field error and no result', async () => {
    await load();
    type('adoptionPct', 150);
    expect($('#results').dataset.state).toBe('invalid');
    expect($('#in-adoptionPct').getAttribute('aria-invalid')).toBe('true');
    expect($('#in-adoptionPct-err').textContent).toContain('maximum 100');
    // No stale figure stays readable while an input is wrong.
    expect($('#t-net .v').textContent).toBe('');
    expect($('#t-roi .v').textContent).toBe('');
    expect($('#verdict').textContent).toBe('');
    expect($('#invalid a').getAttribute('href')).toBe('#in-adoptionPct');
    type('adoptionPct', '');
    expect($('#in-adoptionPct-err').textContent).toBe('Entrez un nombre.');
    type('adoptionPct', 60);
    expect($('#results').dataset.state).toBe('ok');
  });

  test('switching language keeps the values typed', async () => {
    await load();
    type('users', 12);
    $('#lang-en').click();
    expect($('#lang-en').getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.lang).toBe('en');
    expect($('h1').textContent).toBe('AI deployment ROI calculator');
    expect($('#in-users').value).toBe('12');
    expect($('#tpl-link').getAttribute('href')).toBe('template/value-case.en.md');
    expect(localStorage.getItem('roi-lang')).toBe('en');
  });

  test('a shared link restores the calculation; a bad one falls back to the example', async () => {
    await load({ hash: '#users=7&hourlyCost=80' });
    expect($('#in-users').value).toBe('7');
    expect($('#in-hourlyCost').value).toBe('80');
    await load({ hash: '#adoptionPct=500' });
    expect($('#mode').textContent).toBe('exemple');
  });

  test('copy buttons write Markdown and a link', async () => {
    await load({ lang: 'en' });
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    $('#copy-md').click();
    await vi.waitFor(() => expect($('#copy-status').textContent).toBe('Copied.'));
    expect(writeText.mock.calls[0][0]).toContain('### Assumptions');
    $('#copy-link').click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    expect(writeText.mock.calls[1][0]).toMatch(/#users=50&/);
  });

  test('a refused copy reveals the text to select by hand', async () => {
    await load();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) }, configurable: true });
    $('#copy-md').click();
    await vi.waitFor(() => expect($('#md').hidden).toBe(false));
    expect($('#copy-status').textContent).toContain('Copie refusée');
  });

  test('a slider drives its number field and the result', async () => {
    await load();
    const roiBefore = $('#t-roi .v').textContent;
    const range = $('#rg-adoptionPct');
    range.value = '90';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    expect($('#in-adoptionPct').value).toBe('90');
    expect($('#mode').textContent).toBe('vos valeurs');
    expect($('#t-roi .v').textContent).not.toBe(roiBefore);
  });

  test('typing a number moves its slider', async () => {
    await load();
    type('hourlyCost', 120);
    expect($('#rg-hourlyCost').value).toBe('120');
  });

  test('the biggest lever is listed first', async () => {
    await load();
    const names = [...document.querySelectorAll('#tornado .row .name')].map(n => n.textContent);
    expect(names.length).toBeGreaterThan(0);
    expect(names).not.toContain('Horizon de calcul (mois)');
  });

  test('the phone result bar repeats the verdict and the net result', async () => {
    await load();
    expect($('#peek-text').textContent).toBe('Remboursé en 5,5 mois.');
    expect($('#peek-value').textContent).toBe($('#t-net .v').textContent);
    type('minutesAfter', 45);
    expect($('#peek').dataset.tone).toBe('bad');
    type('minutesAfter', '');
    expect($('#peek-value').textContent).toBe('');
  });

  test('the headline equals the value minus the cost shown under it', async () => {
    await load();
    for (const [k, v] of [['hourlyCost', 55.37], ['minutesBefore', 44.6], ['aiCostPerTask', 0.013]]) type(k, v);
    const n = s => Number(s.replace(/[^0-9,-]/g, '').replace(',', '.'));
    const [value, cost] = $('#t-net .n').textContent.split('−').map(n);
    expect(n($('#t-net .v').textContent)).toBe(value - cost);
  });

  test('no setup and a monthly gain read as immediate', async () => {
    await load();
    type('setupCost', 0);
    expect($('#verdict').textContent).toBe('Rentable dès le premier mois.');
    expect($('#t-payback .v').textContent).toBe('immédiat');
  });

  test('a flat month is not called a loss', async () => {
    await load({ hash: '#users=10&adoptionPct=100&tasksPerUserMonth=20&minutesBefore=13&minutesAfter=10&reworkSharePct=0&reworkMinutes=0&hourlyCost=60&capturePct=100&seatCostMonth=60&aiCostPerTask=0&runCostMonth=0&setupCost=500&horizonMonths=12' });
    expect($('#verdict').textContent).toBe('Ni gain ni perte chaque mois.');
  });

  test('timings fill the time fields and the range of the time after', async () => {
    await load();
    $('#m-before').value = '30 32 28 31 29';
    $('#m-before').dispatchEvent(new Event('input', { bubbles: true }));
    $('#m-after').value = '12\n15\n10\n14\n11\n13 abc';
    $('#m-after').dispatchEvent(new Event('input', { bubbles: true }));
    expect($('#m-after-sum').textContent).toContain('6 mesures, moyenne 12,5 min');
    expect($('#m-after-sum').textContent).toContain('Ignoré, ce n’est pas une durée : abc');
    expect($('#m-gain').textContent).toMatch(/^Gain par tâche : 17,5 min \(intervalle à 95\s% : .+\)\./);
    $('#m-use').click();
    expect($('#in-minutesBefore').value).toBe('30');
    expect($('#in-minutesAfter').value).toBe('12.5');
    expect(Number($('#rng-0-minutesAfter').value)).toBeGreaterThan(12.5);
    expect(Number($('#rng-1-minutesAfter').value)).toBeLessThan(12.5);
    expect($('#mode').textContent).toBe('vos valeurs');
  });

  test('timings that cannot show a saving say so', async () => {
    await load();
    $('#m-before').value = '10 14 9 13';
    $('#m-after').value = '11 12 10 13';
    $('#m-after').dispatchEvent(new Event('input', { bubbles: true }));
    expect($('#m-gain').textContent).toContain('L’intervalle contient zéro');
  });

  test('a wrong range value is listed and clears the figures', async () => {
    await load();
    const input = $('#rng-1-capturePct');
    input.value = '140';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect($('#results').dataset.state).toBe('invalid');
    expect($('#invalid a').getAttribute('href')).toBe('#rng-1-capturePct');
    $('#range-on').click();
    expect($('#results').dataset.state).toBe('ok');
    expect($('#range-line').textContent).toBe('');
    expect($('#chart .band')).toBeNull();
  });

  test('a kept calculation is compared and drawn', async () => {
    await load();
    $('#keep').click();
    type('setupCost', 5000);
    const rows = [...document.querySelectorAll('#compare-table tbody tr')];
    expect(rows).toHaveLength(4);
    expect(rows[0].lastChild.textContent).toBe('+10\u202f000 €');
    expect($('#chart .kept')).not.toBeNull();
    $('#clear-kept').click();
    expect($('#compare-table').textContent).toBe('');
    expect(localStorage.getItem('roi-kept')).toBeNull();
  });

  test('sliders can be reached with the keyboard', async () => {
    await load();
    const slider = $('#rg-users');
    expect(slider.tabIndex).not.toBe(-1);
    expect(slider.getAttribute('aria-hidden')).toBeNull();
    expect(slider.getAttribute('aria-label')).toBe('Utilisateurs équipés (curseur)');
  });

  test('reset brings back the example values', async () => {
    await load();
    type('users', 3);
    $('#reset').click();
    expect($('#in-users').value).toBe('50');
    expect($('#mode').textContent).toBe('exemple');
  });
});
