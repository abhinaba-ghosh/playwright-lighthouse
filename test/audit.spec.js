const { playAudit } = require('../index');
const playwright = require('playwright');

describe('audit example', () => {
  it('open browser', async () => {
    const browser = await playwright['chromium'].launch({
      args: ['--remote-debugging-port=9222'],
    });
    const page = await browser.newPage();
    await page.goto('https://angular.io/');

    await playAudit({
      page: page,
      thresholds: {
        performance: 50,
        accessibility: 50,
        'best-practices': 50,
        seo: 50,
        pwa: 50,
      },
      port: 9222,
    });

    await browser.close();
  });
});
