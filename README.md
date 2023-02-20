## Lighthouse Playwright - NPM Package

[![NPM release](https://img.shields.io/npm/v/playwright-lighthouse.svg 'NPM release')](https://www.npmjs.com/package/playwright-lighthouse)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![NPM Downloads](https://img.shields.io/npm/dt/playwright-lighthouse.svg?style=flat-square)](https://www.npmjs.com/package/playwright-lighthouse)

[Lighthouse](https://developers.google.com/web/tools/lighthouse) is a tool developed by Google that analyzes web apps and web pages, collecting modern performance metrics and insights on developer best practices.

[Playwright](https://www.npmjs.com/package/playwright) is a Node library to automate Chromium, Firefox and WebKit with a single API. Playwright is built to enable cross-browser web automation that is ever-green, capable, reliable and fast.

The purpose of this package is to produce web audit report for several pages in connected mode and in an automated (programmatic) way.

## Usage

### Installation

Add the `playwright-lighthouse`, `playwright` & `lighthouse` libraries to your project:

```sh
$ yarn add -D playwright-lighthouse playwright lighthouse
# or
$ npm install --save-dev playwright-lighthouse playwright lighthouse
```

### In your code

After completion of the Installation, you can use `playwright-lighthouse` in your code to audit the current page.

In your test code you need to import `playwright-lighthouse` and pass the `page` for the lighthouse scan. The tests will be executed in the very same `page` passed to `playAudit`.

```js
const { playAudit } = require('playwright-lighthouse');
const playwright = require('playwright');

describe('audit example', () => {
  it('open browser', async () => {
    const browser = await playwright['chromium'].launch();
    const page = await browser.newPage();
    await page.goto('https://www.github.com');

    await playAudit({
      page: page,
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
    const browser = await playwright['chromium'].launch();
    const page = await browser.newPage();
    await page.goto('https://www.github.com');

    await playAudit({
      page: page,
      thresholds: {
        performance: 50,
        accessibility: 50,
        'best-practices': 50,
        seo: 50,
        pwa: 50,
      },
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
  }
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

You can pass default lighthouse configs like so:

```js
import lighthouseDesktopConfig from 'lighthouse/lighthouse-core/config/lr-desktop-config';

await playAudit({
  thresholds: thresholdsConfig,
  opts: lighthouseOptions,
  config: lighthouseDesktopConfig,

  /* ... other configurations */
});
```

Sometimes it's important to pass a parameter _disableStorageReset_ as false. You can easily make it like this:

```js
const opts = {
  disableStorageReset: false,
};

await playAudit({
  page,
  opts,
});
```

## Running lighthouse on authenticated routes

Since `playAudit` utilises the `page` object of playwright for its tests, we can utilise the same authenticated `page` for lighthouse tests. Consequently we can also perform lighthouse tests on device clouds such as Browserstack using the playwright connect method.

### Running lighthouse with device clouds and authenticated pages
```js
const { playAudit } = require('playwright-lighthouse');
const playwright = require('playwright');
import { test, expect } from '@playwright/test';

describe('audit example', () => {
  it('open browser', async () => {
    const browser = await playwright['chromium'].connect(`wss://cdp.browserstack.com/...`);
    const page = await browser.newPage({
      ignoreHTTPSErrors: true,
      httpCredentials: { username: "admin", password: "admin" }
    });
    await page.goto('https://the-internet.herokuapp.com/basic_auth');

    await playAudit({
      page: page,
      thresholds: {
        performance: 50,
        accessibility: 50,
        'best-practices': 50,
        seo: 50,
        pwa: 50,
      },
    });

    await browser.close();
  });
});
```

### Running lighthouse with persistent context

Playwright by default does not share any context (eg auth state) between pages. To persist auth state you need to use a persistent context:

```js
const os = require('os');
const { playAudit } = require('playwright-lighthouse');
const { chromium } = require('playwright');

describe('audit example', () => {
  it('open browser', async () => {
    const userDataDir = path.join(os.tmpdir(), 'pw', String(Math.random()));
    const context = await chromium.launchPersistentContext(userDataDir);
    const page = await context.newPage();
    await page.goto('http://localhost:3000/');

    // Perform login steps here which will save to cookie or localStorage

    // When lighthouse opens a new page the storage will be persisted meaning the new page will have the same user session
    await playAudit({
      page: page,
    });

    await context.close();
  });
});
```

Clean up the tmp directories on playwright teardown:

```ts
import rimraf from 'rimraf';
import os from 'os';
import path from 'path';

function globalSetup() {
  return () => {
    const tmpDirPath = path.join(os.tmpdir(), 'pw');
    rimraf(tmpDirPath, console.log);
  };
}

export default globalSetup;
```

## Usage with Playwright Test Runner

```ts
import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import { playAudit } from 'playwright-lighthouse';
import { test as base } from '@playwright/test';

export const lighthouseTest = base.extend<
  {},
  { browser: Browser }
>({
  browser: [
    async ({ }, use) => {
      const browser = await chromium.launch();
      await use(browser);
    },
    { scope: 'worker' },
  ],
});

lighthouseTest.describe('Lighthouse', () => {
  lighthouseTest('should pass lighthouse tests', async ({ page }) => {
    await page.goto('http://example.com');
    await page.waitForSelector('#some-element');
    await playAudit({
      page,
    });
  });
});
```

### Running lighthouse on authenticated routes with the test runner and persistent context

```ts
import os from 'os';
import { BrowserContext, chromium, Page } from 'playwright';
import { test as base } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

export const lighthouseTest = base.extend<
  {
    authenticatedPage: Page;
    context: BrowserContext;
  },
  {}
>({
  // As lighthouse opens a new page, and as playwright does not by default allow
  // shared contexts, we need to explicitly create a persistent context to
  // allow lighthouse to run behind authenticated routes.
  context: [
    async ({}, use) => {
      const userDataDir = path.join(os.tmpdir(), 'pw', String(Math.random()));
      const context = await chromium.launchPersistentContext(userDataDir);
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  authenticatedPage: [
    async ({ context, page }, use) => {
      // Mock any requests on the entire context
      await context.route('https://example.com/token', (route) => {
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            // ...
          }),
          headers: {
            // ...
          },
        });
      });

      await page.goto('http://localhost:3000');

      // Setup your auth state by inserting cookies or localStorage values
      await insertAuthState(page);

      await use(page);
    },
    { scope: 'test' },
  ],
});

lighthouseTest.describe('Authenticated route', () => {
  lighthouseTest(
    'should pass lighthouse tests',
    async ({ authenticatedPage: page }) => {
      await page.goto('http://localhost:3000/my-profile');
      await playAudit({
        page,
      });
    }
  );
});
```

### Running lighthouse on authenticated routes with globalSetup

In case you have a [`globalSetup`](https://playwright.dev/docs/test-auth) script in your test you might want to reuse saved state instead of running auth before every test.  
Additionally, you may pass `url` instead of `page` to speedup execution and save resources.

```ts
import os from 'os';
import path from 'path';
import { chromium, test as base } from '@playwright/test';
import type { BrowserContext } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

export const lighthouseTest = base.extend<
  { context: BrowserContext }
>({
  context: [
    async ({ launchOptions }, use) => {
      const userDataDir = path.join(os.tmpdir(), 'pw', String(Math.random()));
      const context = await chromium.launchPersistentContext(userDataDir, {
        args: [
          ...(launchOptions.args || []),
        ],
      });

      // apply state previously saved in the the `globalSetup`
      await context.addCookies(require('../../state-chrome.json').cookies);

      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
});

lighthouseTest.describe('Authenticated route after globalSetup', () => {
  lighthouseTest('should pass lighthouse tests', async ({ context }) => {
    // We need to pass in page object to playAudt
    // We can create a new page from the context and pass it to playAudit specifically for lighthouse tests
    const page = await context.newPage();
    await playAudit({
      url: 'http://localhost:3000/my-profile',
      page: page
    });
  });
});
```

## Generating audit reports

`playwright-lighthouse` library can produce Lighthouse CSV, HTML and JSON audit reports, that you can host in your CI server. These reports can be useful for ongoing audits and monitoring from build to build.

```js
await playAudit({
  /* ... other configurations */

  reports: {
    formats: {
      json: true, //defaults to false
      html: true, //defaults to false
      csv: true, //defaults to false
    },
    name: `name-of-the-report`, //defaults to `lighthouse-${new Date().getTime()}`
    directory: `path/to/directory`, //defaults to `${process.cwd()}/lighthouse`
  },
});
```

Sample HTML report:

![screen](./docs/lighthouse_report.png)

playAudit function also provides a promise that resolves with the Lighthouse result object containing the LHR (Lighthouse report in JSON format).

```js
const lighthouseReport = await playAudit({
  /* ... configurations */
}); // lightHouse report contains the report results
```

## Tell me your issues

you can raise any issue [here](https://github.com/abhinaba-ghosh/playwright-lighthouse/issues)

## Before you go

If it works for you , give a [Star](https://github.com/abhinaba-ghosh/playwright-lighthouse)! :star:

_- Copyright &copy; 2020- [Abhinaba Ghosh](https://www.linkedin.com/in/abhinaba-ghosh-9a2ab8a0/)_
