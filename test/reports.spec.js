const fs = require('fs');
const { playAudit } = require('../index');
const playwright = require('playwright');
const chai = require('chai')
const expect = chai.expect

describe('reports example', () => {
  it('writes json and html reports', async () => {
    const reportDirectory = `${process.cwd()}/lighthouse`;
    const reportFilename = `lighthouse-${new Date().getTime()}`;

    const browser = await playwright['chromium'].launch({
      args: ['--remote-debugging-port=9222'],
    });
    const page = await browser.newPage();
    await page.goto('https://angular.io/');

    await playAudit({
      reports: {
        formats: {
          json: true,
          html: true,
          csv: false
        },
        name: reportFilename,
        directory:  reportDirectory
      },
      page: page,
      thresholds: {
        performance: 50
      },
      port: 9222,
    });

    const jsonFile = reportDirectory +  "/" + reportFilename + ".json";
    expect(fs.existsSync(jsonFile), `${jsonFile} does not exist.`).to.be.true;

    const htmlFile = reportDirectory +  "/" + reportFilename + ".html";
    expect(fs.existsSync(jsonFile), `${htmlFile} does not exist.`).to.equal(true);

    await browser.close();
  });
});
