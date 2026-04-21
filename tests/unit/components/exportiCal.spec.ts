import { InitProgrammingExportBtn } from '@/components/exportiCal';

describe('InitProgrammingExportBtn', () => {
  const originalMutationObserver = global.MutationObserver;

  afterEach(() => {
    global.MutationObserver = originalMutationObserver;
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('inserts the export button before print, mirrors classes, and attaches an observer', () => {
    const observeMock = jest.fn();
    let capturedCallback: MutationCallback | undefined;

    class MockMutationObserver {
      constructor(callback: MutationCallback) {
        capturedCallback = callback;
      }

      observe = observeMock;
      disconnect = jest.fn();
      takeRecords = jest.fn(() => []);
    }

    global.MutationObserver = MockMutationObserver as unknown as typeof MutationObserver;

    document.body.innerHTML = `
      <div>
        <button data-cy="PRINT" class="print-base print-extra">Print</button>
      </div>
    `;

    InitProgrammingExportBtn();

    const printBtn = document.querySelector('button[data-cy="PRINT"]');
    const exportBtn = document.querySelector('.exportiCalBtn') as HTMLButtonElement | null;

    expect(exportBtn).not.toBeNull();
    expect(exportBtn?.id).toBe('exportiCalBtn');
    expect(exportBtn?.textContent).toBe('Save to Calendar (iCal)');
    expect(exportBtn?.getAttribute('data-v-718788cc')).toBe('');
    expect(exportBtn?.classList.contains('print-base')).toBe(true);
    expect(exportBtn?.classList.contains('print-extra')).toBe(true);
    expect(exportBtn?.classList.contains('summit-menu-outline')).toBe(true);
    expect(printBtn?.previousElementSibling).toBe(exportBtn);

    expect(observeMock).toHaveBeenCalledWith(printBtn, {
      attributes: true,
      childList: false,
      subtree: false,
    });
    expect(capturedCallback).toBeDefined();
  });

  it('does not create duplicate export buttons when called again', () => {
    document.body.innerHTML = `
      <div>
        <button data-cy="PRINT" class="print-base">Print</button>
      </div>
    `;

    InitProgrammingExportBtn();
    InitProgrammingExportBtn();

    expect(document.querySelectorAll('.exportiCalBtn')).toHaveLength(1);
  });
});
