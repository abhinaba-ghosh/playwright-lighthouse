import { Page } from 'playwright';

export interface playwrightLighthouseConfig {
  page: Page;
  port: number;
  thresholds?: any;
  opts?: any;
  config?: any;
  htmlReport?: boolean;
  reportDir?: string;
  reportName?: string;
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
): Promise<void>;
