import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { DataGrid, DataGridColumn } from "@/components/DataGrid";
import * as gridExport from "@/components/gridExport";

type Row = {
  name: string;
  value: number;
};

jest.mock("@/components/gridExport", () => ({
  exportGridToExcel: jest.fn(),
  exportGridToPdf: jest.fn(),
}));

describe("Phase 3 data grid toolbar contracts", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("triggers functional export actions from toolbar buttons", () => {
    const columns: DataGridColumn<Row>[] = [
      { id: "name", header: "Name", accessorKey: "name" },
      { id: "value", header: "Value", accessorKey: "value" },
    ];

    act(() => {
      root.render(
        React.createElement(DataGrid<Row>, {
          id: "toolbar-grid",
          data: [{ name: "Scout", value: 3 }],
          columns,
          exportOptions: {
            title: "Toolbar Contract",
            fileNamePrefix: "ToolbarContract",
          },
          toolbarActions: ["pdf", "excel"],
        }),
      );
    });

    const excelButton = container.querySelector("button[data-action='excel-export']") as HTMLButtonElement;
    const pdfButton = container.querySelector("button[data-action='pdf-export']") as HTMLButtonElement;

    expect(excelButton).toBeTruthy();
    expect(pdfButton).toBeTruthy();

    act(() => {
      excelButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      pdfButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(gridExport.exportGridToExcel).toHaveBeenCalledTimes(1);
    expect(gridExport.exportGridToPdf).toHaveBeenCalledTimes(1);
    expect(gridExport.exportGridToExcel).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "ToolbarContract.xlsx",
        title: "Toolbar Contract",
      }),
    );
    expect(gridExport.exportGridToPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "ToolbarContract.pdf",
        title: "Toolbar Contract",
      }),
    );
  });
});
