import { expect, test, type Page } from "@playwright/test";
import { blockExternalRequests, expectNoHorizontalOverflow } from "./helpers/network";

test.beforeEach(async ({ context }) => {
  await blockExternalRequests(context);
});

test("Today page, search entry, and responsive shell render without overlap", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByText("오늘의 논문 용어")).toBeVisible();
  await expect(page.locator(".schedule-stamp")).toContainText(/기준 날짜|KST 기준일/);
  await expect(page.locator(".schedule-stamp")).toContainText(/추천 원칙/);
  await expect(page.locator(".schedule-stamp")).not.toContainText(/paperwords-mvp|\bMVP\b/i);
  await expect(page.getByRole("searchbox", { name: "논문 용어 검색" })).toBeVisible();
  await expect(page.locator(".home-discovery")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/paperwords-mvp|\bMVP\b/i);

  const material = await page.locator(".today-panel__reading").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage
    };
  });

  expect(material.backgroundColor).toBe("rgb(251, 246, 235)");
  expect(material.backgroundImage).toContain("data:image/svg+xml");
  await expectNoHorizontalOverflow(page);
});

test("responsive product navigation and dictionary search stay touch friendly", async ({ page }) => {
  await page.goto("/");

  const viewportWidth = page.viewportSize()?.width ?? 1280;

  if (viewportWidth <= 720) {
    const mobileNav = page.locator(".mobile-nav");
    await expect(mobileNav).toBeVisible();
    await expect(page.locator(".site-nav")).toBeHidden();
    await expect(mobileNav.getByRole("link", { name: "오늘" })).toHaveAttribute("aria-current", "page");

    for (const label of ["오늘", "검색", "주제"]) {
      const box = await mobileNav.getByRole("link", { name: label }).boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    await mobileNav.getByRole("link", { name: "검색" }).click();
    await expect(page).toHaveURL(/\/dictionary$/);
    await expect(page.locator("main.page--dictionary")).toBeVisible();
    await expect(page.locator(".mobile-nav").getByRole("link", { name: "검색" })).toHaveAttribute(
      "aria-current",
      "page"
    );

    const searchBox = page.locator(".page--dictionary .search-box");
    const searchStyle = await searchBox.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        position: style.position,
        top: style.top
      };
    });
    expect(searchStyle.position).toBe("sticky");
    const submitBox = await page.getByRole("button", { name: "검색", exact: true }).boundingBox();
    expect(submitBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  } else {
    const siteNav = page.locator(".site-nav");
    await expect(siteNav).toBeVisible();
    await expect(page.locator(".mobile-nav")).toBeHidden();
    await expect(siteNav.getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");
    await expect(siteNav.getByRole("link", { name: "Dictionary" })).toHaveAttribute("href", "/dictionary");
    await expect(page.locator(".home-discovery")).toBeVisible();
  }

  await expectNoHorizontalOverflow(page);
});

test("bilingual dictionary submit opens a published result", async ({ page }) => {
  await page.goto("/dictionary");

  await page.getByRole("searchbox", { name: "논문 용어 검색" }).fill("양자화");
  await page.getByRole("button", { name: "검색", exact: true }).click();

  await expect(page).toHaveURL(/\/dictionary\?q=/);
  await expect(page.getByText(/개 결과/)).toBeVisible();
  await page.getByRole("link", { name: /Quantization Calibration/i }).first().click();
  await expect(page).toHaveURL(/\/terms\/quantization-calibration$/);
  await expect(page.getByRole("heading", { name: /Quantization Calibration/i })).toBeVisible();
});

test("dictionary stays local-only and removed discovery APIs return 404", async ({ page, request }) => {
  const termDiscovery = await request.get("/api/discovery/terms?q=edge");
  const paperDiscovery = await request.get("/api/discovery/papers?q=quantization");

  expect(termDiscovery.status()).toBe(404);
  expect(paperDiscovery.status()).toBe(404);

  await page.goto("/dictionary?q=양자화");

  await expect(page.getByRole("searchbox", { name: "논문 용어 검색" })).toHaveValue("양자화");
  await expect(page.getByRole("link", { name: "Quantization Calibration" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "외부 검색어" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "외부 데이터 검색" })).toHaveCount(0);
  await expect(page.getByText("미검증 후보")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("term detail shows relations, sources, and deep refresh support", async ({ page }) => {
  await page.goto("/terms/neural-network-quantization");

  await expect(page.getByRole("heading", { name: /Neural Network Quantization/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "함께 읽을 용어" })).toBeVisible();
  await openEvidenceDisclosureIfCollapsed(page, "용어 근거");
  await expect(page.getByRole("heading", { name: "논문 관계선" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "출처 스탬프" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: /Neural Network Quantization/i })).toBeVisible();
});

test("topics navigation reaches filtered topic terms and relation papers", async ({ page }) => {
  await page.goto("/topics");

  await page.getByRole("link", { name: /Model Quantization/i }).first().click();
  await expect(page).toHaveURL(/\/topics\/model-quantization$/);
  await expect(page.getByRole("heading", { name: "Model Quantization" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "공개 용어" })).toBeVisible();
  await expect(page.getByText("Neural Network Quantization")).toBeVisible();
  await openEvidenceDisclosureIfCollapsed(page, "주제 관련 논문");
  await expect(page.getByRole("heading", { name: "관계로 연결된 대표 논문" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("paper route is relation-only and does not expose an abstract body", async ({ page }) => {
  await page.goto("/papers/integer-arithmetic-only-inference-2018");

  await expect(
    page.getByRole("heading", {
      name: /Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference/i
    })
  ).toBeVisible();
  await expect(page.getByText("관계 전용 논문 상세")).toBeVisible();
  await expect(page.getByText(/not_copied/)).toBeVisible();
  await expect(page.getByText(/정수 산술로 처리하는 추론 경로/)).toBeVisible();
  await expect(page.getByText(/Abstract:/i)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("offline fallback route is directly reachable", async ({ page }) => {
  await page.goto("/~offline");

  await expect(page.getByRole("heading", { name: "오프라인 fallback" })).toBeVisible();
  await expect(page.getByRole("link", { name: "홈으로 이동" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "검색 다시 열기" })).toHaveAttribute("href", "/dictionary");
});

test("keyboard tab order reaches navigation and dictionary form controls", async ({ page }) => {
  await page.goto("/dictionary?q=양자화");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "본문으로 바로가기" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "PaperWords 홈" })).toBeFocused();

  await page.getByRole("searchbox", { name: "논문 용어 검색" }).focus();
  await expect(page.getByRole("searchbox", { name: "논문 용어 검색" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "검색", exact: true })).toBeFocused();
});

async function openEvidenceDisclosureIfCollapsed(page: Page, title: string): Promise<void> {
  const summary = page.locator(".evidence-disclosure__summary").filter({ hasText: title }).first();

  if (!(await summary.isVisible())) {
    return;
  }

  const isOpen = await summary.evaluate((element) => {
    return (element.parentElement as HTMLDetailsElement | null)?.open ?? true;
  });

  if (!isOpen) {
    await summary.click();
  }
}
