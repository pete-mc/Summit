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
};

describe("Phase 5 data grid sort indicator and aria contract", () => {
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

  it("exposes clearer sorting state with aria messaging and neutral indicator", () => {
    const rows: SortRow[] = [{ name: "Zara" }, { name: "Alex" }];

    const columns: DataGridColumn<SortRow>[] = [{ id: "name", header: "Name", accessorKey: "name", enableSorting: true }];

    act(() => {
      root.render(
        React.createElement(DataGrid<SortRow>, {
          id: "sort-grid",
          data: rows,
          columns,
        }),
      );
    });

    const headerCell = container.querySelector("th") as HTMLTableCellElement;
    const sortButton = headerCell.querySelector("button") as HTMLButtonElement;
    const sortIndicator = headerCell.querySelector("[data-grid-sort-indicator]") as HTMLSpanElement;

    expect(headerCell.getAttribute("aria-sort")).toBe("none");
    expect(sortIndicator.textContent).toContain("↕");
    expect(sortButton.getAttribute("aria-label")).toContain("currently not sorted");

    act(() => {
      sortButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(headerCell.getAttribute("aria-sort")).toBe("ascending");
    expect(sortIndicator.textContent).toContain("▲");
    expect(sortButton.getAttribute("aria-label")).toContain("currently ascending");

    act(() => {
      sortButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(headerCell.getAttribute("aria-sort")).toBe("descending");
    expect(sortIndicator.textContent).toContain("▼");
    expect(sortButton.getAttribute("aria-label")).toContain("currently descending");
  });
});
