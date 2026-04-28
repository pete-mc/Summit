import * as fs from "fs";
import * as path from "path";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { ToastComponent, ToastHandle } from "@/components/ToastComponent";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const PRESENT_AWARDS_PATH = path.resolve(REPO_ROOT, "src/pages/PresentAwards/components/PresentAwards.tsx");

describe("Phase 2 toast behavior contract", () => {
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

  it("uses OSS toast wrapper in PresentAwards and removes Syncfusion toast import", () => {
    const source = fs.readFileSync(PRESENT_AWARDS_PATH, "utf8");

    expect(source).toContain('from "@/components/ToastComponent"');
    expect(source).not.toContain("@syncfusion/ej2-react-notifications");
    expect(source).toContain("<ToastComponent");
  });

  it("exposes imperative show() and displays toast content", () => {
    const ref = React.createRef<ToastHandle>();

    act(() => {
      root.render(React.createElement(ToastComponent, { id: "toast_target", ref, title: "Warning", content: "No new awards were selected as presented." }));
    });

    expect(container.textContent).not.toContain("No new awards were selected as presented.");

    act(() => {
      ref.current?.show();
    });

    expect(container.textContent).toContain("No new awards were selected as presented.");
  });
});
