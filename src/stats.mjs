// Small statistics for before and after timings: no dependency, tested against the published t table.

const T975 = [
  [1, 12.706], [2, 4.303], [3, 3.182], [4, 2.776], [5, 2.571], [6, 2.447], [7, 2.365], [8, 2.306], [9, 2.262],
  [10, 2.228], [11, 2.201], [12, 2.179], [13, 2.160], [14, 2.145], [15, 2.131], [16, 2.120], [17, 2.110],
  [18, 2.101], [19, 2.093], [20, 2.086], [21, 2.080], [22, 2.074], [23, 2.069], [24, 2.064], [25, 2.060],
  [26, 2.056], [27, 2.052], [28, 2.048], [29, 2.045], [30, 2.042], [40, 2.021], [60, 2.000], [120, 1.980],
];

// Two-sided 95 % quantile of Student's t; linear in 1/df between table rows, 1.960 beyond.
export function t975(df) {
  if (!(df >= 1)) return null;
  if (df >= 120) return 1.980 + (1.960 - 1.980) * (1 - 120 / df);
  for (let k = 0; k < T975.length - 1; k++) {
    const [d0, t0] = T975[k];
    const [d1, t1] = T975[k + 1];
    if (df <= d1) {
      const w = (1 / d0 - 1 / df) / (1 / d0 - 1 / d1);
      return t0 + (t1 - t0) * w;
    }
  }
  return 1.96;
}

// Comma is the decimal mark (12,5); new lines, spaces, tabs and semicolons separate values.
export function parseDurations(text) {
  const values = [];
  const rejected = [];
  for (const token of String(text).split(/[\s;]+/)) {
    if (!token) continue;
    const v = Number(token.replace(',', '.'));
    if (Number.isFinite(v) && v >= 0 && /^[0-9]+([.,][0-9]+)?$/.test(token)) values.push(v);
    else rejected.push(token);
  }
  return { values, rejected };
}

export function summarize(values) {
  const n = values.length;
  if (!n) return { n: 0, mean: null, sd: null, ci: null };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  if (n < 2) return { n, mean, sd: null, ci: null };
  const sd = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1));
  const half = t975(n - 1) * sd / Math.sqrt(n);
  return { n, mean, sd, ci: [mean - half, mean + half] };
}

// Saving per task (before minus after) with a Welch 95 % interval: the two samples need not have the same spread.
export function compareMeans(before, after) {
  const a = summarize(before);
  const b = summarize(after);
  if (a.n < 2 || b.n < 2) return { gain: a.mean !== null && b.mean !== null ? a.mean - b.mean : null, ci: null, df: null };
  const va = a.sd ** 2 / a.n;
  const vb = b.sd ** 2 / b.n;
  const se = Math.sqrt(va + vb);
  const gain = a.mean - b.mean;
  if (se === 0) return { gain, ci: [gain, gain], df: null };
  const df = (va + vb) ** 2 / (va ** 2 / (a.n - 1) + vb ** 2 / (b.n - 1));
  const half = t975(df) * se;
  return { gain, ci: [gain - half, gain + half], df };
}
