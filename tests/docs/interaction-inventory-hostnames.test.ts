import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const inventoryPath = path.resolve(repoRoot, "docs/API/summit-terrain-interaction-inventory.md");
const srcRoot = path.resolve(repoRoot, "src");

function walkFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    return fullPath;
  });
}

function collectTerrainHostsFromSource(): string[] {
  const files = walkFiles(srcRoot).filter((file) => /\.(ts|tsx|js)$/.test(file));
  const hosts = new Set<string>();
  const hostRegex = /https:\/\/[a-z0-9.-]*terrain\.scouts\.com\.au/gi;

  files.forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const matches = content.match(hostRegex) ?? [];
    matches.forEach((match) => {
      hosts.add(new URL(match).hostname.toLowerCase());
    });
  });

  return Array.from(hosts).sort();
}

describe("summit-terrain-interaction-inventory hostnames", () => {
  it("documents all terrain.scouts.com.au runtime hosts used by source", () => {
    const markdown = fs.readFileSync(inventoryPath, "utf8").toLowerCase();
    const hosts = collectTerrainHostsFromSource();

    expect(hosts.length).toBeGreaterThan(0);
    hosts.forEach((host) => {
      expect(markdown).toContain(host);
    });
  });
});
