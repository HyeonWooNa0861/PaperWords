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
});
