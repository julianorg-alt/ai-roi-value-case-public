import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute, validate, DEFAULTS, FIELDS, toMarkdown, encodeState, decodeState } from '../src/roi.mjs';

const base = {
  users: 10,
  tasksPerUserMonth: 20,
  minutesBefore: 30,
  minutesAfter: 10,
  reworkSharePct: 0,
  reworkMinutes: 0,
  adoptionPct: 100,
  capturePct: 100,
  hourlyCost: 60,
  seatCostMonth: 0,
  aiCostPerTask: 0,
  runCostMonth: 0,
  setupCost: 0,
  horizonMonths: 12,
  rampStartPct: 100,
  rampMonths: 1,
  discountPctYear: 0,
};

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test('hours saved and value with no cost', () => {
  const r = compute(base);
  assert.equal(r.tasksMonth, 200);
  close(r.netMinutesPerTask, 20);
  close(r.hoursSavedMonth, 200 * 20 / 60);
  close(r.valueMonth, (200 * 20 / 60) * 60);
  assert.equal(r.costMonth, 0);
  assert.equal(r.paybackMonths, 0);
  assert.equal(r.roiPct, null); // no cost: ROI undefined, not infinite
});

test('adoption and capture scale the value linearly', () => {
  const r = compute({ ...base, adoptionPct: 50, capturePct: 50 });
  assert.equal(r.tasksMonth, 100);
  close(r.valueMonth, 100 * 20 / 60 * 60 * 0.5);
});

test('rework is subtracted from the time saved', () => {
  const r = compute({ ...base, reworkSharePct: 25, reworkMinutes: 8 });
  close(r.netMinutesPerTask, 20 - 0.25 * 8);
});

test('costs: seats, per-task AI cost, run cost, setup, payback and ROI', () => {
  const r = compute({ ...base, seatCostMonth: 30, aiCostPerTask: 0.5, runCostMonth: 100, setupCost: 2000 });
  close(r.costMonth, 10 * 30 + 200 * 0.5 + 100);
  const value = 200 * 20 / 60 * 60; // 4000
  close(r.netMonth, value - 500);
  close(r.paybackMonths, 2000 / 3500);
  const totalCost = 500 * 12 + 2000;
  close(r.totalValue, value * 12);
  close(r.totalCost, totalCost);
  close(r.roiPct, (value * 12 - totalCost) / totalCost * 100);
});

test('seats are paid for every user, adopted or not', () => {
  const r = compute({ ...base, adoptionPct: 50, seatCostMonth: 30 });
  close(r.costMonth, 10 * 30);
});

test('negative net: no payback', () => {
  const r = compute({ ...base, minutesAfter: 30, seatCostMonth: 10, setupCost: 100 });
  assert.equal(r.paybackMonths, null);
  assert.ok(r.roiPct < 0);
});

test('slower after than before gives a negative time saving, kept as is', () => {
  const r = compute({ ...base, minutesAfter: 40 });
  close(r.netMinutesPerTask, -10);
  assert.ok(r.valueMonth < 0);
});

test('break-even minutes per task covers total cost over the horizon', () => {
  const inputs = { ...base, seatCostMonth: 30, setupCost: 1200, capturePct: 50 };
  const r = compute(inputs);
  const check = compute({ ...inputs, minutesBefore: inputs.minutesAfter + r.breakEvenMinutes });
  close(check.totalValue, check.totalCost, 1e-6);
});

test('break-even is null when no task is done', () => {
  const r = compute({ ...base, adoptionPct: 0, seatCostMonth: 30 });
  assert.equal(r.breakEvenMinutes, null);
  assert.equal(r.paybackMonths, null);
});

test('validate rejects negative, non-numeric and out-of-range values', () => {
  assert.deepEqual(validate(base), {});
  const errs = validate({ ...base, users: -1, adoptionPct: 120, hourlyCost: 'abc', horizonMonths: 0 });
  assert.deepEqual(Object.keys(errs).sort(), ['adoptionPct', 'horizonMonths', 'hourlyCost', 'users']);
});

test('validate rejects missing fields', () => {
  const { users, ...rest } = base;
  assert.ok('users' in validate(rest));
});

test('compute throws on invalid input instead of returning NaN', () => {
  assert.throws(() => compute({ ...base, users: Number.NaN }), /users/);
});

test('defaults are valid and every field has FR and EN labels', () => {
  assert.deepEqual(validate(DEFAULTS), {});
  for (const f of FIELDS) {
    assert.ok(f.label.fr && f.label.en, f.key);
    assert.ok(f.key in DEFAULTS, f.key);
  }
});

