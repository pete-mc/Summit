import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act, Simulate } from "react-dom/test-utils";
import { DataGrid, DataGridColumn } from "@/components/DataGrid";

jest.mock("@/components/gridExport", () => ({
  exportGridToExcel: jest.fn(),
  exportGridToPdf: jest.fn(),
}));

type FilterRow = {
  name: string;
  section: string;
};

describe("Phase 5 data grid column filtering contract", () => {
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

  it("supports global and per-column filtering for practical report scanning", () => {
    const rows: FilterRow[] = [
      { name: "Alex", section: "Alpha" },
      { name: "Zara", section: "Zulu" },
      { name: "Mia", section: "Alpha" },
    ];

    const columns: DataGridColumn<FilterRow>[] = [
      { id: "name", header: "Name", accessorKey: "name", enableSorting: true },
      { id: "section", header: "Section", accessorKey: "section" },
    ];

    act(() => {
      root.render(
        React.createElement(DataGrid<FilterRow>, {
          id: "filter-grid",
          data: rows,
          columns,
        }),
      );
    });

    const globalFilter = container.querySelector("input[data-grid-global-filter='true']") as HTMLInputElement;
    expect(globalFilter).toBeTruthy();

    act(() => {
      Simulate.change(globalFilter, { target: { value: "za" } });
    });

    const visibleRowsAfterGlobal = Array.from(container.querySelectorAll("tbody tr"));
    expect(visibleRowsAfterGlobal).toHaveLength(1);
    expect(visibleRowsAfterGlobal[0].textContent).toContain("Zara");

    act(() => {
      Simulate.change(globalFilter, { target: { value: "" } });
    });

    const sectionFilter = container.querySelector("input[data-grid-column-filter='section']") as HTMLInputElement;
    expect(sectionFilter).toBeTruthy();

    act(() => {
      Simulate.change(sectionFilter, { target: { value: "alpha" } });
    });

    const visibleRowsAfterColumn = Array.from(container.querySelectorAll("tbody tr"));
    expect(visibleRowsAfterColumn).toHaveLength(2);
    expect(visibleRowsAfterColumn[0].textContent).toContain("Alex");
    expect(visibleRowsAfterColumn[1].textContent).toContain("Mia");
  });
});
