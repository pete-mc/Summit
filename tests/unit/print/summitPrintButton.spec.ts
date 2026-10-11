// The button's .ts is testable on its own (the .vue template isn't parsed by Jest). printTable is
// mocked: the real one needs a browser print dialog.
jest.mock("@/print/summitPrint", () => {
  const actual = jest.requireActual("@/print/summitPrint");
  return { __esModule: true, ...actual, printTable: jest.fn() };
});

import SummitPrintButton from "@/components/SummitPrintButton";
import { printTable } from "@/print/summitPrint";

type GoContext = Record<string, unknown> & { go(): Promise<void> };

function context(overrides: Record<string, unknown> = {}): GoContext {
  const methods = (SummitPrintButton as unknown as { methods: Record<string, (...a: unknown[]) => unknown> }).methods;
  const ctx: Record<string, unknown> = {
    profile: "present-awards",
    settings: { pageSize: "A4", orientation: "portrait", margins: "normal", layout: "fit" },
    target: () => document.createElement("table"),
    busy: false,
    open: true,
    warn: false,
    warnText: "",
    $nextTick: async () => undefined,
    ...overrides,
  };
  ctx.showWarning = methods.showWarning.bind(ctx);
  ctx.go = methods.go.bind(ctx);
  return ctx as GoContext;
}

beforeEach(() => {
  (printTable as jest.Mock).mockReset();
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
    expect(ctx.warn).toBe(true);
    expect(String(ctx.warnText)).toContain("boom");
  });

  it("prints without a prepare hook (the OAS tabs)", async () => {
    (printTable as jest.Mock).mockResolvedValue({ zoom: 1, overflow: false, bands: 1 });
    await context().go();
    expect(printTable).toHaveBeenCalledTimes(1);
  });
});
