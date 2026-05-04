import jquery from "jquery";
import { createMemberAchievement } from "@/services";
import { TerrainState } from "@/helpers";

const SIA_EXPORT_BUTTON_CLASS = "summitSiaExportBtn";
const SIA_EXPORT_BUTTON_TEXT = "Summit Export";
const SIA_IMPORT_BUTTON_CLASS = "summitSiaImportBtn";
const SIA_IMPORT_BUTTON_TEXT = "Summit Import";
const SIA_IMPORT_INPUT_CLASS = "summitSiaImportInput";
const SIA_EXPORT_CONTRACT = "summit-sia-v1";
const SIA_EXPORT_DATA_PREFIX = "data:text/json;charset=utf-8,";

type SiaProject = Record<string, unknown>;

type SiaImportContract = {
  contract: string;
  project: SiaProject;
};

function getSiaProjects(): SiaProject[] {
  return ((window.$nuxt?.$store?.state?.sia?.siaList as SiaProject[] | undefined) ?? []).slice(0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function slugifyFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getDownloadName(project: SiaProject, projectIndex: number): string {
  const answers = (project.answers as Record<string, unknown> | undefined) ?? {};
  const candidate = (answers.project_name as string | undefined) ?? (answers.project_title as string | undefined) ?? (answers.special_interest_area_selection as string | undefined) ?? `sia-project-${projectIndex + 1}`;

  return `${slugifyFilename(candidate) || `sia-project-${projectIndex + 1}`}.json`;
}

function buildPortableProject(project: SiaProject): SiaProject {
  const allowedKeys = ["section", "type", "template", "version", "answers", "achievement_meta", "event_log", "event_count", "imported", "expiry_date"];

  return allowedKeys.reduce((result, key) => {
    if (project[key] !== undefined) {
      result[key] = project[key];
    }
    return result;
  }, {} as SiaProject);
}

function getGlobalActionAnchorButton(): JQuery<HTMLElement> {
  const selectors = ["section.BaseOverview__main button[data-cy='CREATE_PROJECT']", "section.BaseOverview__main button", "button[data-cy='CREATE_PROJECT']", "button[data-cy*='CREATE_PROJECT']", "button[data-cy*='CREATE']"];

  for (const selector of selectors) {
    const button = jquery(selector).first();
    if (button.length > 0) {
      return button;
    }
  }

  return jquery();
}

function getImportInput(): HTMLInputElement {
  const existing = document.querySelector(`input.${SIA_IMPORT_INPUT_CLASS}`) as HTMLInputElement | null;
  if (existing) {
    return existing;
  }

  const inputElement = document.createElement("input");
  inputElement.type = "file";
  inputElement.accept = ".json,application/json";
  inputElement.className = SIA_IMPORT_INPUT_CLASS;
  inputElement.style.display = "none";

  inputElement.addEventListener("change", () => {
    const file = inputElement.files?.[0];
    if (!file) return;

    importSiaProject(file);
  });

  document.body.appendChild(inputElement);
  return inputElement;
}

function parseImportContract(text: string): SiaImportContract {
  const parsed = JSON.parse(text) as unknown;
  if (!isRecord(parsed) || parsed.contract !== SIA_EXPORT_CONTRACT || !isRecord(parsed.project)) {
    throw new Error("Invalid SIA import file. Expected summit-sia-v1 payload.");
  }

  if (parsed.project.type !== "special_interest_area") {
    throw new Error("Invalid SIA import file. Expected special_interest_area project type.");
  }

  return {
    contract: SIA_EXPORT_CONTRACT,
    project: parsed.project,
  };
}

function getFeedbackMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (isRecord(error) && typeof error.message === "string") return error.message;
  return "Could not import SIA project.";
}

async function importSiaProject(file: File): Promise<void> {
  try {
    if (!TerrainState.getToken()) {
      alert("You must be logged in to import an SIA project.");
      return;
    }

    const text = await file.text();
    const contract = parseImportContract(text);
    const importBody = buildPortableProject(contract.project);
    const result = await createMemberAchievement(JSON.stringify(importBody));

    if (result) {
      alert(getFeedbackMessage(result));
      return;
    }

    alert("SIA project imported.");
  } catch (error) {
    alert(getFeedbackMessage(error));
  }
}

function downloadProject(project: SiaProject, projectIndex: number): void {
  const payload = {
    contract: SIA_EXPORT_CONTRACT,
    project: buildPortableProject(project),
  };

  const data = SIA_EXPORT_DATA_PREFIX + encodeURIComponent(JSON.stringify(payload));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", data);
  downloadAnchorNode.setAttribute("download", getDownloadName(project, projectIndex));
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function exportSiaProject(projectIndex: number): void {
  const project = getSiaProjects()[projectIndex];
  if (!project) {
    console.warn(`Could not export SIA project for card index ${projectIndex}: no matching project found.`);
    return;
  }

  downloadProject(project, projectIndex);
}

function getAnchorButton(actionArea: JQuery<HTMLElement>): JQuery<HTMLElement> {
  return actionArea.find("button[data-cy*='VIEW'], button[data-cy*='EDIT'], button[data-cy*='REVIEW'], button").first();
}

function setClasses(button: JQuery<HTMLElement>, anchorButton: JQuery<HTMLElement>, summitClass: string): void {
  button.removeClass().addClass(summitClass);
  button.addClass(anchorButton.attr("class") ?? "");
  button.addClass("summit-menu-outline");
}

function copyScopedAttributes(button: JQuery<HTMLElement>, anchorButton: JQuery<HTMLElement>): void {
  Array.from(anchorButton.get(0)?.attributes ?? []).forEach((attr) => {
    if (attr.name.startsWith("data-v-")) {
      button.attr(attr.name, "");
    }
  });
}

function createExportButton(actionArea: JQuery<HTMLElement>, anchorButton: JQuery<HTMLElement>, projectIndex: number): void {
  if (actionArea.find(`button.${SIA_EXPORT_BUTTON_CLASS}`).length > 0) return;

  const button = jquery("<button>", {
    text: SIA_EXPORT_BUTTON_TEXT,
    class: SIA_EXPORT_BUTTON_CLASS,
    "data-cy": "SUMMIT_EXPORT_SIA",
    "data-summit-sia-project-index": String(projectIndex),
    click: () => {
      exportSiaProject(projectIndex);
    },
  });

  copyScopedAttributes(button, anchorButton);
  setClasses(button, anchorButton, SIA_EXPORT_BUTTON_CLASS);
  anchorButton.before(button);
}

function createImportButton(anchorButton: JQuery<HTMLElement>): void {
  if (jquery(`button.${SIA_IMPORT_BUTTON_CLASS}`).length > 0) return;

  const button = jquery("<button>", {
    text: SIA_IMPORT_BUTTON_TEXT,
    class: SIA_IMPORT_BUTTON_CLASS,
    "data-cy": "SUMMIT_IMPORT_SIA",
    click: () => {
      const input = getImportInput();
      input.value = "";
      input.click();
    },
  });

  copyScopedAttributes(button, anchorButton);
  setClasses(button, anchorButton, SIA_IMPORT_BUTTON_CLASS);
  anchorButton.before(button);
}

export function InitSiaTransfer(): void {
  const importAnchor = getGlobalActionAnchorButton();
  if (importAnchor.length > 0) {
    createImportButton(importAnchor);
  }

  jquery("div.ListItem__action-btn-col").each((index, actionAreaElement) => {
    const actionArea = jquery(actionAreaElement);
    const anchorButton = getAnchorButton(actionArea);
    if (anchorButton.length === 0) return;

    createExportButton(actionArea, anchorButton, index);
  });
}
