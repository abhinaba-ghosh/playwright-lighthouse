const { playAudit } = require('../index');
const playwright = require('playwright-core');
const { expect } = require('chai');

describe('audit example', () => {
  let browser, page;

  before(async () => {
    browser = await playwright['chromium'].launch();
    page = await browser.newPage();
    await page.goto('https://www.google.com/');
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
    });
  });

  it('no logs, no page, no errors', async () => {
    const result = await playAudit({
      url: 'https://www.google.com/',
      page: page,
      thresholds: {
        performance: 100,
        accessibility: 100,
        'best-practices': 100,
        seo: 100,
        pwa: 100,
      },
      ignoreError: true,
      disableLogs: true,
    });
    expect(typeof result.comparisonError).to.equal('string');
  });
});
