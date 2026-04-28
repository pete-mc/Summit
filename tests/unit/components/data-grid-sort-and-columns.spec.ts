import * as fs from "fs";
import * as path from "path";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { DataGrid, DataGridColumn } from "@/components/DataGrid";

jest.mock("@/components/gridExport", () => ({
  exportGridToExcel: jest.fn(),
  exportGridToPdf: jest.fn(),
}));

type SortRow = {
  name: string;
  score: number;
};

const REPO_ROOT = path.resolve(__dirname, "../../..");
const PHASE3_GRID_FILES = [
  "src/pages/MilestoneReport/components/MilestoneReport.tsx",
  "src/pages/OasReport/components/OasReport.tsx",
  "src/pages/PeakAward/components/PeakAward.tsx",
  "src/pages/PresentAwards/components/PresentAwards.tsx",
  "src/pages/SectionSummary/components/UnitSummary.tsx",
];

describe("Phase 3 data grid sort and column contracts", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("uses shared TanStack grid abstraction in all Phase 3 report pages", () => {
    for (const relativePath of PHASE3_GRID_FILES) {
      const source = fs.readFileSync(path.resolve(REPO_ROOT, relativePath), "utf8");
      expect(source).toContain('from "@/components/DataGrid"');
      expect(source).not.toContain("@syncfusion/ej2-react-grids");
    }
  });

  it("renders configured columns and sorts by header interaction", () => {
    const rows: SortRow[] = [
      { name: "Zara", score: 2 },
      { name: "Alex", score: 1 },
    ];

    const columns: DataGridColumn<SortRow>[] = [
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        enableSorting: true,
      },
      {
        id: "score",
        header: "Score",
        accessorKey: "score",
      },
    ];

    act(() => {
      root.render(
        React.createElement(DataGrid<SortRow>, {
          id: "contract-grid",
          data: rows,
          columns,
        }),
      );
    });

    expect(container.querySelector("th")?.textContent).toContain("Name");

    const firstRowNameBeforeSort = container.querySelector("tbody tr td")?.textContent;
    expect(firstRowNameBeforeSort).toContain("Zara");

    const headerButton = container.querySelector("th button") as HTMLButtonElement;
    expect(headerButton).toBeTruthy();

    act(() => {
      headerButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const firstRowNameAfterSort = container.querySelector("tbody tr td")?.textContent;
    expect(firstRowNameAfterSort).toContain("Alex");
  });
});
