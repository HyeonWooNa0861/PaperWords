import type { BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export async function blockExternalRequests(context: BrowserContext): Promise<void> {
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if ((url.protocol === "http:" || url.protocol === "https:") && !LOCAL_HOSTNAMES.has(url.hostname)) {
      await route.abort("blockedbyclient");
      return;
    }

    await route.continue();
  });
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  expect(overflow).toBeLessThanOrEqual(1);
}
