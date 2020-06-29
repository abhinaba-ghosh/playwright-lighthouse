const fs = require('fs');
const lighthouseLib = require('lighthouse');
const ReportGenerator = require('lighthouse/lighthouse-core/report/report-generator');

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

// if removed, would be a breaking change
const getHtmlReport = async (lhr, dir, name) => {
  name = name.substr(0, name.lastIndexOf('.')) || name;
  const html = ReportGenerator.generateReport(lhr, 'html');
  try {
    await fs.mkdirSync(dir, { recursive: true });
    await fs.writeFileSync(`${dir}/${name}.html`, html);
  } catch (err) {
    throw err;
  }
};

const getReport = async (lhr, dir, name, type) => {
  const validTypes = ['csv', 'html', 'json'];
  name = name.substr(0, name.lastIndexOf('.')) || name;

  if (validTypes.includes(type)) {
    const reportBody = ReportGenerator.generateReport(lhr, type);
    try {
      await fs.mkdirSync(dir, {recursive: true });
      await fs.writeFileSync(`${dir}/${name}.${type}`, reportBody);
    } catch (err) {
      throw err;
    }
  } else {
    console.log(`Invalid report type specified: ${type} Skipping...)`)
    // throw new Error(`Invalid report type specified: ${type})`);
  }
};

exports.lighthouse = async ({
  url,
  thresholds,
  opts = {},
  config,
  reports,
  htmlReport,
  reportDir,
  reportName,
  cdpPort,
}) => {
  opts.port = cdpPort;

  if (!opts.onlyCategories) {
    opts.onlyCategories = Object.keys(thresholds);
  }

  const results = await lighthouseLib(
    url,
    { disableStorageReset: true, ...opts },
    config
  );
  const newValues = Object.keys(results.lhr.categories).reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: results.lhr.categories[curr].score * 100,
    }),
    {}
  );

  for (var typeFromKey in reports){
    var value = reports[typeFromKey];
    if (value) {
      await getReport(results.lhr, reportDir, reportName, typeFromKey);
    }
  }

  // leaving in order to avoid a breaking change
  if (htmlReport) {
    await getHtmlReport(results.lhr, reportDir, reportName);
  }

  return compare(thresholds, newValues);
};
