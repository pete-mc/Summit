import { InitSiaTransfer } from "@/components/siaTransfer";

describe("InitSiaTransfer", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  it("injects one Summit Export button per rendered SIA project card and mirrors Terrain classes/data-v attributes", () => {
    document.body.innerHTML = `
      <section>
        <div class="ListItem" data-project="1">
          <div class="ListItem__action-btn-col">
            <button data-cy="VIEW_ACHIEVEMENT" data-v-abc123 class="v-btn theme--light action-one">View</button>
            <button data-cy="EDIT_ACHIEVEMENT" class="v-btn theme--light action-two">Edit</button>
          </div>
        </div>
        <div class="ListItem" data-project="2">
          <div class="ListItem__action-btn-col">
            <button data-cy="REVIEW_ACHIEVEMENT" data-v-def456 class="v-btn theme--dark action-three">Review</button>
          </div>
        </div>
      </section>
    `;

    InitSiaTransfer();

    const exportButtons = document.querySelectorAll("button.summitSiaExportBtn");
    expect(exportButtons).toHaveLength(2);

    const firstCardExport = document.querySelector('[data-project="1"] .summitSiaExportBtn') as HTMLButtonElement | null;
    const secondCardExport = document.querySelector('[data-project="2"] .summitSiaExportBtn') as HTMLButtonElement | null;

    expect(firstCardExport).not.toBeNull();
    expect(secondCardExport).not.toBeNull();
    expect(firstCardExport?.textContent).toBe("Summit Export");
    expect(secondCardExport?.textContent).toBe("Summit Export");
    expect(firstCardExport?.classList.contains("v-btn")).toBe(true);
    expect(firstCardExport?.classList.contains("action-one")).toBe(true);
    expect(firstCardExport?.classList.contains("summit-menu-outline")).toBe(true);
    expect(firstCardExport?.hasAttribute("data-v-abc123")).toBe(true);
    expect(secondCardExport?.hasAttribute("data-v-def456")).toBe(true);
  });

  it("places Summit Export adjacent to existing action buttons in each card action area", () => {
    document.body.innerHTML = `
      <section>
        <div class="ListItem">
          <div class="ListItem__action-btn-col" data-action-area="A">
            <button data-cy="VIEW_ACHIEVEMENT" class="v-btn existing-action">View</button>
            <button data-cy="EDIT_ACHIEVEMENT" class="v-btn existing-action">Edit</button>
            <button data-cy="REVIEW_ACHIEVEMENT" class="v-btn existing-action">Review</button>
          </div>
        </div>
      </section>
    `;

    InitSiaTransfer();

    const actionArea = document.querySelector('[data-action-area="A"]');
    const firstExistingAction = actionArea?.querySelector('button[data-cy="VIEW_ACHIEVEMENT"]') ?? null;
    const exportButton = actionArea?.querySelector("button.summitSiaExportBtn") as HTMLButtonElement | null;

    expect(exportButton).not.toBeNull();
    expect(exportButton?.parentElement).toBe(actionArea);
    expect(firstExistingAction?.previousElementSibling).toBe(exportButton);
  });

  it("dedupes on rerender and only injects for new cards", () => {
    document.body.innerHTML = `
      <section id="sia-list">
        <div class="ListItem" data-project="1">
          <div class="ListItem__action-btn-col">
            <button data-cy="VIEW_ACHIEVEMENT" class="v-btn">View</button>
          </div>
        </div>
      </section>
    `;

    InitSiaTransfer();
    InitSiaTransfer();

    expect(document.querySelectorAll('[data-project="1"] .summitSiaExportBtn')).toHaveLength(1);

    const list = document.getElementById("sia-list") as HTMLElement;
    list.insertAdjacentHTML(
      "beforeend",
      `
        <div class="ListItem" data-project="2">
          <div class="ListItem__action-btn-col">
            <button data-cy="VIEW_ACHIEVEMENT" class="v-btn">View</button>
          </div>
        </div>
      `,
    );

    InitSiaTransfer();

    expect(document.querySelectorAll(".summitSiaExportBtn")).toHaveLength(2);
    expect(document.querySelectorAll('[data-project="1"] .summitSiaExportBtn')).toHaveLength(1);
    expect(document.querySelectorAll('[data-project="2"] .summitSiaExportBtn')).toHaveLength(1);
  });
});