test('state round-trips through the URL hash', () => {
  const s = { ...base, users: 7, hourlyCost: 55.5 };
  assert.deepEqual(decodeState(encodeState(s)), s);
});

test('decodeState ignores unknown keys and bad numbers', () => {
  const d = decodeState('users=3&evil=1&hourlyCost=x');
  assert.equal(d.users, 3);
  assert.ok(!('evil' in d));
  assert.ok(!('hourlyCost' in d));
});

test('markdown export contains inputs and results in both languages', () => {
  const r = compute(base);
  for (const lang of ['fr', 'en']) {
    const md = toMarkdown(base, r, lang);
    assert.match(md, /\|/);
    assert.ok(md.includes(String(base.users)));
  }
  assert.match(toMarkdown(base, compute(base), 'fr'), /Hypothèses/);
  assert.match(toMarkdown(base, compute(base), 'en'), /Assumptions/);
});

import { cumulative, sensitivity, verdict, scenario, FIELDS as F2 } from '../src/roi.mjs';

test('cumulative starts at minus the setup and rises by the monthly net', () => {
  const i = { ...base, seatCostMonth: 30, setupCost: 2000 };
  const r = compute(i);
  const c = cumulative(i);
  assert.equal(c.length, i.horizonMonths + 1);
  assert.equal(c[0], -2000);
  close(c[12], -2000 + 12 * r.netMonth);
  close(c[12], r.totalValue - r.totalCost);
});

test('sensitivity ranks assumptions by how much they move the net result', () => {
  const i = { ...base, seatCostMonth: 30, setupCost: 2000, capturePct: 50, adoptionPct: 50 };
  const s = sensitivity(i, 20);
  const swings = s.map(x => Math.abs(x.high - x.low));
  assert.deepEqual(swings, [...swings].sort((a, b) => b - a));
  assert.ok(s.every(x => x.key !== 'horizonMonths'));
  // Zero-valued inputs do not move anything and are left out.
  assert.ok(!s.some(x => x.key === 'aiCostPerTask'));
  const hc = s.find(x => x.key === 'hourlyCost');
  const net = v => { const r = compute({ ...i, hourlyCost: v }); return r.totalValue - r.totalCost; };
  close(hc.low, net(60 * 0.8));
  close(hc.high, net(60 * 1.2));
});

test('sensitivity clamps percentages at 100', () => {
  const s = sensitivity({ ...base, adoptionPct: 100, seatCostMonth: 10 }, 20);
  const a = s.find(x => x.key === 'adoptionPct');
  close(a.high, compute({ ...base, seatCostMonth: 10 }).totalValue - compute({ ...base, seatCostMonth: 10 }).totalCost);
});

test('verdict distinguishes the four cases', () => {
  assert.equal(verdict(compute({ ...base })).kind, 'immediate');
  assert.equal(verdict(compute({ ...base, setupCost: 1000 })).kind, 'payback');
  assert.equal(verdict(compute({ ...base, setupCost: 1e5 })).kind, 'late');
  assert.equal(verdict(compute({ ...base, setupCost: 1e9 })).kind, 'distant');
  assert.equal(verdict(compute({ ...base, minutesAfter: 30, seatCostMonth: 5 })).kind, 'loss');
});

test('every field has a slider range inside its valid range', () => {
  for (const f of F2) {
    assert.ok(f.slider && f.slider[0] >= f.min && f.slider[1] <= f.max && f.slider[0] < f.slider[1], f.key);
  }
});

test('a month that brings in exactly what it costs is flat, not a loss', () => {
  // 10 users x 20 tasks x 3 min = 10 h a month at 60 EUR = 600 EUR of value; 10 seats at 60 EUR = 600 EUR.
  const r = compute({ ...base, minutesBefore: 13, minutesAfter: 10, seatCostMonth: 60, setupCost: 500 });
  assert.equal(r.netMonth, 0);
  assert.equal(verdict(r).kind, 'flat');
  assert.equal(r.paybackMonths, null);
});

test('the export says immediate when there is nothing to pay back', () => {
  assert.match(toMarkdown(base, compute(base), 'fr'), /\| Retour de la mise en place \(mois\) \| immédiat \|/);
  assert.match(toMarkdown(base, compute(base), 'en'), /\| Setup payback \(months\) \| immediate \|/);
});

