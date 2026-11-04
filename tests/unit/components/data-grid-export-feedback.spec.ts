import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { DataGrid, DataGridColumn } from "@/components/DataGrid";
import * as gridExport from "@/components/gridExport";
import { showTerrainToast } from "@/helpers/TerrainToast";

type ExportRow = {
  name: string;
  score: number;
};

jest.mock("@/helpers/TerrainToast", () => ({ showTerrainToast: jest.fn() }));
jest.mock("@/components/gridExport", () => ({
  exportGridToExcel: jest.fn(),
  exportGridToPdf: jest.fn(),
}));

describe("Phase 5 data grid export feedback contract", () => {
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

  it("shows a Terrain toast for successful and failed export actions", () => {
    (gridExport.exportGridToPdf as jest.Mock).mockImplementation(() => {
      throw new Error("Disk unavailable");
    });

    const columns: DataGridColumn<ExportRow>[] = [
      { id: "name", header: "Name", accessorKey: "name" },
      { id: "score", header: "Score", accessorKey: "score" },
    ];

    act(() => {
      root.render(
        React.createElement(DataGrid<ExportRow>, {
          id: "export-feedback-grid",
          data: [{ name: "Alex", score: 4 }],
          columns,
          toolbarActions: ["excel", "pdf"],
          exportOptions: {
            title: "Export Feedback",
            fileNamePrefix: "ExportFeedback",
          },
        }),
      );
    });

    const excelButton = container.querySelector("button[data-action='excel-export']") as HTMLButtonElement;
    const pdfButton = container.querySelector("button[data-action='pdf-export']") as HTMLButtonElement;

    act(() => {
      excelButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(showTerrainToast).toHaveBeenLastCalledWith("Excel export complete");

    act(() => {
      pdfButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(showTerrainToast).toHaveBeenLastCalledWith("PDF export failed: Disk unavailable", "error");
  });
});
