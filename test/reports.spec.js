import fs from 'fs';
import { playAudit } from '../index.js';
import playwright from 'playwright-core';
import chai from 'chai';
const expect = chai.expect;

describe('reports example', () => {
  let reportDirectory, reportFilename, reportFileTypes, browser, page;

  before(async () => {
    reportDirectory = `${process.cwd()}/lighthouse`;
    reportFilename = 'reports-test';
    reportFileTypes = ['html', 'json'];
    reportFileTypes.forEach((type) => {
      var fileToDelete = `${reportDirectory}/${reportFilename}.${type}`;
      if (fs.existsSync(fileToDelete)) {
        fs.unlinkSync(fileToDelete);
      }
    });

    browser = await playwright['chromium'].launch({
      args: ['--remote-debugging-port=9222'],
    });
    page = await browser.newPage();
    await page.goto('https://angular.io/');
  });

  after(async () => {
    await browser.close();
  });

  it('writes json and html reports', async () => {
    const reportDirectory = `${process.cwd()}/lighthouse`;
    const reportFilename = 'reports-test';

    await playAudit({
      reports: {
        formats: {
          json: true,
          html: true,
          csv: false,
        },
        name: reportFilename,
        directory: reportDirectory,
      },
      page: page,
      thresholds: {
        performance: 30,
      },
      port: 9222,
    });

    reportFileTypes.forEach(() => {
      reportFileTypes.forEach((type) => {
        expect(
          fs.existsSync(`${reportDirectory}/${reportFilename}.${type}`),
          `${type} Report file does not exist.`,
        ).to.be.true;
      });
    });
  });
});
