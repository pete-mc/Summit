import $ from "jquery";
import { InitLogbookRead } from "@/components/copyLogbook";

describe("InitLogbookRead", () => {
  const originalMutationObserver = global.MutationObserver;
  const originalDollar = window.$;

  beforeEach(() => {
    window.$ = $;
    ($.fn as JQuery).xpath = function xpath(expression: string): Node[] {
      const contextNode = this.get(0) ?? document;
      const result = document.evaluate(expression, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      const matches: Node[] = [];

      for (let index = 0; index < result.snapshotLength; index += 1) {
        const match = result.snapshotItem(index);

        if (match) matches.push(match);
      }

      return matches;
    } as unknown as JQuery["xpath"];
    (globalThis as { $: typeof $ }).$ = $;
  });

  afterEach(() => {
    global.MutationObserver = originalMutationObserver;
    window.$ = originalDollar;
    delete (globalThis as Partial<typeof globalThis>).$;
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  it("creates read buttons before print, mirrors classes, and copies data-v attributes", () => {
    const observeMock = jest.fn();

    class MockMutationObserver {
      observe = observeMock;
      disconnect = jest.fn();
      takeRecords = jest.fn(() => []);

      constructor(_callback: MutationCallback) {}
    }

    global.MutationObserver = MockMutationObserver as unknown as typeof MutationObserver;

    document.body.innerHTML = `
      <section class="ViewRecord__no-print">
        <div>
          <button data-cy="PRINT" data-v-abc123 data-v-def456 class="print-base print-extra">Print</button>
        </div>
      </section>
    `;

    InitLogbookRead();

    const printBtn = document.querySelector('button[data-cy="PRINT"]');
    const copyBtn = document.querySelector(".copyClipboardBtn") as HTMLButtonElement | null;
    const exportBtn = document.querySelector(".copyExportBtn") as HTMLButtonElement | null;

    expect(copyBtn).not.toBeNull();
    expect(exportBtn).not.toBeNull();
    expect(copyBtn?.id).toBe("copyClipboardBtn");
    expect(exportBtn?.id).toBe("copyExportBtn");
    expect(copyBtn?.textContent).toBe("Copy to Clipboard");
    expect(exportBtn?.textContent).toBe("Export");
    expect(copyBtn?.hasAttribute("data-v-abc123")).toBe(true);
    expect(copyBtn?.hasAttribute("data-v-def456")).toBe(true);
    expect(exportBtn?.hasAttribute("data-v-abc123")).toBe(true);
    expect(exportBtn?.hasAttribute("data-v-def456")).toBe(true);
    expect(copyBtn?.classList.contains("print-base")).toBe(true);
    expect(copyBtn?.classList.contains("print-extra")).toBe(true);
    expect(exportBtn?.classList.contains("print-base")).toBe(true);
    expect(exportBtn?.classList.contains("print-extra")).toBe(true);
    expect(copyBtn?.classList.contains("summit-btn")).toBe(true);
    expect(exportBtn?.classList.contains("summit-btn")).toBe(true);
    expect(copyBtn?.nextElementSibling).toBe(exportBtn);
    expect(exportBtn?.nextElementSibling).toBe(printBtn);

    expect(observeMock).toHaveBeenCalledTimes(2);
    expect(observeMock).toHaveBeenNthCalledWith(1, printBtn, {
      attributes: true,
      childList: false,
      subtree: false,
    });
    expect(observeMock).toHaveBeenNthCalledWith(2, printBtn, {
      attributes: true,
      childList: false,
      subtree: false,
    });
  });
});
