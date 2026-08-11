import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { blockExternalRequests } from "./helpers/network";
import {
  expectActiveController,
  expectCacheVersion,
  expectRenderedPwaVersion,
  expectNoCacheVersion,
  expectStoredPwaVersion,
  getServiceWorkerControlState,
  installPwaTemporalInstrumentation,
  preparePwaVersionFile,
  readPwaTemporalEvents,
  removePwaVersionFile,
  resetPwaTemporalEvents,
  waitForServiceWorkerControl,
  writeMalformedPwaVersionFile,
  writePwaVersionPayload,
  writePwaVersion
} from "./helpers/pwa";
import { PAPERWORDS_PWA_DEFAULT_VERSIONS, type PaperWordsPwaVersions } from "@/src/lib/pwa/version";

const versionA: PaperWordsPwaVersions = {
  appVersion: "0.1.0-test-a",
  contentVersion: "paperwords-content-test-a",
  cacheVersion: "paperwords-cache-test-a"
};

const versionB: PaperWordsPwaVersions = {
  appVersion: "0.1.0-test-b",
  contentVersion: "paperwords-content-test-b",
  cacheVersion: "paperwords-cache-test-b"
};

test.beforeEach(async ({ context }) => {
  await blockExternalRequests(context);
  await preparePwaVersionFile(versionA);
});

test("manifest and service-worker route expose the required install contract", async ({ request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.name).toBe("PaperWords");
  expect(manifest.short_name).toBe("PaperWords");
  expect(manifest.start_url).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ src: "/icons/icon-192.png", sizes: "192x192" }),
      expect.objectContaining({ src: "/icons/icon-512.png", sizes: "512x512" }),
      expect.objectContaining({ src: "/icons/maskable-512.png", purpose: "maskable" })
    ])
  );

  const workerResponse = await request.get("/sw.js");
  expect(workerResponse.ok()).toBe(true);
  expect(workerResponse.headers()["content-type"]).toContain("application/javascript");
  expect(workerResponse.headers()["cache-control"]).toContain("no-store");
  expect(workerResponse.headers()["service-worker-allowed"]).toBe("/");
  const workerBody = await workerResponse.text();
  expect(workerBody).toContain("SKIP_WAITING");
  expect(workerBody).toContain("PAPERWORDS_VERSION");
  expect(workerBody).toContain('request.method !== "GET"');
  expect(workerBody).not.toContain("http://");
  expect(workerBody).not.toContain("https://");
});

test("configured missing service-worker version file fails explicitly", async ({ request }) => {
  await removePwaVersionFile();

  await expectVersionFileFailure(request);
});

test("configured malformed service-worker version file fails explicitly", async ({ request }) => {
  await writeMalformedPwaVersionFile();

  await expectVersionFileFailure(request);
});

test("configured type-invalid service-worker version file fails explicitly", async ({ request }) => {
  await writePwaVersionPayload({ appVersion: 1 });

  await expectVersionFileFailure(request);
});

test("configured unknown-key service-worker version file fails explicitly", async ({ request }) => {
  await writePwaVersionPayload({ appVersion: "0.1.0-test-extra", extraVersion: "not-allowed" });

  await expectVersionFileFailure(request);
});

test("configured partial string service-worker version file remains valid", async ({ request }) => {
  await writePwaVersionPayload({ contentVersion: "paperwords-content-partial" });

  const workerResponse = await request.get("/sw.js");

  expect(workerResponse.ok()).toBe(true);
  expect(workerResponse.headers()["x-paperwords-app-version"]).toBe(PAPERWORDS_PWA_DEFAULT_VERSIONS.appVersion);
  expect(workerResponse.headers()["x-paperwords-content-version"]).toBe("paperwords-content-partial");
  expect(workerResponse.headers()["x-paperwords-cache-version"]).toBe(PAPERWORDS_PWA_DEFAULT_VERSIONS.cacheVersion);
  const workerBody = await workerResponse.text();
  expect(workerBody).toContain("PAPERWORDS_VERSION");
});

test("offline app shell serves cached pages, search shell, visited term, and fallback", async ({ page, context }) => {
  await writePwaVersion(versionA);

  await page.goto("/");
  await waitForServiceWorkerControl(page);
  await expectCacheVersion(page, versionA);

  await page.goto("/dictionary?q=양자화");
  await expect(page.getByText(/개 결과/)).toBeVisible();
  await page.goto("/terms/neural-network-quantization");
  await expect(page.getByRole("heading", { name: /Neural Network Quantization/i })).toBeVisible();
  await page.goto("/~offline");
  await expect(page.getByRole("heading", { name: "오프라인 fallback" })).toBeVisible();

  await context.setOffline(true);
  await page.goto("/");
  await expect(page.getByText("오늘의 논문 용어")).toBeVisible();
  await page.goto("/dictionary?q=양자화");
  await expect(page.getByRole("heading", { name: "검증된 논문 용어 검색" })).toBeVisible();
  await page.goto("/terms/neural-network-quantization");
  await expect(page.getByRole("heading", { name: /Neural Network Quantization/i })).toBeVisible();
  await page.goto("/~offline");
  await expect(page.getByRole("heading", { name: "오프라인 fallback" })).toBeVisible();
  await page.goto("/terms/not-cached-before-offline");
  await expect(page.getByRole("heading", { name: "오프라인 fallback" })).toBeVisible();
});

