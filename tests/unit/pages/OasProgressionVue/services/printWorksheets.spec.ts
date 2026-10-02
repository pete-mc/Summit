import { printWorksheets } from "@/pages/OasProgressionVue/services/printWorksheets";

/** A minimal stand-in for the Window object printWorksheets writes into and prints. */
function makeFakePrintWindow() {
  const fakeDocument = {
    open: jest.fn(),
    write: jest.fn(),
    close: jest.fn(),
  };
  const fakeWindow = {
    document: fakeDocument,
    closed: false,
    focus: jest.fn(),
    print: jest.fn(),
    onload: null as (() => void) | null,
  };
  return fakeWindow;
}

function makeTable(id: string): HTMLTableElement {
  const table = document.createElement("table");
  table.className = "oas-worksheet-page";
  table.setAttribute("data-oas-worksheet-page", id);
  const tr = document.createElement("tr");
  tr.innerHTML = `<td>${id} content</td>`;
  table.appendChild(tr);
  return table;
}

describe("printWorksheets", () => {
  let openSpy: jest.SpyInstance;
  let fakeWindow: ReturnType<typeof makeFakePrintWindow>;

  beforeEach(() => {
    jest.useFakeTimers();
    fakeWindow = makeFakePrintWindow();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    openSpy = jest.spyOn(window, "open").mockReturnValue(fakeWindow as any);
  });

  afterEach(() => {
    openSpy.mockRestore();
    jest.useRealTimers();
  });

  it("returns false and opens nothing when the popup is blocked", () => {
    openSpy.mockReturnValue(null);

    const result = printWorksheets({ pageTables: [makeTable("p1")], documentTitle: "Test", orientation: "landscape" });

    expect(result).toBe(false);
    expect(fakeWindow.document.write).not.toHaveBeenCalled();
  });

  it("returns true and writes every page table's markup into the new document", () => {
    const result = printWorksheets({ pageTables: [makeTable("p1"), makeTable("p2")], documentTitle: "Test Title", orientation: "landscape" });

    expect(result).toBe(true);
    expect(fakeWindow.document.open).toHaveBeenCalled();
    expect(fakeWindow.document.close).toHaveBeenCalled();
    const written = fakeWindow.document.write.mock.calls[0][0] as string;
    expect(written).toContain("Test Title");
    expect(written).toContain('data-oas-worksheet-page="p1"');
    expect(written).toContain('data-oas-worksheet-page="p2"');
    expect(written).toContain("p1 content");
    expect(written).toContain("p2 content");
  });

  it("prints A4 landscape when orientation is 'landscape' (Layout A)", () => {
    printWorksheets({ pageTables: [makeTable("p1")], documentTitle: "Test", orientation: "landscape" });

    const written = fakeWindow.document.write.mock.calls[0][0] as string;
    expect(written).toContain("size: A4 landscape");
  });

  it("prints A4 portrait when orientation is 'portrait' (Layout B)", () => {
    printWorksheets({ pageTables: [makeTable("p1")], documentTitle: "Test", orientation: "portrait" });

    const written = fakeWindow.document.write.mock.calls[0][0] as string;
    expect(written).toContain("size: A4 portrait");
    expect(written).not.toContain("size: A4 landscape");
  });

  it("calls print() exactly once, even if both onload and the fallback timeout fire", () => {
    printWorksheets({ pageTables: [makeTable("p1")], documentTitle: "Test", orientation: "landscape" });

    fakeWindow.onload?.();
    jest.advanceTimersByTime(1000);

    expect(fakeWindow.print).toHaveBeenCalledTimes(1);
  });

  it("does not call print() via the fallback timeout if the window was closed first", () => {
    printWorksheets({ pageTables: [makeTable("p1")], documentTitle: "Test", orientation: "landscape" });

    fakeWindow.closed = true;
    jest.advanceTimersByTime(1000);

    expect(fakeWindow.print).not.toHaveBeenCalled();
  });

  it("opens the window with the configured popup name", () => {
    printWorksheets({ pageTables: [makeTable("p1")], documentTitle: "Test", orientation: "landscape" });

    expect(openSpy).toHaveBeenCalledWith("", "oasWorksheetsPrint", expect.any(String));
  });

  it("focuses the new window immediately, not only right before printing", () => {
    printWorksheets({ pageTables: [makeTable("p1")], documentTitle: "Test", orientation: "landscape" });

    // Called once synchronously during printWorksheets itself, before onload/the timeout have had
    // any chance to fire — reported live: the window wasn't reliably coming to the front, so an
    // early focus() call (in addition to the one right before print()) gives the browser the best
    // chance of raising it as soon as it exists.
    expect(fakeWindow.focus).toHaveBeenCalled();
  });

  it("writes a visible close button into the document, so the window isn't stuck with no way back to it", () => {
    printWorksheets({ pageTables: [makeTable("p1")], documentTitle: "Test", orientation: "landscape" });

    const written = fakeWindow.document.write.mock.calls[0][0] as string;
    expect(written).toContain("window.close()");
    expect(written).toContain("oas-worksheet-print-close-btn");
  });
});
