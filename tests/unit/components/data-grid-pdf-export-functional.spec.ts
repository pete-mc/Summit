import { exportGridToPdf, GridExportColumn } from "@/components/gridExport";

const textMock = jest.fn();

jest.mock("jspdf", () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      text: (...args: unknown[]) => textMock(...args),
      save: jest.fn(),
    })),
  };
});

const autoTableMock = jest.fn();

jest.mock("jspdf-autotable", () => ({
  __esModule: true,
  default: (...args: unknown[]) => autoTableMock(...args),
}));

describe("Phase 3 pdf export functional contract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exports table headers and rows to pdf with practical formatting", () => {
    const columns: GridExportColumn[] = [
      { key: "name", header: "Name" },
      { key: "score", header: "Score" },
    ];

    exportGridToPdf({
      fileName: "Contract.pdf",
      title: "Contract PDF Export",
      columns,
      rows: [
        { name: "Alex", score: 3 },
        { name: "Zara", score: 5 },
      ],
      orientation: "landscape",
    });

    expect(textMock).toHaveBeenCalledWith("Contract PDF Export", 14, 14);
    expect(autoTableMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        head: [["Name", "Score"]],
        body: [
          ["Alex", 3],
          ["Zara", 5],
        ],
        startY: 20,
      }),
    );
  });
});
