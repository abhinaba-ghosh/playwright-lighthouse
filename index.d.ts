import type { Page } from 'playwright-core';
import type { Flags, Config, RunnerResult } from 'lighthouse';

export interface playwrightLighthouseConfig {
  page?: Page;
  url?: string;
  port: number;
  thresholds?: {
    performance?: number;
    accessibility?: number;
    'best-practices'?: number;
    seo?: number;
    pwa?: number;
  };
  opts?: Flags;
  config?: Config;
  reports?: {
    formats?: {
      html?: boolean;
      json?: boolean;
      csv?: boolean;
    };
    directory?: string;
    name?: string;
  };
  ignoreError?: boolean;
  disableLogs?: boolean;
  ignoreBrowserName?: boolean;
}

export interface playwrightLighthouseResult extends RunnerResult {
  comparison?: string;
  comparisonError?: string;
}

/**
 * @description
 * Performs lighthouse audit based on the testcafe lighthouse configuration
 *
 * @example
 *
 * import { playAudit } from 'playwright-lighthouse';
 *
 * test('user page performance with specific thresholds', async () => {
 *      await playAudit({
 *              page:Page,
 *              thresholds: {
 *                  performance: 50,
 *                  accessibility: 50,
 *                  'best-practices': 50,
 *                  seo: 50,
 *                  pwa: 50,
 *               },
 *              port: 9222
 *      });
 * });
 *
 */
export function playAudit(
  playwrightLHConfiguration: playwrightLighthouseConfig
): Promise<playwrightLighthouseResult>;
