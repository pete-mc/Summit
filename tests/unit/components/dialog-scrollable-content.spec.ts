import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { DialogComponent } from "@/components/DialogComponent";

describe("Phase 1 dialog scroll behavior contract", () => {
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

  it("DialogComponent body is vertically scrollable for overflowing content", () => {
    const overflowingChildren = Array.from({ length: 80 }, (_, index) => React.createElement("p", { key: `line-${index}` }, `Scrollable line ${index + 1}`));

    act(() => {
      root.render(
        React.createElement(DialogComponent, { id: "scroll-test-dialog", visible: true, header: "Scrollable Dialog" }, React.createElement("div", { id: "overflowing-content" }, overflowingChildren)),
      );
    });

    const dialogSurface = container.querySelector(".summit-dialog-surface") as HTMLDivElement;
    expect(dialogSurface).toBeTruthy();

    const contentRegion = dialogSurface.children.item(1) as HTMLDivElement;
    expect(contentRegion).toBeTruthy();
    expect(contentRegion.style.overflowY).toBe("auto");
  });

  it("dialog footer actions remain rendered and independently accessible", () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    act(() => {
      root.render(
        React.createElement(
          DialogComponent,
          {
            id: "footer-test-dialog",
            visible: true,
            header: "Footer Behavior",
            buttons: [
              { buttonModel: { content: "Save", cssClass: "summit-button summit-button-primary" }, click: onSave },
              { buttonModel: { content: "Cancel", cssClass: "summit-button summit-button-secondary" }, click: onCancel },
            ],
          },
          React.createElement("div", null, "Body"),
        ),
      );
    });

    const dialogSurface = container.querySelector(".summit-dialog-surface") as HTMLDivElement;
    expect(dialogSurface).toBeTruthy();

    const footerRegion = dialogSurface.children.item(2) as HTMLDivElement;
    expect(footerRegion).toBeTruthy();
    expect(footerRegion.style.position).toBe("sticky");
    expect(footerRegion.style.bottom).toBe("0px");

    const saveButton = Array.from(footerRegion.querySelectorAll("button")).find((button) => button.textContent?.trim() === "Save") as HTMLButtonElement | undefined;
    const cancelButton = Array.from(footerRegion.querySelectorAll("button")).find((button) => button.textContent?.trim() === "Cancel") as HTMLButtonElement | undefined;

    expect(saveButton).toBeTruthy();
    expect(cancelButton).toBeTruthy();

    act(() => {
      saveButton?.click();
      cancelButton?.click();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});