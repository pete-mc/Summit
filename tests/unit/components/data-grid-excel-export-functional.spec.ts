import { exportGridToExcel, GridExportColumn } from "@/components/gridExport";

jest.mock("jspdf", () => ({
  jsPDF: jest.fn(),
}));

jest.mock("jspdf-autotable", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const jsonToSheetMock = jest.fn(() => ({ mocked: true }));
const bookNewMock = jest.fn(() => ({ workbook: true }));
const bookAppendSheetMock = jest.fn();
const writeFileMock = jest.fn();

jest.mock("xlsx", () => ({
  utils: {
    json_to_sheet: (...args: unknown[]) => jsonToSheetMock(...args),
    book_new: (...args: unknown[]) => bookNewMock(...args),
    book_append_sheet: (...args: unknown[]) => bookAppendSheetMock(...args),
  },
  writeFile: (...args: unknown[]) => writeFileMock(...args),
}));

describe("Phase 3 excel export functional contract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exports flattened rows with configured headers and file name", () => {
    const columns: GridExportColumn[] = [
      { key: "name", header: "Name" },
      { key: "score", header: "Score" },
      { key: "notes", header: "Notes", exportValue: (row) => (row.notes as string[]).join(" | ") },
    ];

    exportGridToExcel({
      fileName: "Contract.xlsx",
      title: "Contract Export",
      columns,
      rows: [
        { name: "Alex", score: 3, notes: ["A", "B"] },
        { name: "Zara", score: 5, notes: ["C"] },
      ],
    });

    expect(jsonToSheetMock).toHaveBeenCalledWith([
      { Name: "Alex", Score: 3, Notes: "A | B" },
      { Name: "Zara", Score: 5, Notes: "C" },
    ]);
    expect(bookNewMock).toHaveBeenCalledTimes(1);
    expect(bookAppendSheetMock).toHaveBeenCalledWith(expect.any(Object), { mocked: true }, "Contract Export");
    expect(writeFileMock).toHaveBeenCalledWith(expect.any(Object), "Contract.xlsx");
  });
});
