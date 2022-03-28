import { Page } from 'playwright-core';

export interface playwrightLighthouseConfig {
  page?: Page;
  url?: string;
  port: number;
  thresholds?: Record<string, number>;
  opts?: Record<string, any>;
  config?: Record<string, any>;
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
): Promise<any>;
