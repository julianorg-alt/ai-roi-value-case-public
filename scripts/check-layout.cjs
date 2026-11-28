// Looks for overlapping text, overflow and content past the screen edge at 6 widths, FR and EN, 6 states
// (example, loss, late, invalid input, kept calculation, timings used).
// Needs Playwright and a static server on port 8766: python3 -m http.server 8766 --bind 127.0.0.1
// Prints "clean" or the problems found; exits 1 on any problem.
const { chromium } = require('playwright');
const widths = [320, 375, 390, 768, 1024, 1360];
const states = {
  example: {},
  loss: { adoptionPct: 15 },
  late: { setupCost: 150000 },
  invalid: { capturePct: 150 },
  kept: { $keep: true, setupCost: 5000 },
  measures: { $before: '30 32 28 31 29 33 27 30 31 29', $after: '12 15 10 14 11 13 12 14 abc' },
};
(async () => {
  const b = await chromium.launch();
  const report = [];
  for (const lang of ['fr', 'en']) for (const w of widths) for (const [name, vals] of Object.entries(states)) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.addInitScript(l => localStorage.setItem('roi-lang', l), lang);
    await p.goto((process.env.DEMO_URL || 'http://127.0.0.1:8766/index.html')); await p.waitForTimeout(300);
    if (vals.$keep) await p.click('#keep');
    if (vals.$before) { await p.fill('#m-before', vals.$before); await p.fill('#m-after', vals.$after); await p.click('#m-use'); }
    for (const [k, v] of Object.entries(vals)) if (!k.startsWith('$')) await p.fill(`#in-${k}`, String(v));
    await p.waitForTimeout(400);
    const res = await p.evaluate(() => {
      const out = [];
      const vis = el => { const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && el.getClientRects().length; };
      const items = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const t = walker.currentNode; if (!t.textContent.trim()) continue;
        const el = t.parentElement; if (!vis(el) || el.closest('[hidden]') || el.closest('#peek')) continue; // the phone result bar floats over the page on purpose
        const r = document.createRange(); r.selectNodeContents(t);
        for (const rc of r.getClientRects()) if (rc.width > 1 && rc.height > 1) items.push({ el, rc, txt: t.textContent.trim().slice(0, 30) });
      }
      for (const inp of document.querySelectorAll('input[type=number]')) { const rc = inp.getBoundingClientRect(); items.push({ el: inp, rc, txt: 'input#' + inp.id }); }
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const a = items[i], c = items[j]; if (a.el === c.el) continue;
        const ix = Math.min(a.rc.right, c.rc.right) - Math.max(a.rc.left, c.rc.left);
        const iy = Math.min(a.rc.bottom, c.rc.bottom) - Math.max(a.rc.top, c.rc.top);
        if (ix > 2 && iy > 2) out.push(`OVERLAP "${a.txt}" x "${c.txt}"`);
      }
      for (const el of document.querySelectorAll('body *')) {
        if (!vis(el) || ['svg','INPUT','TEXTAREA'].includes(el.tagName) || el.closest('svg')) continue;
        const s = getComputedStyle(el);
        if (el.scrollWidth > el.clientWidth + 1 && s.overflowX !== 'auto' && el.clientWidth > 0 && s.display !== 'inline') out.push(`OVERFLOW <${el.tagName.toLowerCase()} ${el.id || el.className}> ${el.scrollWidth}>${el.clientWidth}`);
        const r = el.getBoundingClientRect(); if (r.right > innerWidth + 1) out.push(`OFFSCREEN <${el.tagName.toLowerCase()} ${el.id || el.className}> right=${Math.round(r.right)}`);
      }
      return [...new Set(out)];
    });
    if (res.length) report.push(`${lang} ${w} ${name}:\n  ` + res.slice(0, 12).join('\n  '));
    await p.close();
  }
  console.log(report.join('\n') || 'clean');
  if (report.length) process.exitCode = 1;
  await b.close();
})();
