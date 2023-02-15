const lighthouseLib = require('lighthouse/lighthouse-core/fraggle-rock/api.js');
const { compare, getReport } = require('./util')

exports.lighthouse = async ({
  url,
  page,
  thresholds,
  opts = {},
  config,
  reports
}) => {
  if (!opts.onlyCategories) {
    opts.onlyCategories = Object.keys(thresholds);
  }

  const lighthouseOpts = {
    page,
    config: config,
    configContext: { disableStorageReset: true, ...opts },
  }

  const results = await lighthouseLib.navigation(
    url,
    lighthouseOpts
  )

  const newValues = Object.keys(results.lhr.categories).reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: results.lhr.categories[curr].score * 100,
    }),
    {}
  );

  for (var typeFromKey in reports['formats']) {
    var value = reports['formats'][typeFromKey];
    if (value) {
      await getReport(
        results.lhr,
        reports['directory'],
        reports['name'],
        typeFromKey
      );
    }
  }

  const output = { comparison: compare(thresholds, newValues), results };
  return output;
};
