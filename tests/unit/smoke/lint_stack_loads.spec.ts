import fs from "fs";
import path from "path";

describe("lint stack loads", () => {
  it("loads eslint flat config and preserves TypeScript lint intent", async () => {
    const configPath = path.resolve(process.cwd(), "eslint.config.js");
    expect(fs.existsSync(configPath)).toBe(true);

    const configModule = await import(configPath);
    const config = configModule.default ?? configModule;

    expect(Array.isArray(config)).toBe(true);

    const sourceConfig = config.find((entry: { files?: string[] }) => entry.files?.includes("src/**/*.ts"));

    expect(sourceConfig).toBeDefined();
    expect(sourceConfig.rules["prettier/prettier"]).toBe("error");
    expect(sourceConfig.rules.camelcase).toEqual(["error", { properties: "never" }]);
  });
});
