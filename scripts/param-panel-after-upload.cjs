/** param-panel-after-upload — 选文件后控件盘点 */
const { chromium } = require('playwright');
const EXE = '/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  const browser = await chromium.launch({executablePath: EXE, args:['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://cleanpaths.io/png-to-dxf/',{waitUntil:'networkidle',timeout:60000});
  const fi = await page.$('input[type=file]');
  await fi.setInputFiles('/tmp/t.png');
  await page.waitForTimeout(8000); // 等引擎+渲染
  const r = await page.evaluate(() => {
    const ctl = [...document.querySelectorAll('input,select')].map(el=>({tag:el.tagName,type:el.type||null,id:el.id||null,aria:el.getAttribute('aria-label'),label:el.closest('label')?el.closest('label').textContent.trim().slice(0,50):null,visible:!!(el.getBoundingClientRect().width)}));
    return {controls: ctl, sliders: document.querySelectorAll('input[type=range]').length,
      hasParam: !!document.querySelector('[id*=param],[class*=param]'),
      mmMentions: (document.body.innerText.match(/\b\d+(\.\d+)?\s*mm\b/g)||[]).slice(0,6)};
  });
  console.log(JSON.stringify(r,null,1));
  await browser.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
