import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { DialogComponent } from "@/components/DialogComponent";

describe("Phase 1 calendar editor integration contract", () => {
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
});
