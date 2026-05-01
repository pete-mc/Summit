import * as fs from "fs";
import * as path from "path";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { DropDownListComponent } from "@/components/SimpleDropdown";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 2 dropdown selection contract", () => {
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

  it("uses OSS dropdown wrapper for simple selection in SummitCalendar", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain('from "@/components/SimpleDropdown"');
    expect(source).toContain("<DropDownListComponent");
    expect(source).not.toContain("DropDownListComponent, DropDownTreeComponent");
  });

  it("emits change payload with element id and selected value", () => {
    const handleChange = jest.fn();

    act(() => {
      root.render(
        React.createElement(DropDownListComponent, {
          id: "challenge_area",
          name: "challenge_area",
          dataSource: [
            { text: "Community", value: "community" },
            { text: "Creative", value: "creative" },
          ],
          value: "community",
          change: handleChange,
        }),
      );
    });

    const select = container.querySelector("select[id='challenge_area']") as HTMLSelectElement;
    expect(select).toBeTruthy();

    act(() => {
      select.value = "creative";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        value: "creative",
        element: expect.objectContaining({ id: "challenge_area" }),
      }),
    );
  });
});
