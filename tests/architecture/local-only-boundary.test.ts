import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("local-only runtime boundary", () => {
  it("keeps the retired discovery implementation absent", () => {
    expect(listFiles("app/api/discovery")).toEqual([]);
    expect(listFiles("src/lib/discovery")).toEqual([]);
    expect(existsSync(resolve(projectRoot, "components/ExternalDiscovery.tsx"))).toBe(false);
  });

  it("keeps dictionary search free of runtime fetch and API handoffs", () => {
    const searchSurfacePaths = [
      "app/dictionary/page.tsx",
      "components/SearchBox.tsx",
      "components/SearchResults.tsx",
      "src/lib/search/index.ts",
      "src/lib/search/normalization.ts"
    ];
    const source = searchSurfacePaths
      .map((path) => readFileSync(resolve(projectRoot, path), "utf8"))
      .join("\n");

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toContain("/api/");
    expect(source).not.toContain("ExternalDiscovery");
  });
});

function listFiles(relativeDirectory: string): string[] {
  const directory = resolve(projectRoot, relativeDirectory);
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => resolve(entry.parentPath, entry.name));
}
