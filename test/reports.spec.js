const { playAudit } = require('../index');
const playwright = require('playwright');

describe('reports example', () => {
  it('writes reports', async () => {
    const browser = await playwright['chromium'].launch({
      args: ['--remote-debugging-port=9222'],
    });
    const page = await browser.newPage();
    await page.goto('https://angular.io/');

    await playAudit({
      reports: {
        json: true,
        html: true,
        csv: true
      },
      page: page,
      thresholds: {
        performance: 50
      },
      port: 9222,
    });

    await browser.close();
  });
});
