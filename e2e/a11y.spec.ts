import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { blockExternalRequests } from "./helpers/network";

const checkedRoutes = [
  "/",
  "/dictionary?q=양자화",
  "/terms/edge-computing",
  "/terms/neural-network-quantization",
  "/topics",
  "/topics/model-quantization",
  "/papers/integer-arithmetic-only-inference-2018",
  "/~offline"
];

test.beforeEach(async ({ context }) => {
  await blockExternalRequests(context);
});

for (const route of checkedRoutes) {
  test(`axe critical/serious violations are zero on ${route}`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blockingViolations = results.violations.filter((violation) =>
      violation.impact === "critical" || violation.impact === "serious"
    );

    expect(blockingViolations).toEqual([]);
  });
}

test("forms, live regions, language spans, and install controls are keyboard-safe", async ({ page }) => {
  await page.goto("/dictionary?q=양자화");

  const searchbox = page.getByRole("searchbox", { name: "논문 용어 검색" });
  await expect(searchbox).toBeVisible();
  await expect(page.locator(".result-status")).toHaveAttribute("aria-live", "polite");
  await expect(page.locator('[lang="en"]').first()).toBeVisible();

  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "dismissed"; platform: "web" }>;
      platforms: string[];
    };
    event.prompt = async () => undefined;
    event.userChoice = Promise.resolve({ outcome: "dismissed", platform: "web" });
    event.platforms = ["web"];
    window.dispatchEvent(event);
  });

  const installButton = page.getByRole("button", { name: "앱 설치" });
  await expect(installButton).toBeVisible();
  await installButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("PaperWords 설치 가능")).toHaveCount(0);
});
