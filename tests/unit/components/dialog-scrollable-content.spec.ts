import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import * as fs from "fs";
import * as path from "path";
import { DialogComponent } from "@/components/DialogComponent";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const STYLES_PATH = path.resolve(REPO_ROOT, "src/styles/index.css");

const readCssRule = (css: string, selector: string): string => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escapedSelector}\\s*\\{[\\s\\S]*?\\}`))?.[0] ?? "";
};

describe("Phase 4 dialog scroll and footer hardening contract", () => {
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

  it("DialogComponent body is vertically scrollable with horizontal overflow protection and flex shrink safeguards", () => {
    const overflowingChildren = Array.from({ length: 80 }, (_, index) => React.createElement("p", { key: `line-${index}` }, `Scrollable line ${index + 1}`));

    act(() => {
      root.render(React.createElement(DialogComponent, { id: "scroll-test-dialog", visible: true, header: "Scrollable Dialog" }, React.createElement("div", { id: "overflowing-content" }, overflowingChildren)));
    });

    const dialogSurface = container.querySelector(".summit-dialog-surface") as HTMLDivElement;
    expect(dialogSurface).toBeTruthy();

    const contentRegion = dialogSurface.children.item(1) as HTMLDivElement;
    expect(contentRegion).toBeTruthy();
    expect(contentRegion.style.flex).toBe("1 1 0%");
    expect(["0", "0px"]).toContain(contentRegion.style.minHeight);
    expect(contentRegion.style.overflowY).toBe("auto");
    expect(contentRegion.style.overflowX).toBe("hidden");
  });

  it("summit dialog surface uses border-box sizing so borders stay inside declared dimensions", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");
    const surfaceRule = readCssRule(css, ".summit-dialog-surface");

    expect(surfaceRule).toContain("width: 80%");
    expect(surfaceRule).toContain("height: 80%");
    expect(surfaceRule).toMatch(/box-sizing\s*:\s*border-box/);
  });

  it("DialogComponent body prevents horizontal overflow while preserving vertical scrolling", () => {
    act(() => {
      root.render(
        React.createElement(DialogComponent, { id: "horizontal-overflow-dialog", visible: true, header: "Overflow Protection" }, React.createElement("div", { style: { width: "200vw" } }, "Overwide content must not bleed horizontally")),
      );
    });

    const dialogSurface = container.querySelector(".summit-dialog-surface") as HTMLDivElement;
    expect(dialogSurface).toBeTruthy();

    const contentRegion = dialogSurface.children.item(1) as HTMLDivElement;
    expect(contentRegion).toBeTruthy();
    expect(contentRegion.style.overflowY).toBe("auto");
    expect(contentRegion.style.overflowX).toBe("hidden");
  });

  it("dialog footer actions remain sticky outside the scroll body and independently accessible", () => {
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
    expect(contentRegionContains(dialogSurface.children.item(1), "Save")).toBe(false);
    expect(footerRegion.style.position).toBe("sticky");
    expect(footerRegion.style.bottom).toBe("0px");
    expect(footerRegion.style.flexShrink).toBe("0");

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

  it("custom footer prop receives sticky footer treatment outside the scrollable body", () => {
    act(() => {
      root.render(
        React.createElement(
          DialogComponent,
          { id: "custom-footer-dialog", visible: true, header: "Custom Footer", footer: React.createElement("div", { "data-testid": "custom-footer-content" }, "Custom actions") },
          React.createElement("div", null, "Scrollable body"),
        ),
      );
    });

    const dialogSurface = container.querySelector(".summit-dialog-surface") as HTMLDivElement;
    expect(dialogSurface).toBeTruthy();

    const contentRegion = dialogSurface.children.item(1) as HTMLDivElement;
    const footerRegion = dialogSurface.children.item(2) as HTMLDivElement;
    expect(contentRegion.textContent).not.toContain("Custom actions");
    expect(footerRegion.textContent).toContain("Custom actions");
    expect(footerRegion.style.position).toBe("sticky");
    expect(footerRegion.style.bottom).toBe("0px");
    expect(footerRegion.style.flexShrink).toBe("0");
  });

  it("custom footer prop receives footer treatment equivalent to the buttons pathway", () => {
    act(() => {
      root.render(
        React.createElement(
          DialogComponent,
          {
            id: "custom-footer-equivalence-dialog",
            visible: true,
            header: "Custom Footer Equivalence",
            footer: React.createElement("button", { type: "button" }, "Custom Save"),
            buttons: [{ buttonModel: { content: "Button Save", cssClass: "summit-button summit-button-primary" } }],
          },
          React.createElement("div", null, "Scrollable body"),
        ),
      );
    });

    const dialogSurface = container.querySelector(".summit-dialog-surface") as HTMLDivElement;
    expect(dialogSurface).toBeTruthy();

    const customFooterRegion = dialogSurface.children.item(2) as HTMLDivElement;
    const buttonsFooterRegion = dialogSurface.children.item(3) as HTMLDivElement;
    expect(customFooterRegion.textContent).toContain("Custom Save");
    expect(buttonsFooterRegion.textContent).toContain("Button Save");

    ["display", "justifyContent", "gap", "marginTop", "position", "bottom", "background", "paddingTop", "flexShrink"].forEach((styleName) => {
      const key = styleName as keyof CSSStyleDeclaration;
      expect(customFooterRegion.style[key]).toBe(buttonsFooterRegion.style[key]);
    });
  });
});

const contentRegionContains = (region: Element | null, text: string): boolean => region?.textContent?.includes(text) ?? false;
