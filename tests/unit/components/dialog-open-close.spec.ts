import * as fs from "fs";
import * as path from "path";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { DialogComponent, DialogHandle } from "@/components/DialogComponent";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 2 dialog behavior contract", () => {
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

  it("uses OSS dialog wrapper in SummitCalendar and removes Syncfusion dialog import", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain('from "@/components/DialogComponent"');
    expect(source).not.toContain("@syncfusion/ej2-react-popups");
    expect(source).toContain("<DialogComponent");
  });

  it("supports imperative show/hide and close callback", () => {
    const ref = React.createRef<DialogHandle>();
    const onClose = jest.fn();

    act(() => {
      root.render(
        React.createElement(
          DialogComponent,
          { ref, id: "dialog", visible: false, header: "View Event", close: onClose, buttons: [{ buttonModel: { content: "Close Event" }, click: () => ref.current?.hide() }] },
          React.createElement("iframe", { id: "eventFrame", title: "Modal Content" }),
        ),
      );
    });

    expect(container.textContent).not.toContain("View Event");

    act(() => {
      ref.current?.show(true);
    });

    expect(container.textContent).toContain("View Event");

    const closeButton = container.querySelector("button[data-dialog-close='true']") as HTMLButtonElement;
    expect(closeButton).toBeTruthy();

    act(() => {
      closeButton.click();
    });

    expect(onClose).toHaveBeenCalled();
    expect(container.textContent).not.toContain("View Event");
  });

  it("scrollable content area has overflowY auto so tall content is accessible", () => {
    act(() => {
      root.render(
        React.createElement(
          DialogComponent,
          { visible: true, header: "Scroll Test" },
          React.createElement("div", { "data-testid": "scroll-content" }, "content"),
        ),
      );
    });

    const surface = container.querySelector(".summit-dialog-surface") as HTMLElement;
    expect(surface).toBeTruthy();

    // The scrollable content wrapper is the first sibling after the header
    const header = surface.querySelector(".summit-dialog-header") as HTMLElement;
    const scrollableDiv = header.nextElementSibling as HTMLElement;
    expect(scrollableDiv).toBeTruthy();
    expect(scrollableDiv.style.overflowY).toBe("auto");
  });

  it("renders footer prop outside the scrollable content area", () => {
    act(() => {
      root.render(
        React.createElement(
          DialogComponent,
          {
            visible: true,
            header: "Footer Test",
            footer: React.createElement("div", { "data-testid": "fixed-footer" }, "Footer Buttons"),
          },
          React.createElement("div", {}, "Body content"),
        ),
      );
    });

    const surface = container.querySelector(".summit-dialog-surface") as HTMLElement;
    expect(surface).toBeTruthy();
    expect(container.textContent).toContain("Footer Buttons");
    expect(container.textContent).toContain("Body content");

    // Footer must NOT be inside the scrollable content area
    const header = surface.querySelector(".summit-dialog-header") as HTMLElement;
    const scrollableDiv = header.nextElementSibling as HTMLElement;
    expect(scrollableDiv.textContent).not.toContain("Footer Buttons");

    // Footer must appear after the scrollable div
    const footerWrapper = scrollableDiv.nextElementSibling as HTMLElement;
    expect(footerWrapper).toBeTruthy();
    expect(footerWrapper.textContent).toContain("Footer Buttons");
  });

  it("SummitCalendar passes editorFooterTemplate via footer prop, not as child content", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");
    // footer prop must be present on the calendar-editor-dialog
    expect(source).toMatch(/id="calendar-editor-dialog"[^>]*footer=\{/s);
    // editorFooterTemplate must NOT appear inside the scrollable child div (data-editor-speed-contract block)
    const scrollableChildMatch = source.match(/data-editor-speed-contract="calendar-editor-speed"[\s\S]*?<\/div>\s*<\/DialogComponent>/);
    expect(scrollableChildMatch).not.toBeNull();
    expect(scrollableChildMatch![0]).not.toContain("editorFooterTemplate()");
  });
});
