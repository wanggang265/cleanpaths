const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const w of [375, 320, 1440]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto('http://localhost:8899/pt/jfif-para-jpg/', { waitUntil: 'networkidle' });
    const info = await page.evaluate(() => {
      return [...document.querySelectorAll('.hero .badge')].map((b) => {
        const r = b.getBoundingClientRect();
        return { text: b.textContent.slice(0, 30), x: Math.round(r.x), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) };
      });
    });
    console.log(`@${w}px viewport:`);
    info.forEach((b) => console.log(`  badge "${b.text}…" x=${b.x} right=${b.right} w=${b.w} h=${b.h} ${b.right <= w ? '✅' : '❌ OVERFLOW'}`));
    await page.close();
  }
  await browser.close();
})();
