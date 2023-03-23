const fs = require('fs/promises');
const lighthouseLib = require('lighthouse');
const ReportGenerator = require('lighthouse/report/generator/report-generator');

const BSTACK_EXECUTION_FAILED = "Failed to execute Lighthouse on Browserstack";

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

exports.lighthouse = async ({
  page,
  url,
  thresholds,
  opts = {},
  config,
  reports,
  cdpPort,
}) => {
  opts.port = cdpPort;

  if (!opts.onlyCategories) {
    opts.onlyCategories = Object.keys(thresholds);
  }

  let results;
  if (process.env.LH_BROWSERSTACK == 'true') {
    const BSTACK_PARAMS = {
      action: 'lighthouse',
      arguments: { url: url, lhFlags: opts, lhConfig: config },
    };
    const response = await page.evaluate((_) => {},
    `browserstack_executor: ${JSON.stringify(BSTACK_PARAMS)}`);
    const { lhSuccess, data } = JSON.parse(response);
    if(lhSuccess == 'false') {
      throw new Error(BSTACK_EXECUTION_FAILED + ': ' + JSON.stringify(data));
    }
    results = data;
  } else {
    ({ lhr: results } = await lighthouseLib(
      url,
      { disableStorageReset: true, ...opts },
      config
    ));
  }

  const newValues = Object.keys(results.categories).reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: results.categories[curr].score * 100,
    }),
    {}
  );

  for (var typeFromKey in reports['formats']) {
    var value = reports['formats'][typeFromKey];
    if (value) {
      await getReport(
        results,
        reports['directory'],
        reports['name'],
        typeFromKey
      );
    }
  }

  const output = { comparison: compare(thresholds, newValues), results };
  return output;
};
