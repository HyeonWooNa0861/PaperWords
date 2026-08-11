import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PAPERWORDS_PLAYWRIGHT_PORT ?? 4311);
const host = "127.0.0.1";
const baseURL = `http://${host}:${port}`;
const browserChannel = process.env.PAPERWORDS_PLAYWRIGHT_CHANNEL ?? "chrome";
const webServerStateFile = `output/playwright/web-server-${port}.json`;
const webServerCommand = [
  "exec",
  shellQuote(process.execPath),
  "scripts/playwright-web-server.mjs",
  "--hostname",
  shellQuote(host),
  "--port",
  String(port),
  "--cwd",
  shellQuote(process.cwd()),
  "--state",
  shellQuote(webServerStateFile)
].join(" ");

export default defineConfig({
  testDir: "./e2e",
  outputDir: "output/playwright/test-results",
  reporter: [["list"], ["html", { outputFolder: "output/playwright/report", open: "never" }]],
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer: false,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    timeout: 120_000
  },
  projects: [
    {
      name: "e2e-desktop",
      testMatch: /core\.spec\.ts/,
      use: {
        browserName: "chromium",
        channel: browserChannel,
        viewport: { width: 1280, height: 900 }
      }
    },
    {
      name: "e2e-mobile",
      testMatch: /core\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
        channel: browserChannel
      }
    },
    {
      name: "pwa",
      testMatch: /pwa\.spec\.ts/,
      use: {
        browserName: "chromium",
        channel: browserChannel,
        viewport: { width: 1280, height: 900 }
      }
    },
    {
      name: "a11y-desktop",
      testMatch: /a11y\.spec\.ts/,
      use: {
        browserName: "chromium",
        channel: browserChannel,
        viewport: { width: 1280, height: 900 }
      }
    },
    {
      name: "a11y-mobile",
      testMatch: /a11y\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
        channel: browserChannel
      }
    },
    {
      name: "seo",
      testMatch: /seo\.spec\.ts/,
      use: {
        browserName: "chromium",
        channel: browserChannel,
        viewport: { width: 1280, height: 900 }
      }
    }
  ]
});

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
