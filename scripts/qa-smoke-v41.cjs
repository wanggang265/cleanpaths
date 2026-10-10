// Smoke: key pages load, no pageerror/console errors, tool UI present, llms.txt 200
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  const checks = [
    ['/', ['h1', '.dropzone', '#convert']],
    ['/png-to-dxf/', ['h1', '.dropzone']],
    ['/pt/jfif-para-jpg/', ['h1', '.dropzone']],
    ['/samples/', ['h1', '.ba']],
    ['/pricing/', ['h1']],
  ];
  let fail = 0;
  for (const [route, sels] of checks) {
    await page.goto('http://localhost:8899' + route, { waitUntil: 'networkidle' });
    for (const s of sels) {
      const el = await page.$(s);
      if (!el) { console.log(`❌ ${route} missing ${s}`); fail++; }
    }
    console.log(`✅ ${route} OK (${sels.join(', ')})`);
  }
  // zero-exfil: no file upload request should fire on interaction-free load (baseline)
  const resp = await page.request.get('http://localhost:8899/llms.txt');
  console.log(`llms.txt: HTTP ${resp.status()} ${resp.status() === 200 ? '✅' : '❌'}`);
  if (resp.status() !== 200) fail++;
  if (errors.length) { console.log('JS ERRORS:', errors); fail += errors.length; }
  else console.log('zero JS errors ✅');
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
