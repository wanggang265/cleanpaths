/** param-panel-check — F8: /png-to-dxf/ 浏览器实际渲染的控件盘点 */
const { chromium } = require('playwright');
const EXE = '/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  const browser = await chromium.launch({executablePath: EXE, args:['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://cleanpaths.io/png-to-dxf/',{waitUntil:'networkidle',timeout:60000});
  const r = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input,select')].map(el=>({tag:el.tagName,type:el.type||null,id:el.id||null,name:el.name||null,aria:el.getAttribute('aria-label'),visible:!!(el.getBoundingClientRect().width)}));
    const sliders = document.querySelectorAll('input[type=range]').length;
    const paramPanel = !!document.querySelector('[id*=param],[class*=param]');
    const mmText = (document.body.innerText.match(/\b\d+\s*mm/g)||[]).slice(0,8);
    return {inputs, sliders, paramPanelNode: paramPanel, mmText};
  });
  console.log(JSON.stringify(r,null,1));
  await browser.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
