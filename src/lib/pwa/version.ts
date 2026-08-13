export interface PaperWordsPwaVersions {
  appVersion: string;
  contentVersion: string;
  cacheVersion: string;
}

export interface PaperWordsCacheNames {
  precache: string;
  pages: string;
  static: string;
}

export const PAPERWORDS_PWA_DEFAULT_VERSIONS: PaperWordsPwaVersions = {
  appVersion: "0.6.0",
  contentVersion: "paperwords-mvp-2026-08-11.v1",
  cacheVersion: "paperwords-research-desk-v1"
};

export const PAPERWORDS_CACHE_PREFIX = "paperwords";

export function resolvePaperWordsPwaVersions(
  overrides: Partial<PaperWordsPwaVersions> = {}
): PaperWordsPwaVersions {
  return {
    appVersion: normalizeVersionSegment(overrides.appVersion, PAPERWORDS_PWA_DEFAULT_VERSIONS.appVersion),
    contentVersion: normalizeVersionSegment(overrides.contentVersion, PAPERWORDS_PWA_DEFAULT_VERSIONS.contentVersion),
    cacheVersion: normalizeVersionSegment(overrides.cacheVersion, PAPERWORDS_PWA_DEFAULT_VERSIONS.cacheVersion)
  };
}

export function getPaperWordsCacheNames(versions: PaperWordsPwaVersions): PaperWordsCacheNames {
  const stableSegment = normalizeVersionSegment(versions.cacheVersion, PAPERWORDS_PWA_DEFAULT_VERSIONS.cacheVersion);

  return {
    precache: `${PAPERWORDS_CACHE_PREFIX}-precache-${stableSegment}`,
    pages: `${PAPERWORDS_CACHE_PREFIX}-pages-${stableSegment}`,
    static: `${PAPERWORDS_CACHE_PREFIX}-static-${stableSegment}`
  };
}

function normalizeVersionSegment(value: string | undefined, fallback: string): string {
  const normalized = value?.trim().replace(/[^a-zA-Z0-9._:-]+/g, "-").replace(/^-+|-+$/g, "");

  return normalized && normalized.length > 0 ? normalized : fallback;
}
