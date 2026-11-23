/** viewport-check.cjs — F1 平板断点导航 / F2 移动端折叠线 实证 */
const { chromium } = require('playwright');
const EXE = '/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  const browser = await chromium.launch({executablePath: EXE, args:['--no-sandbox']});
  const page = await browser.newPage();

  await page.setViewportSize({width:768,height:1024});
  await page.goto('https://cleanpaths.io/',{waitUntil:'networkidle',timeout:60000});
  const f1 = await page.evaluate(() => {
    const vis = el => { if(!el) return 'absent'; const s=getComputedStyle(el); const r=el.getBoundingClientRect(); return (s.display!=='none'&&s.visibility!=='hidden'&&r.width>0)?'VISIBLE':'hidden'; };
    const desk = document.querySelector('.main-nav .navlink--desktop') || document.querySelector('.main-nav a');
    const mob = document.querySelector('.nav-mobile');
    const navLinks = [...document.querySelectorAll('.main-nav a')].filter(a=>getComputedStyle(a).display!=='none').map(a=>a.textContent.trim());
    return {desktopLink: vis(desk), navMobile: vis(mob), visibleNavLinks: navLinks};
  });
  console.log('F1@768px:', JSON.stringify(f1));

  await page.setViewportSize({width:390,height:844});
  await page.goto('https://cleanpaths.io/',{waitUntil:'networkidle',timeout:60000});
  const f2 = await page.evaluate(() => {
    const dz = document.querySelector('[class*=dropzone],[id*=dropzone],[class*=upload]');
    const dzr = dz ? dz.getBoundingClientRect() : null;
    const btns = [...document.querySelectorAll('button, a')].filter(b=>/choose a file|browse|convert/i.test(b.textContent));
    const b0 = btns[0];
    const br = b0 ? b0.getBoundingClientRect() : null;
    return {viewportH: innerHeight,
      dropzoneTop: dzr?Math.round(dzr.top):null,
      buttonText: b0?b0.textContent.trim().slice(0,40):null,
      buttonTop: br?Math.round(br.top):null, buttonBottom: br?Math.round(br.bottom):null};
  });
  console.log('F2@390px:', JSON.stringify(f2));
  await browser.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
