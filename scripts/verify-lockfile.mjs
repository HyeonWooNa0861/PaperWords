import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const requiredDirectVersions = {
  "@axe-core/playwright": "4.12.1",
  "@playwright/test": "1.62.1",
  "@tailwindcss/postcss": "4.3.3",
  "@testing-library/dom": "10.4.1",
  "@testing-library/jest-dom": "7.0.1",
  "@testing-library/react": "16.3.2",
  "@types/node": "22.20.1",
  "@types/react": "19.2.18",
  "@types/react-dom": "19.2.4",
  "@vitejs/plugin-react": "4.7.0",
  "eslint": "9.39.5",
  "eslint-config-next": "16.3.0",
  "jsdom": "26.1.0",
  "minisearch": "7.2.0",
  "next": "16.3.0",
  "react": "19.2.8",
  "react-dom": "19.2.8",
  "tailwindcss": "4.3.3",
  "typescript": "6.0.3",
  "vite": "6.4.3",
  "vitest": "4.1.10",
  "zod": "4.4.3"
};

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const lockfile = readFileSync(resolve(root, "pnpm-lock.yaml"), "utf8");

const failures = [];
const dependencyScopes = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

for (const [name, expected] of Object.entries(requiredDirectVersions)) {
  const declared = dependencyScopes[name];
  if (declared !== expected) {
    failures.push(`${name}: package.json declares ${declared ?? "missing"}, expected ${expected}`);
    continue;
  }

  const block = findImporterDependencyBlock(lockfile, name);
  if (!block) {
    failures.push(`${name}: missing from pnpm-lock.yaml root importer`);
    continue;
  }

  const specifier = fieldValue(block, "specifier");
  const resolved = directVersion(fieldValue(block, "version") ?? "");

  if (specifier !== expected) {
    failures.push(`${name}: lockfile specifier ${specifier ?? "missing"}, expected ${expected}`);
  }

  if (resolved !== expected) {
    failures.push(`${name}: lockfile resolved ${resolved ?? "missing"}, expected ${expected}`);
  }
}

if (packageJson.packageManager !== "pnpm@10.34.5") {
  failures.push(`packageManager: ${packageJson.packageManager ?? "missing"}, expected pnpm@10.34.5`);
}

if (failures.length > 0) {
  console.error("Lockfile verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Verified ${Object.keys(requiredDirectVersions).length} direct dependency versions in package.json and pnpm-lock.yaml.`);

function findImporterDependencyBlock(text, name) {
  const lines = text.split(/\r?\n/);
  const keyPattern = new RegExp(`^ {6}(?:${escapeRegExp(name)}|'${escapeRegExp(name)}'|"${escapeRegExp(name)}"):\\s*$`);

  for (let index = 0; index < lines.length; index += 1) {
    if (!keyPattern.test(lines[index])) {
      continue;
    }

    const block = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor];
      if (/^ {6}\S/.test(line) || /^ {4}\S/.test(line) || /^ {2}\S/.test(line) || /^\S/.test(line)) {
        break;
      }
      block.push(line);
    }
    return block.join("\n");
  }

  return null;
}

function fieldValue(block, field) {
  const match = block.match(new RegExp(`^ {8}${field}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, "");
}

function directVersion(value) {
  const match = value.match(/^(\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?)/);
  return match?.[1];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
