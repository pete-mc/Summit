import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const DATA_GRID_PATH = path.resolve(REPO_ROOT, "src/components/DataGrid.tsx");

describe("Phase 1 data grid empty/sort indicator contract", () => {
  it("defines baseline empty-state and sort-indicator markers", () => {
    const source = fs.readFileSync(DATA_GRID_PATH, "utf8");

    expect(source).toContain("aria-sort");
    expect(source).toContain("data-grid-sort-indicator");
    expect(source).toContain("data-grid-empty-state");
    expect(source).toContain("No rows to display");
    expect(source).toContain("getIsSorted");
  });
});
