## Lighthouse Playwright - NPM Package

[![NPM release](https://img.shields.io/npm/v/playwright-lighthouse.svg 'NPM release')](https://www.npmjs.com/package/playwright-lighthouse)

[Lighthouse](https://developers.google.com/web/tools/lighthouse) is a tool developed by Google that analyzes web apps and web pages, collecting modern performance metrics and insights on developer best practices.

[Playwright](https://www.npmjs.com/package/playwright) is a Node library to automate Chromium, Firefox and WebKit with a single API. Playwright is built to enable cross-browser web automation that is ever-green, capable, reliable and fast.

The purpose of this package is to produce web audit report for several pages in connected mode and in an automated (programmatic) way.

## Usage

### Installation

You can have to add the `playwright-lighthouse` library as a dependency (or dev-dependency) in your project

```sh
$ yarn add -D playwright-lighthouse
# or
$ npm install --save-dev playwright-lighthouse
```

### In your code

After completion of the Installation, you can use `playwright-lighthouse` in your code to audit the current page.

In your test code you need to import `playwright-lighthouse` and assign a `port` for the lighthouse scan. You can choose any non-allocated port.

```js
const { playAudit } = require('playwright-lighthouse');
const playwright = require('playwright');

describe('audit example', () => {
  it('open browser', async () => {
    const browser = await playwright['chromium'].launch({
      args: ['--remote-debugging-port=9222'],
    });
    const page = await browser.newPage();
    await page.goto('https://angular.io/');

    await playAudit({
      page: page,
      port: 9222,
    });

    await browser.close();
  });
});
```

## Thresholds per tests

If you don't provide any threshold argument to the `playAudit` command, the test will fail if at least one of your metrics is under `100`.

You can make assumptions on the different metrics by passing an object as argument to the `playAudit` command:

```javascript
const { playAudit } = require('playwright-lighthouse');
const playwright = require('playwright');

describe('audit example', () => {
  it('open browser', async () => {
    const browser = await playwright['chromium'].launch({
      args: ['--remote-debugging-port=9222'],
    });
    const page = await browser.newPage();
    await page.goto('https://angular.io/');

    await playAudit({
      page: page,
      thresholds: {
        performance: 50,
        accessibility: 50,
        'best-practices': 50,
        seo: 50,
        pwa: 50,
      },
      port: 9222,
    });

    await browser.close();
  });
});
```

If the Lighthouse analysis returns scores that are under the one set in arguments, the test will fail.

You can also make assumptions only on certain metrics. For example, the following test will **only** verify the "correctness" of the `performance` metric:

```javascript
await playAudit({
  page: page,
  thresholds: {
    performance: 85,
  },
  port: 9222,
});
```

This test will fail only when the `performance` metric provided by Lighthouse will be under `85`.

## Passing different Lighthouse config to playwright-lighthouse directly

You can also pass any argument directly to the Lighthouse module using the second and third options of the command:

```js
const thresholdsConfig = {
  /* ... */
};

const lighthouseOptions = {
  /* ... your lighthouse options */
};

const lighthouseConfig = {
  /* ... your lighthouse configs */
};

await playAudit({
  thresholds: thresholdsConfig,
  opts: lighthouseOptions,
  config: lighthouseConfig,

  /* ... other configurations */
});
```

## Generating audit reports

`playwright-lighthouse` library can produce  Lighthouse CSV, HTML and JSON audit reports, that you can host in your CI server. These reports can be useful for ongoing audits and monitoring from build to build.

```js
await playAudit({
  /* ... other configurations */

  reports: {
    formats: {
      json: true, //defaults to false
      html: true, //defaults to false
      csv: true //defaults to false
    },
  },
  name: `name-of-the-report`, //defaults to `lighthouse-${new Date().getTime()}`
  directory:  `path/to/directory`, //defaults to `${process.cwd()}/lighthouse`
});
```

Sample HTML report:

![screen](./docs/lighthouse_report.png)

## Tell me your issues

you can raise any issue [here](https://github.com/abhinaba-ghosh/playwright-lighthouse/issues)

## Before you go

If it works for you , give a [Star](https://github.com/abhinaba-ghosh/playwright-lighthouse)! :star:

_- Copyright &copy; 2020- [Abhinaba Ghosh](https://www.linkedin.com/in/abhinaba-ghosh-9a2ab8a0/)_
