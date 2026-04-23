import * as fs from "fs";
import * as path from "path";

describe("TypeScript deprecation warning suppression", () => {
  it("uses TS5-compatible ignoreDeprecations setting in base tsconfig", () => {
    const tsconfigPath = path.resolve(__dirname, "../../../tsconfig.json");
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8")) as {
      compilerOptions?: Record<string, unknown>;
    };

    const compilerOptions = tsconfig.compilerOptions ?? {};

    expect(compilerOptions.ignoreDeprecations).toBe("5.0");
  });
});
