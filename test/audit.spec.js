const { playAudit } = require('../index');
const playwright = require('playwright-core');

describe('audit example', () => {
  let browser, page;

  before(async () => {
    browser = await playwright['chromium'].launch({
      args: ['--remote-debugging-port=9223'],
    });
    page = await browser.newPage();
    await page.goto('https://angular.io/');
  });

  after(async () => {
    await browser.close();
  });

  it('audits page', async () => {
    await playAudit({
      page: page,
      thresholds: {
        performance: 30,
        accessibility: 50,
        'best-practices': 50,
        seo: 50,
        pwa: 50,
      },
      port: 9223,
    });
  });

  it('no logs, no page, no errors', async () => {
    await playAudit({
      page: 'https://angular.io/',
      thresholds: {
        performance: 100,
        accessibility: 100,
        'best-practices': 100,
        seo: 100,
        pwa: 100,
      },
      port: 9223,
      ignoreError: true,
      disableLogs: true,
    });
  });
});
