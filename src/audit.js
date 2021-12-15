const { lighthouse } = require('./task');
const chalk = require('chalk');
const uaParser = require('ua-parser-js');

const log = console.log;

const defaultThresholds = {
  performance: 100,
  accessibility: 100,
  'best-practices': 100,
  seo: 100,
  pwa: 100,
};

const defaultReports = {
  formats: {
    csv: false,
    html: false,
    json: false,
  },
  name: `lighthouse-${new Date().getTime()}`,
  directory: `${process.cwd()}/lighthouse`,
};

const VALID_BROWSERS = ['Chrome', 'Chromium', 'Canary'];

let playAudit = async function (auditConfig = {}) {
  if (!auditConfig.port || !auditConfig.page) {
    throw new Error(
      `port/page is not set in playwright lighthouse config. Refer to https://github.com/abhinaba-ghosh/playwright-lighthouse to have more information and set it by yourself :). `
    );
  }

  const ua = await auditConfig.page.evaluate(() => navigator.userAgent);
  const currentBrowserName = uaParser(ua).browser.name;

  if (!checkBrowserIsValid(currentBrowserName)) {
    throw new Error(`${currentBrowserName} is not supported. Skipping...`);
  }

  if (!auditConfig.thresholds) {
    log(
      chalk.yellow.italic(
        'playwright-lighthouse-audit',
        'It looks like you have not set thresholds yet. The test will be based on the 100 score for every metrics. Refer to https://github.com/abhinaba-ghosh/playwright-lighthouse to have more information and set thresholds by yourself :).'
      )
    );
  }

  const reportsConfig = {
    ...defaultReports,
    ...auditConfig.reports,
  };

  const { comparison, results } = await lighthouse({
    url: auditConfig.page.url(),
    thresholds: auditConfig.thresholds || defaultThresholds,
    opts: auditConfig.opts,
    config: auditConfig.config,
    reports: reportsConfig,
    cdpPort: auditConfig.port,
  });

  log('\n');
  log(chalk.blue('-------- playwright lighthouse audit reports --------'));
  log('\n');

  comparison.results.forEach((res) => {
    log(chalk.greenBright(res));
  });

  if (comparison.errors.length > 0) {
    const formateErrors = `\n\n${errors.join('\n')}`;

    const label =
    comparison.errors.length === 1
        ? `playwright lighthouse - A threshold is not matching the expectation.${formateErrors}`
        : `playwright lighthouse - Some thresholds are not matching the expectations.${formateErrors}`;
    throw new Error(label);
  }

  return results;
};

const checkBrowserIsValid = (browserName) => {
  const matches = VALID_BROWSERS.filter((pattern) => {
    return new RegExp(pattern).test(browserName);
  });

  if (matches.length > 0) {
    return true;
  }
  return false;
};

exports.playAudit = playAudit;
