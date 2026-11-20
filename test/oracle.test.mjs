import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute, cumulative, verdict, FIELDS } from '../src/roi.mjs';

// Independent check: a month-by-month cash simulation written from the definitions, not from roi.mjs,
// compared with compute() on thousands of random inputs.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInputs(r) {
  const pick = f => {
    const [lo, hi] = f.slider;
    if (r() < 0.08) return lo; // edge values, including zeros
    const v = lo + r() * (hi - lo);
    return f.step >= 1 ? Math.round(v) : Math.round(v * 100) / 100;
  };
  return Object.fromEntries(FIELDS.map(f => [f.key, pick(f)]));
}

function simulate(i) {
  // Written from the stated definitions: adoption climbs in equal steps from month 1 to month rampMonths,
  // each month's flow is divided by (1 + yearly rate) to the power (month / 12), setup is paid at month 0.
  let cash = -i.setupCost;
  let value = 0;
  let cost = i.setupCost;
  const curve = [cash];
  let payback = null;
  for (let m = 1; m <= 600; m++) {
    let adoption = i.adoptionPct;
    if (i.rampMonths > 1 && m < i.rampMonths) {
      const step = (i.adoptionPct - i.rampStartPct) / (i.rampMonths - 1);
      adoption = i.rampStartPct + step * (m - 1);
    }
    const tasks = i.users * i.tasksPerUserMonth * adoption / 100;
    const minutesSaved = tasks * (i.minutesBefore - i.minutesAfter);
    const minutesRework = tasks * i.reworkSharePct / 100 * i.reworkMinutes;
    const factor = Math.pow(1 + i.discountPctYear / 100, m / 12);
    const v = (minutesSaved - minutesRework) / 60 * i.hourlyCost * i.capturePct / 100 / factor;
    const c = (i.users * i.seatCostMonth + tasks * i.aiCostPerTask + i.runCostMonth) / factor;
    const before = cash;
    cash += v - c;
    if (m <= i.horizonMonths) { value += v; cost += c; curve.push(cash); }
    if (payback === null) {
      if (m === 1 && before >= 0 && cash > before) payback = 0;
      else if (before < 0 && cash >= 0) payback = m - 1 + (-before) / (cash - before);
    }
  }
  return { value, cost, curve, payback };
}

const near = (a, b, msg) => {
  const tol = 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
  assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
};

test('compute agrees with an independent month-by-month simulation', () => {
  const r = rng(20261119);
  for (let n = 0; n < 5000; n++) {
    const i = randomInputs(r);
    const got = compute(i);
    const sim = simulate(i);
    near(got.totalValue, sim.value, `value #${n}`);
    near(got.totalCost, sim.cost, `cost #${n}`);
    const curve = cumulative(i);
    sim.curve.forEach((c, m) => near(curve[m], c, `cumulative month ${m} #${n}`));
    near(got.totalValue - got.totalCost, sim.curve.at(-1), `net #${n}`);
    if (sim.cost > 0) near(got.roiPct, (sim.value - sim.cost) / sim.cost * 100, `roi #${n}`);
    else assert.equal(got.roiPct, null);
    // Payback: the simulation finds the zero crossing within 600 months.
    if (sim.payback === null) {
      assert.ok(got.paybackMonths === null || got.paybackMonths > 599, `payback #${n}: ${got.paybackMonths}`);
    } else {
      near(got.paybackMonths, sim.payback, `payback #${n}`);
    }
  }
});

test('break-even minutes really zero the net result', () => {
  const r = rng(7);
  let checked = 0;
  for (let n = 0; n < 3000; n++) {
    const i = randomInputs(r);
    const got = compute(i);
    if (got.breakEvenMinutes === null) continue;
    // Raise the time before by exactly the missing minutes: the net result over the horizon must be zero.
    const atBreakEven = { ...i, minutesBefore: i.minutesBefore + (got.breakEvenMinutes - got.netMinutesPerTask) };
    const sim = simulate(atBreakEven);
    near(sim.value, sim.cost, `break-even #${n}`);
    checked++;
  }
  assert.ok(checked > 1000);
});

test('the verdict matches what the cash curve shows', () => {
  const r = rng(42);
  const seen = new Set();
  for (let n = 0; n < 5000; n++) {
    const i = randomInputs(r);
    const got = compute(i);
    const v = verdict(got).kind;
    seen.add(v);
    const sim = simulate(i);
    const H = i.horizonMonths;
    if (v === 'immediate') assert.ok(sim.payback === 0, `#${n}`);
    if (v === 'payback') assert.ok(sim.payback > 0 && sim.payback <= H, `#${n}`);
    if (v === 'late') assert.ok(sim.payback > H && sim.curve[H] < 0, `#${n}`);
    if (v === 'loss') assert.ok(sim.payback === null && got.netMonth < 0, `#${n}`);
    if (v === 'distant') assert.ok(sim.payback === null && got.netMonth > 0, `#${n}`);
    if (v === 'flat') assert.ok(got.netMonth === 0 && sim.payback === null, `#${n}`);
  }
  for (const k of ['immediate', 'payback', 'late', 'loss']) assert.ok(seen.has(k), `case ${k} never drawn`);
});
