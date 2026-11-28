import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDurations, summarize, compareMeans, t975 } from '../src/stats.mjs';

const close = (a, b, eps = 1e-3) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test('t quantiles match the published table', () => {
  close(t975(1), 12.706); close(t975(2), 4.303); close(t975(9), 2.262); close(t975(30), 2.042);
  close(t975(60), 2.000); close(t975(1e6), 1.960);
  // Non-integer degrees of freedom (Welch) fall between their neighbours.
  assert.ok(t975(9.5) < t975(9) && t975(9.5) > t975(10));
});

test('durations: comma is the decimal mark, lines, spaces and semicolons separate', () => {
  const r = parseDurations('12,5\n14 ; 9.5\t11\n\n');
  assert.deepEqual(r.values, [12.5, 14, 9.5, 11]);
  assert.deepEqual(r.rejected, []);
});

test('durations: bad tokens and negatives are reported, not silently dropped', () => {
  const r = parseDurations('10 abc -3 12');
  assert.deepEqual(r.values, [10, 12]);
  assert.deepEqual(r.rejected, ['abc', '-3']);
});

test('mean, sample standard deviation and 95 % interval', () => {
  const s = summarize([10, 12, 14]);
  assert.equal(s.n, 3);
  close(s.mean, 12);
  close(s.sd, 2);
  close(s.ci[0], 12 - 4.303 * 2 / Math.sqrt(3));
  close(s.ci[1], 12 + 4.303 * 2 / Math.sqrt(3));
});

test('fewer than two values give no interval', () => {
  assert.equal(summarize([5]).ci, null);
  assert.equal(summarize([]).mean, null);
});

test('Welch interval on the saving per task', () => {
  const before = [30, 32, 28, 31, 29];
  const after = [12, 15, 10, 14, 11, 13];
  const c = compareMeans(before, after);
  close(c.gain, 30 - 12.5);
  const va = 2.5 / 5, vb = 3.5 / 6;
  const df = (va + vb) ** 2 / (va ** 2 / 4 + vb ** 2 / 5);
  close(c.df, df);
  close(c.ci[1] - c.gain, t975(df) * Math.sqrt(va + vb));
});
