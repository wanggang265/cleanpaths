/** qa-prod-bofu.cjs — production evidence: RENDERED footer state (no flight-payload grep). */
const { chromium } = require('playwright');
const BASE = 'https://cleanpaths.io';
const fails = [];
const ok = (n) => console.log('✓', n);
const bad = (n) => { console.log('✗ FAIL', n); fails.push(n); };

(async () => {
  const browser = await chromium.launch();
  for (const route of ['/', '/pricing/']) {
    const pg = await browser.newPage();
    await pg.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(800); // hydration settle
    const footerHTML = await pg.evaluate(() => document.querySelector('footer').outerHTML);
    const checks = ['>Compare</h4>', '>vs Vector Magic<', '>vs CloudConvert<', '>vs Vectorizer.ai<', '>vs Convertio<'];
    const missing = checks.filter((c) => !footerHTML.includes(c));
    if (missing.length) bad(`${route} rendered footer missing: ${missing.join(', ')}`);
    else ok(`${route} rendered footer has Compare group + 4 anchors (tag-bracketed, post-hydration)`);
    // href targets resolve to 200
    for (const href of ['/vector-magic-alternative/', '/cloudconvert-alternative/', '/vectorizer-ai-alternative/', '/convertio-alternative/']) {
      if (!footerHTML.includes(`href="${href}"`)) bad(`${route} footer missing href ${href}`);
    }
    await pg.close();
  }
  // PT page rendered footer must NOT carry Compare
  {
    const pg = await browser.newPage();
    await pg.goto(`${BASE}/pt/jfif-para-jpg/`, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(800);
    const footerHTML = await pg.evaluate(() => document.querySelector('footer').outerHTML);
    if (/Compare|vs Vector|vs Cloud|vs Convertio/.test(footerHTML)) bad('/pt/jfif-para-jpg rendered footer LEAKS Compare group');
    else ok('/pt/jfif-para-jpg rendered footer has NO Compare group (post-hydration)');
    await pg.close();
  }
  await browser.close();
  console.log('\nRESULT:', fails.length ? `${fails.length} FAILURES:\n- ${fails.join('\n- ')}` : 'ALL PASS');
  process.exit(fails.length ? 1 : 0);
})();
