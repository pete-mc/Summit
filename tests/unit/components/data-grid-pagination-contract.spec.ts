import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { DataGrid, DataGridColumn } from "@/components/DataGrid";

jest.mock("@/components/gridExport", () => ({
  exportGridToExcel: jest.fn(),
  exportGridToPdf: jest.fn(),
}));

type PagingRow = {
  name: string;
};

describe("Phase 5 data grid pagination contract", () => {
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

  it("paginates rows with clear controls for faster report traversal", () => {
    const rows: PagingRow[] = Array.from({ length: 12 }, (_, index) => ({
      name: `Scout ${index + 1}`,
    }));

    const columns: DataGridColumn<PagingRow>[] = [{ id: "name", header: "Name", accessorKey: "name", enableSorting: true }];

    act(() => {
      root.render(
        React.createElement(DataGrid<PagingRow>, {
          id: "paging-grid",
          data: rows,
          columns,
        }),
      );
    });

    const bodyRowsPage1 = Array.from(container.querySelectorAll("tbody tr"));
    expect(bodyRowsPage1).toHaveLength(10);
    expect(bodyRowsPage1[0].textContent).toContain("Scout 1");
    expect(bodyRowsPage1[9].textContent).toContain("Scout 10");

    const pageIndicator = container.querySelector("[data-grid-page-indicator='true']");
    expect(pageIndicator?.textContent).toContain("Page 1 of 2");

    const previousButton = container.querySelector("button[data-grid-page='previous']") as HTMLButtonElement;
    const nextButton = container.querySelector("button[data-grid-page='next']") as HTMLButtonElement;
    expect(previousButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);

    act(() => {
      nextButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const bodyRowsPage2 = Array.from(container.querySelectorAll("tbody tr"));
    expect(bodyRowsPage2).toHaveLength(2);
    expect(bodyRowsPage2[0].textContent).toContain("Scout 11");
    expect(bodyRowsPage2[1].textContent).toContain("Scout 12");
    expect(pageIndicator?.textContent).toContain("Page 2 of 2");

    const pageSizeSelect = container.querySelector("select[data-grid-page-size='true']") as HTMLSelectElement;
    expect(pageSizeSelect).toBeTruthy();

    act(() => {
      pageSizeSelect.value = "25";
      pageSizeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const rowsAfterPageSizeChange = Array.from(container.querySelectorAll("tbody tr"));
    expect(rowsAfterPageSizeChange).toHaveLength(12);
    expect(pageIndicator?.textContent).toContain("Page 1 of 1");
  });
});
