import { resolveEventTextColor } from "@/pages/SummitCalendar/components/SummitCalendar";

jest.mock("@fullcalendar/react", () => () => null);
jest.mock("@fullcalendar/core/locales/en-au", () => ({}));
jest.mock("@fullcalendar/daygrid", () => ({}));
jest.mock("@fullcalendar/timegrid", () => ({}));
jest.mock("@fullcalendar/list", () => ({}));
jest.mock("@fullcalendar/interaction", () => ({}));
jest.mock("react-datepicker", () => () => null);
jest.mock("react-datepicker/dist/react-datepicker.css", () => ({}), { virtual: true });

describe("Phase 2 eventDidMount text color fallback", () => {
  it("uses event textColor when present", () => {
    expect(resolveEventTextColor("#123456", "#00ae42")).toBe("#123456");
  });

  it("falls back to a contrast color derived from item.color when event textColor is missing", () => {
    expect(resolveEventTextColor(undefined, "#00ae42")).toBe("#000");
    expect(resolveEventTextColor("", "#9e1b32")).toBe("#fff");
  });
});