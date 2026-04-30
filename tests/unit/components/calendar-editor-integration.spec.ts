import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import * as fs from "fs";
import * as path from "path";
import { DialogComponent } from "@/components/DialogComponent";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");
const STYLES_PATH = path.resolve(REPO_ROOT, "src/styles/index.css");

describe("Phase 3 calendar editor integration contract", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("calendar-editor-dialog content remains reachable via vertical scroll", () => {
    const editorBody = Array.from({ length: 120 }, (_, index) => React.createElement("div", { key: `editor-line-${index}` }, `Editor field ${index + 1}`));

    act(() => {
      root.render(
        React.createElement(
          DialogComponent,
          {
            id: "calendar-editor-dialog",
            visible: true,
            header: "Calendar Editor",
            buttons: [{ buttonModel: { content: "Save", cssClass: "summit-button summit-button-primary" } }],
          },
          React.createElement("div", { id: "calendar-editor-body" }, editorBody),
        ),
      );
    });

    const dialog = container.querySelector("#calendar-editor-dialog") as HTMLDivElement;
    expect(dialog).toBeTruthy();

    const contentRegion = dialog.querySelector(".summit-dialog-surface")?.children.item(1) as HTMLDivElement;
    expect(contentRegion).toBeTruthy();
    expect(contentRegion.style.overflowY).toBe("auto");

    const saveButton = Array.from(dialog.querySelectorAll("button")).find((button) => button.textContent?.trim() === "Save") as HTMLButtonElement | undefined;
    expect(saveButton).toBeTruthy();
  });

  it("calendar editor long-form sections remain accessible without clipping", () => {
    const summitCalendarSource = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");
    const stylesSource = fs.readFileSync(STYLES_PATH, "utf8");

    expect(summitCalendarSource).toMatch(/<DialogComponent\s+[\s\S]*?id="calendar-editor-dialog"/);
    expect(summitCalendarSource).toContain('data-editor-speed-contract="calendar-editor-speed"');
    expect(summitCalendarSource).toContain("this.editorTemplate()");
    expect(summitCalendarSource).toContain("this.editorFooterTemplate()");

    const editorContainerRule = stylesSource.match(/\.editor-container\s*\{[\s\S]*?\}/)?.[0] ?? "";
    expect(editorContainerRule).toContain("display: flex");
    expect(editorContainerRule).toContain("flex-direction: column");
    expect(editorContainerRule).not.toMatch(/overflow\s*:\s*hidden/i);
    expect(editorContainerRule).not.toMatch(/overflow-y\s*:\s*hidden/i);
    expect(editorContainerRule).not.toMatch(/max-height\s*:/i);
  });
});
