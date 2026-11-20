// Records a short demo of the calculator: node scripts/demo.cjs [out.webm]
// Needs Playwright with Chromium (not a project dependency) and a static server on port 8766:
//   python3 -m http.server 8766 --bind 127.0.0.1
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

const BASE = process.env.DEMO_URL || 'http://127.0.0.1:8766/index.html';
const out = path.resolve(process.argv[2] || 'demo.webm');

async function typeSlow(page, key, value) {
  const sel = `#in-${key}`;
  await page.locator(sel).scrollIntoViewIfNeeded();
  await page.click(sel, { clickCount: 3 });
  await page.keyboard.type(String(value), { delay: 120 });
  await page.waitForTimeout(900);
}

(async () => {
  const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'roi-demo-'));
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    recordVideo: { dir, size: { width: 1280, height: 1000 } },
    locale: 'fr-FR',
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();
  await page.goto(BASE);
  await page.waitForTimeout(2000);

  // 0. Drag a slider, the curve follows.
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await page.waitForTimeout(400);
  const box = await page.locator('#rg-adoptionPct').boundingBox();
  if (box && box.y + box.height < 1000) {
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height / 2);
    await page.mouse.down();
    for (let i = 0; i <= 20; i++) { await page.mouse.move(box.x + box.width * (0.6 - i * 0.025), box.y + box.height / 2); await page.waitForTimeout(60); }
    for (let i = 0; i <= 20; i++) { await page.mouse.move(box.x + box.width * (0.1 + i * 0.03), box.y + box.height / 2); await page.waitForTimeout(60); }
    await page.mouse.up();
  }
  await page.waitForTimeout(1200);

  // 1. A pilot with weak adoption and a lot of rework does not pay.
  await typeSlow(page, 'adoptionPct', 20);
  await typeSlow(page, 'reworkSharePct', 40);
  await page.waitForTimeout(1500);

  // 2. Adoption measured at 70 %, rework down to 10 %: it pays back within the year.
  await typeSlow(page, 'adoptionPct', 70);
  await typeSlow(page, 'reworkSharePct', 10);
  await page.waitForTimeout(1500);

  // 3. A typo is caught field by field.
  await typeSlow(page, 'capturePct', 150);
  await page.waitForTimeout(1200);
  await typeSlow(page, 'capturePct', 50);

  // 4. Keep this calculation, then paste real timings: the kept one stays as a dotted line.
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await page.locator('#keep').scrollIntoViewIfNeeded();
  await page.click('#keep');
  await page.waitForTimeout(800);
  await page.locator('#m-before').scrollIntoViewIfNeeded();
  await page.click('#m-before');
  await page.keyboard.type('30 32 28 31 29 33 27 30 31 29', { delay: 35 });
  await page.click('#m-after');
  await page.keyboard.type('12 15 10 14 11 13 12 14 13 12', { delay: 35 });
  await page.waitForTimeout(1200);
  await page.click('#m-use');
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(2600);

  // 5. Copy the calculation for the value case, then switch to English.
  await page.locator('#copy-md').scrollIntoViewIfNeeded();
  await page.click('#copy-md');
  await page.waitForTimeout(1500);
  await page.click('#lang-en');
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await page.waitForTimeout(2500);

  const video = page.video();
  await context.close();
  await browser.close();
  fs.copyFileSync(await video.path(), out);
  console.log(out);
})();
