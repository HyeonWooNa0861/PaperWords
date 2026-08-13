import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const css = readFileSync(resolve(projectRoot, "app/globals.css"), "utf8");
const design = readFileSync(resolve(projectRoot, "DESIGN.md"), "utf8");

describe("paper material design contract", () => {
  it("keeps the warm paper palette and deterministic local texture tokens", () => {
    expect(css).toContain("--desk: #272720");
    expect(css).toContain("--canvas: #eee6d7");
    expect(css).toContain("--surface: #fbf6eb");
    expect(css).toContain('--paper-grain: url("data:image/svg+xml');
    expect(css).toContain("--paper-fibers: repeating-linear-gradient");
  });

  it("applies the material layers to the shell and primary reading surfaces", () => {
    expect(css).toMatch(/\.app-shell\s*\{[\s\S]*?background-image: var\(--paper-grain\), var\(--paper-fibers\);/);
    expect(css).toMatch(/\.today-panel__reading,[\s\S]*?background-image: var\(--paper-grain\), linear-gradient/);
    expect(css).toContain("font-family: var(--font-reading)");
  });

  it("records the selected tactile preset and accessibility boundary", () => {
    expect(design).toContain("archived `light-mode-paper-technical`");
    expect(design).toContain("texture opacity stays below the level that competes with text");
    expect(design).toContain("no new dependency, external font, runtime image, or animation library");
  });

  it("keeps the product shell usable on mobile and settled on desktop", () => {
    expect(css).toMatch(/\.site-nav\s+a\[aria-current="page"\]\s*\{/);
    expect(css).toMatch(/\.mobile-nav\s*\{[\s\S]*?position:\s*fixed;/);
    expect(css).toMatch(/\.mobile-nav\s*\{[\s\S]*?bottom:\s*max\(0\.5rem,\s*env\(safe-area-inset-bottom\)\);/);
    expect(css).toMatch(/\.mobile-nav\s+a\s*\{[\s\S]*?min-height:\s*(?:44px|2\.75rem|3rem);/);
    expect(css).toMatch(/@media \(max-width: 640px\)\s*\{[\s\S]*?\.app-shell\s*\{[\s\S]*?padding-bottom:\s*calc\(4\.5rem \+ env\(safe-area-inset-bottom\)\);/);
    expect(css).toMatch(/\.page--dictionary\s*(?:>|\s)\s*\.search-box\s*\{[\s\S]*?position:\s*sticky;/);
    expect(css).toMatch(/\.home-discovery\s*\{/);
    expect(css).toMatch(/\.home-discovery__topic-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat/);
    expect(design).toContain("bottom navigation dock");
    expect(design).toContain("Desktop settled-workspace contract");
  });
});
