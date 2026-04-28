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
});
