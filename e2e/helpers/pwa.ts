import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { PaperWordsPwaVersions } from "@/src/lib/pwa/version";
import { getPaperWordsCacheNames } from "@/src/lib/pwa/version";

export const pwaVersionFile = join(process.cwd(), "output", "playwright", "pwa-version.json");

const temporalEventsKey = "paperwords:pwa-temporal-events";
const storedVersionKey = "paperwords:pwa-version";

export interface PwaTemporalEvent {
  type: "controllerchange" | "document" | "pagehide";
  href: string;
  controllerScriptURL: string | null;
  navigationType?: string;
  timestamp: number;
}

export interface ServiceWorkerControlState {
  activeState: ServiceWorkerState | null;
  controllerScriptURL: string | null;
  controllerState: ServiceWorkerState | null;
  hasController: boolean;
  waitingState: ServiceWorkerState | null;
}

export async function writePwaVersion(versions: PaperWordsPwaVersions): Promise<void> {
  await mkdir(dirname(pwaVersionFile), { recursive: true });
  await writeFile(pwaVersionFile, `${JSON.stringify(versions, null, 2)}\n`, "utf8");
}

export async function preparePwaVersionFile(versions: PaperWordsPwaVersions): Promise<void> {
  await writePwaVersion(versions);
}

export async function removePwaVersionFile(): Promise<void> {
  await rm(pwaVersionFile, { force: true });
}

export async function writeMalformedPwaVersionFile(): Promise<void> {
  await mkdir(dirname(pwaVersionFile), { recursive: true });
  await writeFile(pwaVersionFile, "{ malformed json\n", "utf8");
}

export async function writePwaVersionPayload(payload: unknown): Promise<void> {
  await mkdir(dirname(pwaVersionFile), { recursive: true });
  await writeFile(pwaVersionFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export async function waitForServiceWorkerControl(page: Page): Promise<void> {
  await page.waitForFunction(async () => {
    if (!("serviceWorker" in navigator)) {
      return false;
    }

    await navigator.serviceWorker.ready;
    return Boolean(navigator.serviceWorker.controller);
  });
}

export async function expectCacheVersion(page: Page, versions: PaperWordsPwaVersions): Promise<void> {
  const expectedPrecache = getPaperWordsCacheNames(versions).precache;

  await expect
    .poll(async () => readCacheKeys(page), {
      message: `cache names include ${versions.cacheVersion}`
    })
    .toContain(expectedPrecache);
}

export async function expectNoCacheVersion(page: Page, versions: PaperWordsPwaVersions): Promise<void> {
  const oldNames = Object.values(getPaperWordsCacheNames(versions));

  await expect
    .poll(async () => {
      const keys = await readCacheKeys(page);
      return keys.filter((key) => oldNames.includes(key));
    }, {
      message: `cache names exclude ${versions.cacheVersion}`
    })
    .toEqual([]);
}

export async function installPwaTemporalInstrumentation(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    const appendEvent = (event: PwaTemporalEvent) => {
      try {
        const raw = window.sessionStorage.getItem(key);
        const events = raw ? (JSON.parse(raw) as PwaTemporalEvent[]) : [];
        events.push(event);
        window.sessionStorage.setItem(key, JSON.stringify(events));
      } catch {
        window.sessionStorage.setItem(key, JSON.stringify([event]));
      }
    };

    const controllerScriptURL = () => navigator.serviceWorker?.controller?.scriptURL ?? null;
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;

    appendEvent({
      type: "document",
      href: window.location.href,
      controllerScriptURL: controllerScriptURL(),
      navigationType: navigation?.type ?? "unknown",
      timestamp: Date.now()
    });

    window.addEventListener("pagehide", () => {
      appendEvent({
        type: "pagehide",
        href: window.location.href,
        controllerScriptURL: controllerScriptURL(),
        timestamp: Date.now()
      });
    });

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        appendEvent({
          type: "controllerchange",
          href: window.location.href,
          controllerScriptURL: controllerScriptURL(),
          timestamp: Date.now()
        });
      });
    }
  }, temporalEventsKey);
}

export async function resetPwaTemporalEvents(page: Page): Promise<void> {
  await page.evaluate((key) => {
    window.sessionStorage.setItem(key, "[]");
  }, temporalEventsKey);
}

export async function readPwaTemporalEvents(page: Page): Promise<PwaTemporalEvent[]> {
  return page.evaluate((key) => {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as PwaTemporalEvent[];
    } catch {
      return [];
    }
  }, temporalEventsKey);
}

export async function expectStoredPwaVersion(page: Page, versions: PaperWordsPwaVersions): Promise<void> {
  await expect
    .poll(async () => {
      return page.evaluate((key) => {
        const raw = window.sessionStorage.getItem(key);
        return raw ? (JSON.parse(raw) as Partial<PaperWordsPwaVersions>) : null;
      }, storedVersionKey);
    }, {
      message: `stored client version is ${versions.contentVersion}`
    })
    .toEqual(versions);
}

export async function expectRenderedPwaVersion(page: Page, versions: PaperWordsPwaVersions): Promise<void> {
  const signal = page.locator(".pwa-version-signal");

  await expect(signal).toBeAttached();
  await expect(signal).toHaveAttribute("data-app-version", versions.appVersion);
  await expect(signal).toHaveAttribute("data-content-version", versions.contentVersion);
  await expect(signal).toHaveAttribute("data-cache-version", versions.cacheVersion);
}

export async function getServiceWorkerControlState(page: Page): Promise<ServiceWorkerControlState> {
  return page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) {
      return {
        activeState: null,
        controllerScriptURL: null,
        controllerState: null,
        hasController: false,
        waitingState: null
      };
    }

    const registration = await navigator.serviceWorker.getRegistration("/");

    return {
      activeState: registration?.active?.state ?? null,
      controllerScriptURL: navigator.serviceWorker.controller?.scriptURL ?? null,
      controllerState: navigator.serviceWorker.controller?.state ?? null,
      hasController: Boolean(navigator.serviceWorker.controller),
      waitingState: registration?.waiting?.state ?? null
    };
  });
}

export async function expectActiveController(page: Page): Promise<void> {
  await expect
    .poll(async () => getServiceWorkerControlState(page), {
      message: "service worker has an active controller and no waiting worker"
    })
    .toMatchObject({
      activeState: "activated",
      controllerState: "activated",
      hasController: true,
      waitingState: null
    });
}

async function readCacheKeys(page: Page): Promise<string[]> {
  try {
    return await page.evaluate(() => caches.keys());
  } catch (error) {
    if (error instanceof Error && error.message.includes("Execution context was destroyed")) {
      return [];
    }

    throw error;
  }
}
