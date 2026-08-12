import { expect, test } from "@playwright/test";
import { PAPERWORDS_PWA_DEFAULT_VERSIONS } from "@/src/lib/pwa/version";
import { blockExternalRequests } from "./helpers/network";

const baseURL = `http://127.0.0.1:${process.env.PAPERWORDS_PLAYWRIGHT_PORT ?? "4311"}`;
const publicUrlCount = 48;

test.beforeEach(async ({ context }) => {
  await blockExternalRequests(context);
});

const metadataCases = [
  {
    path: "/",
    title: "PaperWords | 오늘의 논문 용어",
    description: /KST 스케줄/,
    canonical: baseURL
  },
  {
    path: "/dictionary?q=양자화",
    title: "PaperWords Dictionary",
    description: /결정적으로 검색/,
    canonical: `${baseURL}/dictionary`
  },
  {
    path: "/terms/neural-network-quantization",
    title: "Neural Network Quantization | PaperWords",
    description: /낮은 비트 정밀도/,
    canonical: `${baseURL}/terms/neural-network-quantization`
  },
  {
    path: "/topics/model-quantization",
    title: "Model Quantization | PaperWords",
    description: /낮은 정밀도/,
    canonical: `${baseURL}/topics/model-quantization`
  },
  {
    path: "/papers/integer-arithmetic-only-inference-2018",
    title: "Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference | PaperWords",
    description: /관계 논문 메타데이터/,
    canonical: `${baseURL}/papers/integer-arithmetic-only-inference-2018`
  },
  {
    path: "/~offline",
    title: "PaperWords Offline",
    description: /fallback/,
    canonical: `${baseURL}/~offline`,
    noIndex: true
  }
];

for (const metadataCase of metadataCases) {
  test(`rendered metadata is complete for ${metadataCase.path}`, async ({ page }) => {
    await page.goto(metadataCase.path);

    await expect(page).toHaveTitle(metadataCase.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", metadataCase.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", metadataCase.canonical);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", metadataCase.title);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", metadataCase.canonical);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary");
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");

    if (metadataCase.noIndex) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    }
  });
}

test("manifest, icon responses, robots, and sitemap are deterministic", async ({ request }) => {
  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  expect(manifestResponse.headers()["content-type"]).toContain("application/manifest+json");
  const manifest = await manifestResponse.json();

  expect(manifest).toMatchObject({
    name: "PaperWords",
    short_name: "PaperWords",
    start_url: "/",
    display: "standalone",
    theme_color: "#f5f5f7",
    background_color: "#f5f5f7",
    lang: "ko"
  });
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }),
      expect.objectContaining({ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }),
      expect.objectContaining({ src: "/icons/maskable-512.png", sizes: "512x512", purpose: "maskable" })
    ])
  );

  for (const icon of manifest.icons) {
    const response = await request.get(icon.src);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
  }

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /~offline");
  expect(robots).toContain(`${baseURL}/sitemap.xml`);

  const sitemap = await (await request.get("/sitemap.xml")).text();
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]!);
  expect(locs).toHaveLength(publicUrlCount);
  expect(locs).toContain(`${baseURL}/`);
  expect(locs).toContain(`${baseURL}/dictionary`);
  expect(locs).toContain(`${baseURL}/topics/model-quantization`);
  expect(locs).toContain(`${baseURL}/terms/neural-network-quantization`);
  expect(locs).toContain(`${baseURL}/papers/integer-arithmetic-only-inference-2018`);
  expect(locs.some((loc) => loc.includes("~offline"))).toBe(false);
  expect(locs.every((loc) => new URL(loc).pathname === new URL(loc).pathname.toLowerCase())).toBe(true);

  const workerResponse = await request.get("/sw.js");
  expect(workerResponse.ok()).toBe(true);
  expect(workerResponse.headers()["x-paperwords-app-version"]).toBe(PAPERWORDS_PWA_DEFAULT_VERSIONS.appVersion);
  expect(workerResponse.headers()["x-paperwords-content-version"]).toBe(
    PAPERWORDS_PWA_DEFAULT_VERSIONS.contentVersion
  );
  expect(workerResponse.headers()["x-paperwords-cache-version"]).toBe(PAPERWORDS_PWA_DEFAULT_VERSIONS.cacheVersion);
});

test("term and paper JSON-LD render in the browser without drafts or abstracts", async ({ page }) => {
  await page.goto("/terms/neural-network-quantization");

  const termJson = await readJsonLd(page);
  expect(termJson).toMatchObject({
    "@type": "DefinedTerm",
    name: "Neural Network Quantization",
    termCode: "neural-network-quantization",
    url: `${baseURL}/terms/neural-network-quantization`
  });
  expect(JSON.stringify(termJson)).not.toMatch(/draft|metadata_verified|language_reviewed|retired/i);

  await page.goto("/papers/integer-arithmetic-only-inference-2018");
  const rawPaperJson = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(rawPaperJson).not.toContain("<");
  const paperJson = JSON.parse(rawPaperJson ?? "{}") as Record<string, unknown>;

  expect(paperJson).toMatchObject({
    "@type": "ScholarlyArticle",
    headline: "Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference",
    datePublished: "2018",
    url: `${baseURL}/papers/integer-arithmetic-only-inference-2018`
  });
  expect(JSON.stringify(paperJson)).not.toMatch(/abstract/i);
  await expect(page.getByText(/Abstract:/i)).toHaveCount(0);
});

async function readJsonLd(page: import("@playwright/test").Page): Promise<Record<string, unknown>> {
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(raw).not.toContain("<");

  return JSON.parse(raw ?? "{}") as Record<string, unknown>;
}
