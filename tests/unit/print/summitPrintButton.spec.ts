// The button's .ts is testable on its own (the .vue template isn't parsed by Jest). printTable is
// mocked: the real one needs a browser print dialog.
jest.mock("@/components/SummitPillButton.vue", () => ({ __esModule: true, default: { name: "SummitPillButton", render: () => null } }), { virtual: true });
jest.mock("@/print/summitPrint", () => {
  const actual = jest.requireActual("@/print/summitPrint");
  return { __esModule: true, ...actual, printTable: jest.fn(), printTables: jest.fn() };
});

jest.mock("@/helpers/TerrainToast", () => ({ showTerrainToast: jest.fn() }));
import { showTerrainToast } from "@/helpers/TerrainToast";
import SummitPrintButton, { initialMultiPartSettings, type PrintButtonPart } from "@/components/SummitPrintButton";
import { printTable, printTables } from "@/print/summitPrint";

type GoContext = Record<string, unknown> & { go(): Promise<void> };

function context(overrides: Record<string, unknown> = {}): GoContext {
  const methods = (SummitPrintButton as unknown as { methods: Record<string, (...a: unknown[]) => unknown> }).methods;
  const ctx: Record<string, unknown> = {
    profile: "present-awards",
    settings: { pageSize: "A4", orientation: "portrait", margins: "normal", layout: "fit" },
    target: () => document.createElement("table"),
    busy: false,
    open: true,
    $nextTick: async () => undefined,
    ...overrides,
  };
  Object.keys(methods).forEach((name) => {
    ctx[name] = methods[name].bind(ctx);
  });
  return ctx as GoContext;
}

beforeEach(() => {
  (printTable as jest.Mock).mockReset();
  (printTables as jest.Mock).mockReset();
  (showTerrainToast as jest.Mock).mockClear();
  window.localStorage.clear();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());

describe("SummitPrintButton prepare/restore", () => {
  it("prepares the table before printing and restores it afterwards", async () => {
    const order: string[] = [];
    const restore = jest.fn(() => order.push("restore"));
    (printTable as jest.Mock).mockImplementation(async () => {
      order.push("print");
      return { zoom: 1, overflow: false, bands: 1 };
    });
    const ctx = context({
      prepare: async () => {
        order.push("prepare");
        return restore;
      },
    });

    await ctx.go();
    expect(order).toEqual(["prepare", "print", "restore"]);
    expect(ctx.busy).toBe(false);
  });

  it("still restores the table when printing fails, and tells the user", async () => {
    const restore = jest.fn();
    (printTable as jest.Mock).mockRejectedValue(new Error("boom"));
    const ctx = context({ prepare: async () => restore });

    await ctx.go();
    expect(restore).toHaveBeenCalledTimes(1);
    expect(showTerrainToast).toHaveBeenCalledWith(expect.stringContaining("boom"), "error");
  });

  it("prints without a prepare hook (the OAS tabs)", async () => {
    (printTable as jest.Mock).mockResolvedValue({ zoom: 1, overflow: false, bands: 1 });
    await context().go();
    expect(printTable).toHaveBeenCalledTimes(1);
  });
});

describe("SummitPrintButton with several tables", () => {
  function part(label: string, profile: string, extra: Partial<PrintButtonPart> = {}): PrintButtonPart {
    return { label, profile, target: () => document.createElement("table"), ...extra };
  }
  const PARTS = () => [part("Towards Peak Award", "peak-award-summary"), part("Overall", "overall-progress")];

  function multiContext(overrides: Record<string, unknown> = {}) {
    return context({
      profile: "",
      parts: PARTS(),
      settingsKey: "oas-summary",
      settings: { pageSize: "A4", orientation: "landscape", margins: "normal", layout: "split" },
      ...overrides,
    });
  }

  it("prints every table as one printout with one page setup, layout included", async () => {
    (printTables as jest.Mock).mockResolvedValue([
      { zoom: 1, overflow: false, bands: 1 },
      { zoom: 1, overflow: false, bands: 2 },
    ]);

    await multiContext().go();

    expect(printTable).not.toHaveBeenCalled();
    const request = (printTables as jest.Mock).mock.calls[0][0];
    expect(request.parts.map((p: { profile: string }) => p.profile)).toEqual(["peak-award-summary", "overall-progress"]);
    expect([request.pageSize, request.orientation, request.margins, request.layout]).toEqual(["A4", "landscape", "normal", "split"]);
  });

  it("names the table in a layout warning", async () => {
    (printTables as jest.Mock).mockResolvedValue([
      { zoom: 1, overflow: false, bands: 1 },
      { zoom: 0.7, overflow: false, bands: 3 },
    ]);
    const ctx = multiContext({ settings: { pageSize: "A4", orientation: "landscape", margins: "normal", layout: "fit" } });

    await ctx.go();

    expect(showTerrainToast).toHaveBeenCalledWith("Overall: Too wide for one page even when shrunk, so it was split into 3 parts.", "info");
  });

  it("restores every prepared table even when printing fails", async () => {
    const restoreA = jest.fn();
    const restoreB = jest.fn();
    (printTables as jest.Mock).mockRejectedValue(new Error("boom"));
    const ctx = multiContext({ parts: [part("A", "peak-award-summary", { prepare: async () => restoreA }), part("B", "overall-progress", { prepare: async () => restoreB })] });

    await ctx.go();

    expect(restoreA).toHaveBeenCalledTimes(1);
    expect(restoreB).toHaveBeenCalledTimes(1);
    expect(showTerrainToast).toHaveBeenCalledWith(expect.stringContaining("boom"), "error");
  });

  it("remembers the page setup under its own key", async () => {
    (printTables as jest.Mock).mockResolvedValue([
      { zoom: 1, overflow: false, bands: 1 },
      { zoom: 1, overflow: false, bands: 1 },
    ]);
    await multiContext({ settings: { pageSize: "A3", orientation: "portrait", margins: "narrow", layout: "fit" } }).go();

    expect(initialMultiPartSettings("oas-summary", PARTS())).toEqual({ pageSize: "A3", orientation: "portrait", margins: "narrow", layout: "fit" });
  });

  // Edge prints every page at the first page's size, so one orientation has to suit every table.
  it("defaults to landscape when any table prefers it", () => {
    expect(initialMultiPartSettings("oas-summary", PARTS()).orientation).toBe("landscape");
    expect(initialMultiPartSettings("oas-summary", [part("A", "peak-award-summary")]).orientation).toBe("portrait");
  });
});
