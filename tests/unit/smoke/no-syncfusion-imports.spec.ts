import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SRC_ROOT = path.resolve(REPO_ROOT, "src");
const normalizePath = (value: string): string => value.replace(/\\/g, "/");

const collectFiles = (dir: string, predicate: (fileName: string) => boolean): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath, predicate));
      continue;
    }

    if (predicate(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
};

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss"]);

describe("phase 6 cleanup guard: no syncfusion imports/usages", () => {
  it("has no Syncfusion dependencies in package.json", () => {
    const packageJsonPath = path.resolve(REPO_ROOT, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const allDeps = {
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
    };

    const syncfusionDeps = Object.keys(allDeps).filter((name) => name.startsWith("@syncfusion/"));
    expect(syncfusionDeps).toEqual([]);
  });

  it("has no Syncfusion module references in source code", () => {
    const sourceFiles = collectFiles(SRC_ROOT, (fileName) => SOURCE_EXTENSIONS.has(path.extname(fileName)));
    const offenders: string[] = [];

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, "utf8");
      if (/@syncfusion\//i.test(content)) {
        offenders.push(normalizePath(path.relative(REPO_ROOT, filePath)));
      }
    }

    expect(offenders).toEqual([]);
  });

  it("does not include legacy fluent styles in active extension build outputs", async () => {
    const manifestPath = path.resolve(REPO_ROOT, "manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
      content_scripts?: Array<{ css?: string[] }>;
    };

    const cssEntries = manifest.content_scripts?.[0]?.css ?? [];
    expect(cssEntries).not.toContain("/styles/fluent.min.css");

    const webpackConfigModule = await import(path.resolve(REPO_ROOT, "webpack.config.js"));
    const webpackConfig = (webpackConfigModule.default ?? webpackConfigModule) as {
      plugins?: Array<{ constructor: { name: string }; patterns?: Array<{ from: string; to?: string }> }>;
    };

    const copyPlugin = webpackConfig.plugins?.find((plugin) => plugin.constructor.name === "CopyPlugin") as { patterns?: Array<{ from: string; to?: string }> } | undefined;
    const patterns = copyPlugin?.patterns ?? [];
    expect(patterns).not.toEqual(expect.arrayContaining([expect.objectContaining({ from: "src/styles/fluent.min.css", to: "styles" })]));
  });
});
