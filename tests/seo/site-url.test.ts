import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteBaseUrl } from "@/app/seo";

describe("production site URL resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers the explicit PaperWords origin and strips route data", () => {
    vi.stubEnv("PAPERWORDS_SITE_URL", "https://paperwords.example/path?q=term#result");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "paperwords-fallback.vercel.app");

    expect(getSiteBaseUrl().toString()).toBe("https://paperwords.example/");
  });

  it("uses the Vercel production domain when no explicit origin is configured", () => {
    vi.stubEnv("PAPERWORDS_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_PAPERWORDS_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "paperwords-free.vercel.app");

    expect(getSiteBaseUrl().toString()).toBe("https://paperwords-free.vercel.app/");
  });

  it("keeps the deterministic local fallback for an invalid explicit origin", () => {
    vi.stubEnv("PAPERWORDS_SITE_URL", "not a URL");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "paperwords-free.vercel.app");

    expect(getSiteBaseUrl().toString()).toBe("http://localhost:3000/");
  });
});
