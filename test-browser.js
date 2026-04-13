import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 10000 });
    
    const messages = await page.$$eval('.chat-ui-virtualizer-row', rows => rows.length);
    console.log('MSG_COUNT:', messages);

    const btnWrapper = await page.$eval('.dev-controls-wrapper', el => {
      const computed = window.getComputedStyle(el);
      return {
        justifyContent: computed.justifyContent,
        display: computed.display,
        flexWrap: computed.flexWrap
      };
    }).catch(e => e.message);
    console.log('BTN_WRAPPER:', btnWrapper);

    const chatHtml = await page.$eval('.chat-ui-root', el => el.outerHTML).catch(e => e.message);
    const htmlLen = chatHtml.length || 0;
    console.log('CHAT_UI_HTML_LENGTH:', htmlLen);
    console.log('CHAT_UI_HTML:', chatHtml.substring(0, 500));

  } catch (err) {
    console.log('ERROR:', err.message);
  } finally {
    await browser.close();
  }
})();
