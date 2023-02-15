const events = require('events');
const ReportGenerator = require('lighthouse/report/generator/report-generator');
const fs = require('fs/promises');

const VALID_BROWSERS = ['Chrome', 'Chromium', 'Canary'];

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

const patchPageObject = (page) => {
  page.target = function () {
    return {
      createCDPSession: async function () {
        const session = await page.context().newCDPSession(page);
        session.connection = () => new events.EventEmitter();
        return session;
      }
    }
  }
}

const checkBrowserIsValid = (browserName) => {
  const matches = VALID_BROWSERS.filter((pattern) => {
    return new RegExp(pattern).test(browserName);
  });

  if (matches.length > 0) {
    return true;
  }
  return false;
};

const compare = (thresholds, newValue) => {
  const errors = [];
  const results = [];

  Object.keys(thresholds).forEach((key) => {
    if (thresholds[key] > newValue[key]) {
      errors.push(
        `${key} record is ${newValue[key]} and is under the ${thresholds[key]} threshold`
      );
    } else {
      results.push(
        `${key} record is ${newValue[key]} and desired threshold was ${thresholds[key]}`
      );
    }
  });

  return { errors, results };
};

const getReport = async (lhr, dir, name, type) => {
  const validTypes = ['csv', 'html', 'json'];
  name = name.substr(0, name.lastIndexOf('.')) || name;

  if (validTypes.includes(type)) {
    const reportBody = ReportGenerator.generateReport(lhr, type);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/${name}.${type}`, reportBody);
  } else {
    console.log(`Invalid report type specified: ${type} Skipping Reports...)`);
  }
};

module.exports = {
  defaultReports,
  defaultThresholds,
  patchPageObject,
  checkBrowserIsValid,
  compare,
  getReport
}