test("version B waits, activates only after click, deletes stale caches, and keeps fallback", async ({
  page,
  context
}) => {
  await writePwaVersion(versionA);
  await installPwaTemporalInstrumentation(page);
  await page.goto("/");
  await waitForServiceWorkerControl(page);
  await expectCacheVersion(page, versionA);
  await expectActiveController(page);
  await expectStoredPwaVersion(page, versionA);
  await expectRenderedPwaVersion(page, versionA);
  await resetPwaTemporalEvents(page);

  await writePwaVersion(versionB);
  const stateBeforeUpdate = await getServiceWorkerControlState(page);
  expect(stateBeforeUpdate).toMatchObject({
    activeState: "activated",
    controllerState: "activated",
    hasController: true,
    waitingState: null
  });

  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration("/");
    await registration?.update();
  });

  const updateButton = page.getByRole("button", { name: "업데이트 적용" });
  await expect(updateButton).toBeVisible();
  await expect(page.locator(".pwa-banner", { hasText: "paperwords-content-test-b" })).toBeAttached();
  await expectStoredPwaVersion(page, versionB);
  await expectCacheVersion(page, versionA);

  await page.waitForTimeout(250);
  const eventsBeforeAction = await readPwaTemporalEvents(page);
  expect(eventsBeforeAction.filter((event) => event.type === "document")).toHaveLength(0);
  expect(eventsBeforeAction.filter((event) => event.type === "controllerchange")).toHaveLength(0);

  const stateBeforeAction = await getServiceWorkerControlState(page);
  expect(stateBeforeAction.controllerScriptURL).toBe(stateBeforeUpdate.controllerScriptURL);
  expect(stateBeforeAction).toMatchObject({
    activeState: "activated",
    controllerState: "activated",
    hasController: true,
    waitingState: "installed"
  });

  const reloadPromise = page.waitForEvent("framenavigated", (frame) => {
    return frame === page.mainFrame() && new URL(frame.url()).pathname === "/";
  });
  await updateButton.focus();
  await page.keyboard.press("Enter");
  await reloadPromise;
  await page.waitForLoadState("networkidle");
  await waitForServiceWorkerControl(page);
  await expect
    .poll(async () => {
      const events = await readPwaTemporalEvents(page);
      return {
        controllerchanges: events.filter((event) => event.type === "controllerchange").length,
        documents: events.filter((event) => event.type === "document").length
      };
    }, {
      message: "update action triggers exactly one reload and controllerchange"
    })
    .toEqual({ controllerchanges: 1, documents: 1 });
  await page.waitForTimeout(250);
  const eventsAfterAction = await readPwaTemporalEvents(page);
  const documentEvents = eventsAfterAction.filter((event) => event.type === "document");
  const controllerChangeEvents = eventsAfterAction.filter((event) => event.type === "controllerchange");
  expect(documentEvents).toHaveLength(1);
  expect(documentEvents[0]?.navigationType).toBe("reload");
  expect(controllerChangeEvents).toHaveLength(1);
  expect(controllerChangeEvents[0]?.controllerScriptURL).toContain("/sw.js");
  await expectActiveController(page);
  await expectStoredPwaVersion(page, versionB);
  await expectRenderedPwaVersion(page, versionB);
  await expectCacheVersion(page, versionB);
  await expectNoCacheVersion(page, versionA);

  await context.setOffline(true);
  await page.goto("/terms/not-cached-after-update");
  await expect(page.getByRole("heading", { name: "오프라인 fallback" })).toBeVisible();
});

test("immediate update activation persists version B through exactly one reload", async ({ page }) => {
  await writePwaVersion(versionA);
  await installPwaTemporalInstrumentation(page);
  await page.goto("/");
  await waitForServiceWorkerControl(page);
  await expectCacheVersion(page, versionA);
  await expectActiveController(page);
  await expectStoredPwaVersion(page, versionA);
  await expectRenderedPwaVersion(page, versionA);
  await resetPwaTemporalEvents(page);

  await writePwaVersion(versionB);
  const stateBeforeUpdate = await getServiceWorkerControlState(page);
  expect(stateBeforeUpdate).toMatchObject({
    activeState: "activated",
    controllerState: "activated",
    hasController: true,
    waitingState: null
  });

  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration("/");
    await registration?.update();
  });

  const updateButton = page.getByRole("button", { name: "업데이트 적용" });
  await expect(updateButton).toBeVisible();

  await expectNoUpdateReloadBeforeAction(page);
  const stateBeforeAction = await getServiceWorkerControlState(page);
  expect(stateBeforeAction.controllerScriptURL).toBe(stateBeforeUpdate.controllerScriptURL);
  expect(stateBeforeAction).toMatchObject({
    activeState: "activated",
    controllerState: "activated",
    hasController: true,
    waitingState: "installed"
  });

  const reloadPromise = page.waitForEvent("framenavigated", (frame) => {
    return frame === page.mainFrame() && new URL(frame.url()).pathname === "/";
  });
  await updateButton.focus();
  await page.keyboard.press("Enter");
  await reloadPromise;
  await page.waitForLoadState("networkidle");
  await waitForServiceWorkerControl(page);
  await expectSingleUpdateReload(page);
  await expectActiveController(page);
  await expectStoredPwaVersion(page, versionB);
  await expectRenderedPwaVersion(page, versionB);
  await expectCacheVersion(page, versionB);
  await expectNoCacheVersion(page, versionA);
});