test('adoption ramps linearly from the first month to the target', () => {
  const i = { ...base, adoptionPct: 80, rampStartPct: 20, rampMonths: 4, horizonMonths: 6 };
  const r = compute(i);
  // Months 1 to 4: 20, 40, 60, 80 % of 200 tasks; then 80 %.
  assert.deepEqual(r.adoptionByMonth, [20, 40, 60, 80, 80, 80]);
  const perTask = 20 / 60 * 60; // 20 min at 60 EUR/h
  close(r.totalValue, 200 * perTask * (0.2 + 0.4 + 0.6 + 0.8 * 3));
  // The typical month is the month at target adoption.
  close(r.valueMonth, 200 * 0.8 * perTask);
});

test('ramp-up delays payback compared with full adoption from day one', () => {
  const flat = compute({ ...base, seatCostMonth: 30, setupCost: 6000 });
  const ramp = compute({ ...base, seatCostMonth: 30, setupCost: 6000, rampStartPct: 10, rampMonths: 6 });
  assert.ok(ramp.paybackMonths > flat.paybackMonths);
  assert.ok(ramp.totalValue < flat.totalValue);
});

test('a zero discount rate changes nothing; a positive one shrinks later months', () => {
  const i = { ...base, seatCostMonth: 30, setupCost: 2000 };
  const r0 = compute(i);
  const r10 = compute({ ...i, discountPctYear: 10 });
  close(r10.curve[0], -2000);
  // Month 12 is discounted by exactly one year at 10 %.
  close(r10.curve[12] - r10.curve[11], r0.netMonth / 1.1);
  assert.ok(r10.totalValue < r0.totalValue && r10.totalCost < r0.totalCost);
});

test('payback is found beyond the horizon when it comes late', () => {
  const r = compute({ ...base, seatCostMonth: 30, setupCost: 1e5 });
  close(r.paybackMonths, 1e5 / 3700);
  assert.equal(verdict(r).kind, 'late');
});

test('break-even still zeroes the result with ramp-up and discounting', () => {
  const i = { ...base, seatCostMonth: 30, setupCost: 4000, capturePct: 60, rampStartPct: 30, rampMonths: 5, discountPctYear: 8 };
  const r = compute(i);
  const at = compute({ ...i, minutesBefore: i.minutesAfter + r.breakEvenMinutes });
  close(at.totalValue, at.totalCost, 1e-6);
});

test('a scenario overrides only the given assumptions', () => {
  const r = scenario({ ...base, seatCostMonth: 30 }, { adoptionPct: 50 });
  close(r.tasksMonth, 100);
  assert.throws(() => scenario(base, { adoptionPct: 140 }), /adoptionPct/);
});

import { RANGE_KEYS, DEFAULT_RANGE, validateRange, rangeResults, encodeRange, decodeRange } from '../src/roi.mjs';

test('the default range is valid and brackets the default values', () => {
  assert.deepEqual(validateRange(DEFAULT_RANGE), {});
  for (const k of RANGE_KEYS) {
    const [lo, hi] = DEFAULT_RANGE[k];
    const v = DEFAULTS[k];
    assert.ok(Math.min(lo, hi) <= v && v <= Math.max(lo, hi), k);
  }
});

test('prudent is worse than probable, favorable better, on the default example', () => {
  const r = rangeResults(DEFAULTS, DEFAULT_RANGE);
  const net = x => x.totalValue - x.totalCost;
  const mid = compute(DEFAULTS);
  assert.ok(net(r.prudent) < net(mid) && net(mid) < net(r.favorable));
});

test('validateRange reports the bound that is out of limits', () => {
  const e = validateRange({ ...DEFAULT_RANGE, capturePct: [30, 140] });
  assert.deepEqual(e, { capturePct: [null, 'max'] });
});

test('range round-trips through the URL hash', () => {
  const h = encodeRange({ ...DEFAULT_RANGE, adoptionPct: [35, 80] });
  assert.deepEqual(decodeRange(h).adoptionPct, [35, 80]);
  assert.deepEqual(decodeRange('lo_adoptionPct=x&hi_adoptionPct=50'), {});
});

test('markdown export carries the range when given', () => {
  const r = rangeResults(DEFAULTS, DEFAULT_RANGE);
  const md = toMarkdown(DEFAULTS, compute(DEFAULTS), 'fr', { range: DEFAULT_RANGE, ...r });
  assert.match(md, /### Fourchette/);
  assert.match(md, /prudent/);
  assert.match(toMarkdown(DEFAULTS, compute(DEFAULTS), 'en', { range: DEFAULT_RANGE, ...r }), /### Range/);
});
