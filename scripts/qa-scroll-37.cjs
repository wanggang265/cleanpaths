// #37 verification: 7-breakpoint horizontal scroll test on / and /pt/jfif-para-jpg/
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const widths = [1440, 1280, 768, 414, 390, 375, 360, 320];
  const urls = ['http://localhost:8899/', 'http://localhost:8899/pt/jfif-para-jpg/'];
  let fail = 0;
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    for (const url of urls) {
      await page.goto(url, { waitUntil: 'networkidle' });
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      const iw = await page.evaluate(() => window.innerWidth);
      const pass = sw <= iw;
      if (!pass) fail++;
      console.log(`${url} @${w}px: scrollWidth=${sw} innerWidth=${iw} ${pass ? '✅' : '❌'}`);
    }
    await page.close();
  }
  await browser.close();
  console.log(fail === 0 ? 'ALL PASS' : `${fail} FAILURES`);
  process.exit(fail === 0 ? 0 : 1);
})();