test("runtime cache remains narrow and excludes non-GET, APIs, metadata routes, sw.js, and cross-origin", async ({
  page
}) => {
  await writePwaVersion(versionA);
  await page.goto("/");
  await waitForServiceWorkerControl(page);
  await page.goto("/dictionary?q=양자화");
  await page.goto("/topics/model-quantization");

  const nonGetStatus = await page.evaluate(async () => {
    const response = await fetch("/sw.js", {
      method: "POST",
      body: "paperwords-non-get-cache-probe",
      headers: {
        "Content-Type": "text/plain"
      }
    });
    await fetch("/api/probe").catch(() => undefined);
    await fetch("/robots.txt").catch(() => undefined);
    await fetch("/sitemap.xml").catch(() => undefined);
    await fetch("/sw.js").catch(() => undefined);
    await fetch("https://example.com/blocked").catch(() => undefined);

    return response.status;
  });

  const cachedRequests = await page.evaluate(async () => {
    const cacheNames = await caches.keys();
    const requestsByUrl: { method: string; url: string }[] = [];

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      requestsByUrl.push(...requests.map((request) => ({ method: request.method, url: request.url })));
    }

    return requestsByUrl;
  });

  expect(nonGetStatus).toBe(405);
  expect(cachedRequests.some((request) => request.method !== "GET")).toBe(false);
  const cachedUrls = cachedRequests.map((request) => request.url);
  expect(
    cachedUrls.some((url) => {
      const cachedUrl = new URL(url);
      return cachedUrl.pathname === "/dictionary" && cachedUrl.searchParams.get("q") === "양자화";
    })
  ).toBe(true);
  expect(cachedUrls.some((url) => url.includes("/api/"))).toBe(false);
  expect(cachedUrls.some((url) => url.endsWith("/sw.js"))).toBe(false);
  expect(cachedUrls.some((url) => url.endsWith("/robots.txt"))).toBe(false);
  expect(cachedUrls.some((url) => url.endsWith("/sitemap.xml"))).toBe(false);
  expect(cachedUrls.some((url) => url.startsWith("https://example.com"))).toBe(false);
});

async function expectNoUpdateReloadBeforeAction(page: Page): Promise<void> {
  const eventsBeforeAction = await readPwaTemporalEvents(page);
  expect(eventsBeforeAction.filter((event) => event.type === "document")).toHaveLength(0);
  expect(eventsBeforeAction.filter((event) => event.type === "controllerchange")).toHaveLength(0);
}

async function expectVersionFileFailure(request: APIRequestContext): Promise<void> {
  const workerResponse = await request.get("/sw.js");

  expect(workerResponse.ok()).toBe(false);
  expect(workerResponse.status()).toBe(500);
  expect(workerResponse.headers()["x-paperwords-pwa-version-file-error"]).toBe("1");
  expect(workerResponse.headers()["content-type"]).toContain("text/plain");
  const workerBody = await workerResponse.text();
  expect(workerBody).toContain("PaperWords PWA version file");
  expect(workerBody).not.toContain("SKIP_WAITING");
  expect(workerBody).not.toContain("PAPERWORDS_VERSION");
}

async function expectSingleUpdateReload(page: Page): Promise<void> {
  await expect
    .poll(async () => {
      const events = await readPwaTemporalEvents(page);
      return {
        controllerchanges: events.filter((event) => event.type === "controllerchange").length,
        documents: events.filter((event) => event.type === "document").length
      };
    }, {
      message: "update action triggers exactly one reload and controllerchange"
    })
    .toEqual({ controllerchanges: 1, documents: 1 });

  await page.waitForTimeout(250);
  const eventsAfterAction = await readPwaTemporalEvents(page);
  const documentEvents = eventsAfterAction.filter((event) => event.type === "document");
  const controllerChangeEvents = eventsAfterAction.filter((event) => event.type === "controllerchange");
  expect(documentEvents).toHaveLength(1);
  expect(documentEvents[0]?.navigationType).toBe("reload");
  expect(controllerChangeEvents).toHaveLength(1);
  expect(controllerChangeEvents[0]?.controllerScriptURL).toContain("/sw.js");
}
