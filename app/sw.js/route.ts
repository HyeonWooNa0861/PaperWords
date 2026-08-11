import { readFile } from "node:fs/promises";
import {
  generatePaperWordsServiceWorker,
  PAPERWORDS_SW_PATH
} from "@/src/lib/pwa/worker";
import {
  PAPERWORDS_PWA_DEFAULT_VERSIONS,
  resolvePaperWordsPwaVersions,
  type PaperWordsPwaVersions
} from "@/src/lib/pwa/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const overrides = await readRuntimeOverrides();
  if (!overrides.ok) {
    return new Response("PaperWords PWA version file could not be read or parsed.", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "X-PaperWords-Pwa-Version-File-Error": "1"
      }
    });
  }

  const versions = resolvePaperWordsPwaVersions(overrides.value);
  const body = generatePaperWordsServiceWorker(versions);

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Service-Worker-Allowed": "/",
      "X-PaperWords-Service-Worker": PAPERWORDS_SW_PATH,
      "X-PaperWords-App-Version": versions.appVersion,
      "X-PaperWords-Content-Version": versions.contentVersion,
      "X-PaperWords-Cache-Version": versions.cacheVersion
    }
  });
}

type RuntimeOverrideResult =
  | { ok: true; value: Partial<PaperWordsPwaVersions> }
  | { ok: false };

const allowedVersionOverrideKeys = new Set(["appVersion", "contentVersion", "cacheVersion"]);

async function readRuntimeOverrides(): Promise<RuntimeOverrideResult> {
  const directOverrides = resolveDirectEnvironmentOverrides();
  const versionFile = process.env.PAPERWORDS_PWA_VERSION_FILE?.trim();

  if (!versionFile) {
    return { ok: true, value: directOverrides };
  }

  try {
    const parsed = JSON.parse(await readFile(versionFile, "utf8")) as unknown;
    if (!isVersionOverrideObject(parsed)) {
      return { ok: false };
    }

    return {
      ok: true,
      value: {
        ...directOverrides,
        appVersion: stringOrUndefined(parsed.appVersion) ?? directOverrides.appVersion,
        contentVersion: stringOrUndefined(parsed.contentVersion) ?? directOverrides.contentVersion,
        cacheVersion: stringOrUndefined(parsed.cacheVersion) ?? directOverrides.cacheVersion
      }
    };
  } catch {
    return { ok: false };
  }
}

function resolveDirectEnvironmentOverrides(): Partial<PaperWordsPwaVersions> {
  return {
    appVersion: process.env.PAPERWORDS_APP_VERSION ?? PAPERWORDS_PWA_DEFAULT_VERSIONS.appVersion,
    contentVersion: process.env.PAPERWORDS_CONTENT_VERSION ?? PAPERWORDS_PWA_DEFAULT_VERSIONS.contentVersion,
    cacheVersion: process.env.PAPERWORDS_CACHE_VERSION ?? PAPERWORDS_PWA_DEFAULT_VERSIONS.cacheVersion
  };
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isVersionOverrideObject(value: unknown): value is Partial<PaperWordsPwaVersions> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(([key, entryValue]) => {
    return allowedVersionOverrideKeys.has(key) && typeof entryValue === "string";
  });
}
