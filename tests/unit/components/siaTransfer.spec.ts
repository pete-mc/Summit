import { InitSiaTransfer } from "@/components/siaTransfer";
import { createMemberAchievement } from "@/services";
import { TerrainState } from "@/helpers";

jest.mock("@/services", () => ({
  createMemberAchievement: jest.fn(),
}));

jest.mock("@/helpers", () => {
  const actual = jest.requireActual("@/helpers");
  return {
    ...actual,
    TerrainState: {
      getToken: jest.fn().mockReturnValue("Bearer test-token"),
    },
  };
});

describe("InitSiaTransfer", () => {
  const mockedCreateMemberAchievement = createMemberAchievement as jest.MockedFunction<typeof createMemberAchievement>;
  const mockedGetToken = TerrainState.getToken as jest.MockedFunction<typeof TerrainState.getToken>;
  const originalNuxt = window.$nuxt;

  afterEach(() => {
    document.body.innerHTML = "";
    jest.clearAllMocks();

    if (originalNuxt) {
      window.$nuxt = originalNuxt;
      return;
    }

    delete (window as Partial<Window>).$nuxt;
  });

  function mockInputFile(input: HTMLInputElement, file: File): void {
    Object.defineProperty(input, "files", {
      configurable: true,
      value: [file],
    });
  }

  async function flushAsyncWork(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
  }

  it("injects one Summit Export button next to the Back button on /sia/requirements and mirrors Terrain classes/data-v attributes", () => {
    document.body.innerHTML = `
      <section>
        <div class="Requirements__footer-actions">
          <button data-cy="BACK" data-v-abc123 class="v-btn theme--light action-one major">Back</button>
        </div>
      </section>
    `;

    window.$nuxt = {
      $store: {
        state: {
          sia: {
            currentSia: {
              section: "scout",
              type: "special_interest_area",
              answers: {
                project_name: "Current SIA Project",
                special_interest_area_selection: "sia_environment",
              },
            },
            siaList: [],
          },
        },
      },
    } as typeof window.$nuxt;

    InitSiaTransfer("/sia/requirements");

    const exportButtons = document.querySelectorAll("button.summitSiaExportBtn");
    expect(exportButtons).toHaveLength(1);

    const backButton = document.querySelector('button[data-cy="BACK"]') as HTMLButtonElement | null;
    const exportButton = document.querySelector("button.summitSiaExportBtn") as HTMLButtonElement | null;

    expect(exportButton).not.toBeNull();
    expect(exportButton?.textContent).toBe("Summit Export");
    expect(exportButton?.classList.contains("v-btn")).toBe(true);
    expect(exportButton?.classList.contains("action-one")).toBe(true);
    expect(exportButton?.classList.contains("summit-menu-outline")).toBe(true);
    expect(exportButton?.hasAttribute("data-v-abc123")).toBe(true);
    expect(backButton?.previousElementSibling).toBe(exportButton);
  });

  it("does not inject Summit Export on /sia list page", () => {
    document.body.innerHTML = `
      <section class="BaseOverview__main">
        <button data-cy="CREATE_PROJECT" class="v-btn">Create project</button>
        <div class="ListItem">
          <div class="ListItem__action-btn-col">
            <button data-cy="VIEW_ACHIEVEMENT" class="v-btn">View project</button>
            <button data-cy="EDIT_ACHIEVEMENT" class="v-btn">Edit project</button>
          </div>
        </div>
      </section>
    `;

    InitSiaTransfer("/sia");

    expect(document.querySelectorAll("button.summitSiaExportBtn")).toHaveLength(0);
    expect(document.querySelectorAll("button.summitSiaImportBtn")).toHaveLength(1);
  });

  it("dedupes requirements export button across rerenders", () => {
    document.body.innerHTML = `
      <section>
        <div class="Requirements__footer-actions">
          <button data-cy="BACK" class="v-btn">Back</button>
        </div>
      </section>
    `;

    window.$nuxt = {
      $store: {
        state: {
          sia: {
            currentSia: {
              section: "scout",
              type: "special_interest_area",
              answers: {
                project_name: "Current SIA Project",
                special_interest_area_selection: "sia_environment",
              },
            },
            siaList: [],
          },
        },
      },
    } as typeof window.$nuxt;

    InitSiaTransfer("/sia/requirements");
    InitSiaTransfer("/sia/requirements");

    expect(document.querySelectorAll(".summitSiaExportBtn")).toHaveLength(1);
  });

  it("downloads summit-sia-v1 JSON for the clicked card and excludes volatile/system fields/uploads", () => {
    document.body.innerHTML = `
      <section class="Requirements">
        <div class="Requirements__footer-actions">
          <button data-cy="BACK" class="v-btn">Back</button>
        </div>
      </section>
    `;

    window.$nuxt = {
      $store: {
        state: {
          sia: {
            currentSia: {
              id: "achv-1",
              member_id: "member-1",
              section: "scout",
              type: "special_interest_area",
              status: "in_progress",
              status_updated: "2026-05-04T00:00:00Z",
              template: "sia-template-v1",
              version: 3,
              answers: {
                project_name: "My First Project",
                special_interest_area_selection: "sia_environment",
                project_goal: "Build a native garden",
              },
              achievement_meta: {
                stage: 2,
              },
              event_log: [
                {
                  event_id: "evt-1",
                  event_name: "Garden planning",
                },
              ],
              uploads: [
                {
                  id: "upload-1",
                  filename: "proof.jpg",
                },
              ],
              latest_submission: {
                submission_id: "sub-1",
              },
              last_updated: "2026-05-04T00:00:00Z",
            },
            siaList: [
              {
                id: "achv-1",
                member_id: "member-1",
                section: "scout",
                type: "special_interest_area",
                status: "in_progress",
                status_updated: "2026-05-04T00:00:00Z",
                template: "sia-template-v1",
                version: 3,
                answers: {
                  project_name: "My First Project",
                  special_interest_area_selection: "sia_environment",
                  project_goal: "Build a native garden",
                },
                achievement_meta: {
                  stage: 2,
                },
                event_log: [
                  {
                    event_id: "evt-1",
                    event_name: "Garden planning",
                  },
                ],
                uploads: [
                  {
                    id: "upload-1",
                    filename: "proof.jpg",
                  },
                ],
                latest_submission: {
                  submission_id: "sub-1",
                },
                last_updated: "2026-05-04T00:00:00Z",
              },
            ],
          },
        },
      },
    } as typeof window.$nuxt;

    InitSiaTransfer("/sia/requirements");

    const appendSpy = jest.spyOn(document.body, "appendChild");
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const exportButton = document.querySelector(".summitSiaExportBtn") as HTMLButtonElement;
    exportButton.click();

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);

    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.tagName).toBe("A");
    expect(anchor.getAttribute("download")).toContain("my-first-project");
    expect(anchor.getAttribute("download")).toContain(".json");

    const href = anchor.getAttribute("href") ?? "";
    expect(href.startsWith("data:text/json;charset=utf-8,")).toBe(true);

    const parsed = JSON.parse(decodeURIComponent(href.replace("data:text/json;charset=utf-8,", ""))) as {
      contract: string;
      project: Record<string, unknown>;
    };

    expect(parsed.contract).toBe("summit-sia-v1");
    expect(parsed.project.type).toBe("special_interest_area");
    expect(parsed.project.section).toBe("scout");
    expect(parsed.project.answers).toEqual({
      project_name: "My First Project",
      special_interest_area_selection: "sia_environment",
      project_goal: "Build a native garden",
    });
    expect(parsed.project.achievement_meta).toEqual({ stage: 2 });
    expect(parsed.project.event_log).toEqual([
      {
        event_id: "evt-1",
        event_name: "Garden planning",
      },
    ]);

    expect(parsed.project.id).toBeUndefined();
    expect(parsed.project.member_id).toBeUndefined();
    expect(parsed.project.status).toBeUndefined();
    expect(parsed.project.status_updated).toBeUndefined();
    expect(parsed.project.last_updated).toBeUndefined();
    expect(parsed.project.latest_submission).toBeUndefined();
    expect(parsed.project.uploads).toBeUndefined();
  });

  it("falls back to first siaList project when currentSia is unavailable", () => {
    document.body.innerHTML = `
      <section class="Requirements">
        <div class="Requirements__footer-actions">
          <button data-cy="BACK" class="v-btn">Back</button>
        </div>
      </section>
    `;

    window.$nuxt = {
      $store: {
        state: {
          sia: {
            currentSia: null,
            siaList: [
              {
                type: "special_interest_area",
                section: "scout",
                answers: {
                  project_name: "FirstFromList",
                },
              },
              {
                type: "special_interest_area",
                section: "scout",
                answers: {
                  project_name: "SecondFromList",
                },
              },
            ],
          },
        },
      },
    } as typeof window.$nuxt;

    InitSiaTransfer("/sia/requirements");

    const appendSpy = jest.spyOn(document.body, "appendChild");
    jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const exportButton = document.querySelector(".summitSiaExportBtn") as HTMLButtonElement;
    exportButton.click();

    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    const href = anchor.getAttribute("href") ?? "";
    const parsed = JSON.parse(decodeURIComponent(href.replace("data:text/json;charset=utf-8,", ""))) as {
      project: {
        answers: {
          project_name: string;
        };
      };
    };

    expect(parsed.project.answers.project_name).toBe("FirstFromList");
  });

  it("injects one global Summit Import button in the /sia header action region and mirrors Terrain classes/data-v attributes", () => {
    document.body.innerHTML = `
      <section class="BaseOverview__main" data-region="sia-header-actions">
        <button data-cy="CREATE_PROJECT" data-v-import123 class="v-btn theme--light create-project-btn major">Create project</button>
      </section>
    `;

    InitSiaTransfer();

    const importButtons = document.querySelectorAll("button.summitSiaImportBtn");
    expect(importButtons).toHaveLength(1);

    const importButton = document.querySelector("button.summitSiaImportBtn") as HTMLButtonElement | null;
    const createProjectButton = document.querySelector('button[data-cy="CREATE_PROJECT"]');

    expect(importButton).not.toBeNull();
    expect(importButton?.textContent).toBe("Summit Import");
    expect(importButton?.classList.contains("v-btn")).toBe(true);
    expect(importButton?.classList.contains("create-project-btn")).toBe(true);
    expect(importButton?.classList.contains("major")).toBe(true);
    expect(importButton?.classList.contains("summit-menu-outline")).toBe(true);
    expect(importButton?.hasAttribute("data-v-import123")).toBe(true);
    expect(createProjectButton?.previousElementSibling).toBe(importButton);
  });

  it("imports summit-sia-v1 JSON via hidden file input and creates a new member achievement without uploads", async () => {
    document.body.innerHTML = `
      <section class="BaseOverview__main">
        <button data-cy="CREATE_PROJECT" class="v-btn">Create project</button>
      </section>
    `;

    mockedCreateMemberAchievement.mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);

    InitSiaTransfer();

    const importButton = document.querySelector("button.summitSiaImportBtn") as HTMLButtonElement;
    importButton.click();

    const input = document.querySelector("input.summitSiaImportInput") as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.type).toBe("file");
    expect(input.accept).toContain(".json");

    const file = new File(["ignored"], "sia-import.json", { type: "application/json" });
    Object.defineProperty(file, "text", {
      configurable: true,
      value: jest.fn().mockResolvedValue(
        JSON.stringify({
          contract: "summit-sia-v1",
          project: {
            section: "scout",
            type: "special_interest_area",
            template: "sia-template-v1",
            version: 1,
            answers: {
              project_name: "Imported project",
              special_interest_area_selection: "sia_environment",
            },
            uploads: [{ id: "upload-1" }],
          },
        }),
      ),
    });

    mockInputFile(input, file);
    input.dispatchEvent(new Event("change"));

    await flushAsyncWork();

    expect(mockedCreateMemberAchievement).toHaveBeenCalledTimes(1);

    const bodyArg = mockedCreateMemberAchievement.mock.calls[0][0] as string;
    const parsedBody = JSON.parse(bodyArg) as Record<string, unknown>;

    expect(parsedBody.type).toBe("special_interest_area");
    expect(parsedBody.answers).toEqual({
      project_name: "Imported project",
      special_interest_area_selection: "sia_environment",
    });
    expect(parsedBody.uploads).toBeUndefined();
    expect(alertSpy).toHaveBeenCalledWith("SIA project imported.");
  });

  it("shows validation feedback and does not create when import contract is invalid", async () => {
    document.body.innerHTML = `
      <section class="BaseOverview__main">
        <button data-cy="CREATE_PROJECT" class="v-btn">Create project</button>
      </section>
    `;

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);

    InitSiaTransfer();

    const importButton = document.querySelector("button.summitSiaImportBtn") as HTMLButtonElement;
    importButton.click();

    const input = document.querySelector("input.summitSiaImportInput") as HTMLInputElement;
    const file = new File(["ignored"], "sia-import.json", { type: "application/json" });
    Object.defineProperty(file, "text", {
      configurable: true,
      value: jest.fn().mockResolvedValue(
        JSON.stringify({
          contract: "not-summit-sia-v1",
          project: {
            type: "special_interest_area",
          },
        }),
      ),
    });

    mockInputFile(input, file);
    input.dispatchEvent(new Event("change"));

    await flushAsyncWork();

    expect(mockedCreateMemberAchievement).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("Invalid SIA import file. Expected summit-sia-v1 payload.");
  });

  it("shows validation feedback and does not create when import file is malformed JSON", async () => {
    document.body.innerHTML = `
      <section class="BaseOverview__main">
        <button data-cy="CREATE_PROJECT" class="v-btn">Create project</button>
      </section>
    `;

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);

    InitSiaTransfer();

    const importButton = document.querySelector("button.summitSiaImportBtn") as HTMLButtonElement;
    importButton.click();

    const input = document.querySelector("input.summitSiaImportInput") as HTMLInputElement;
    const file = new File(["ignored"], "sia-import.json", { type: "application/json" });
    Object.defineProperty(file, "text", {
      configurable: true,
      value: jest.fn().mockResolvedValue("{this-is-not-valid-json"),
    });

    mockInputFile(input, file);
    input.dispatchEvent(new Event("change"));

    await flushAsyncWork();

    expect(mockedCreateMemberAchievement).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("Invalid SIA import file. File must be valid JSON.");
  });

  it("shows validation feedback and does not create when required payload fields are missing", async () => {
    document.body.innerHTML = `
      <section class="BaseOverview__main">
        <button data-cy="CREATE_PROJECT" class="v-btn">Create project</button>
      </section>
    `;

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);

    InitSiaTransfer();

    const importButton = document.querySelector("button.summitSiaImportBtn") as HTMLButtonElement;
    importButton.click();

    const input = document.querySelector("input.summitSiaImportInput") as HTMLInputElement;
    const file = new File(["ignored"], "sia-import.json", { type: "application/json" });
    Object.defineProperty(file, "text", {
      configurable: true,
      value: jest.fn().mockResolvedValue(
        JSON.stringify({
          contract: "summit-sia-v1",
          project: {
            section: "scout",
            type: "special_interest_area",
            answers: {
              special_interest_area_selection: "sia_environment",
            },
          },
        }),
      ),
    });

    mockInputFile(input, file);
    input.dispatchEvent(new Event("change"));

    await flushAsyncWork();

    expect(mockedCreateMemberAchievement).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("Invalid SIA import file. Missing required project fields.");
  });

  it("keeps duplicate init guarded for global import controls across rerenders", () => {
    document.body.innerHTML = `
      <section class="BaseOverview__main">
        <button data-cy="CREATE_PROJECT" class="v-btn">Create project</button>
      </section>
    `;

    InitSiaTransfer();
    InitSiaTransfer();

    const firstImportButton = document.querySelector("button.summitSiaImportBtn") as HTMLButtonElement;
    firstImportButton.click();
    InitSiaTransfer();

    const secondImportButton = document.querySelector("button.summitSiaImportBtn") as HTMLButtonElement;
    secondImportButton.click();

    expect(document.querySelectorAll("button.summitSiaImportBtn")).toHaveLength(1);
    expect(document.querySelectorAll("input.summitSiaImportInput")).toHaveLength(1);
  });

  it("shows API feedback when create-only import fails", async () => {
    document.body.innerHTML = `
      <section class="BaseOverview__main">
        <button data-cy="CREATE_PROJECT" class="v-btn">Create project</button>
      </section>
    `;

    mockedCreateMemberAchievement.mockResolvedValue({ message: "Could not create SIA project" } as unknown as string);
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);

    InitSiaTransfer();

    const importButton = document.querySelector("button.summitSiaImportBtn") as HTMLButtonElement;
    importButton.click();

    const input = document.querySelector("input.summitSiaImportInput") as HTMLInputElement;
    const file = new File(["ignored"], "sia-import.json", { type: "application/json" });
    Object.defineProperty(file, "text", {
      configurable: true,
      value: jest.fn().mockResolvedValue(
        JSON.stringify({
          contract: "summit-sia-v1",
          project: {
            section: "scout",
            type: "special_interest_area",
            answers: {
              project_name: "Imported project",
              special_interest_area_selection: "sia_environment",
            },
          },
        }),
      ),
    });

    mockInputFile(input, file);
    input.dispatchEvent(new Event("change"));

    await flushAsyncWork();

    expect(mockedCreateMemberAchievement).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith("Could not create SIA project");
  });

  it("shows auth feedback and does not import when token is missing", async () => {
    document.body.innerHTML = `
      <section class="BaseOverview__main">
        <button data-cy="CREATE_PROJECT" class="v-btn">Create project</button>
      </section>
    `;

    mockedGetToken.mockReturnValue("");
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);

    InitSiaTransfer();

    const importButton = document.querySelector("button.summitSiaImportBtn") as HTMLButtonElement;
    importButton.click();

    const input = document.querySelector("input.summitSiaImportInput") as HTMLInputElement;
    const file = new File(["ignored"], "sia-import.json", { type: "application/json" });
    Object.defineProperty(file, "text", {
      configurable: true,
      value: jest.fn().mockResolvedValue(
        JSON.stringify({
          contract: "summit-sia-v1",
          project: {
            section: "scout",
            type: "special_interest_area",
            answers: {
              project_name: "Imported project",
            },
          },
        }),
      ),
    });

    mockInputFile(input, file);
    input.dispatchEvent(new Event("change"));

    await flushAsyncWork();

    expect(mockedCreateMemberAchievement).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("You must be logged in to import an SIA project.");
    expect(alertSpy).not.toHaveBeenCalledWith("SIA project imported.");
  });
});
