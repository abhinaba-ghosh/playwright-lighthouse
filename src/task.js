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

const getHtmlReport = async (lhr, dir, name) => {
  const html = ReportGenerator.generateReport(lhr, 'html');
  try {
    await fs.mkdirSync(dir, { recursive: true });
    await fs.writeFileSync(`${dir}/${name}`, html);
  } catch (err) {
    throw err;
  }
};

exports.lighthouse = async ({
  url,
  thresholds,
  opts = {},
  config,
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

  if (htmlReport) {
    await getHtmlReport(results.lhr, reportDir, reportName);
  }

  return compare(thresholds, newValues);
};
