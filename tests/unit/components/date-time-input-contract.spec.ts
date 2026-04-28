import * as fs from "fs";
import * as path from "path";
import React from "react";
import { DatePickerComponent, TimePickerComponent } from "@/components/DateTimeInputs";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");
const PRESENT_AWARDS_PATH = path.resolve(REPO_ROOT, "src/pages/PresentAwards/components/PresentAwards.tsx");

describe("Phase 2 date/time input contracts", () => {
  it("uses OSS date/time wrappers and removes Syncfusion calendar imports", () => {
    const summitCalendarSource = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");
    const presentAwardsSource = fs.readFileSync(PRESENT_AWARDS_PATH, "utf8");

    expect(summitCalendarSource).toContain('from "@/components/DateTimeInputs"');
    expect(presentAwardsSource).toContain('from "@/components/DateTimeInputs"');
    expect(summitCalendarSource).not.toContain("@syncfusion/ej2-react-calendars");
    expect(presentAwardsSource).not.toContain("@syncfusion/ej2-react-calendars");
  });

  it("emits name/value change events for date and time fields", () => {
    const handleDateChange = jest.fn();
    const handleTimeChange = jest.fn();

    const dateElement = DatePickerComponent({
      id: "start_date",
      name: "start_date",
      value: new Date("2026-01-01T10:00:00.000Z"),
      onChange: handleDateChange,
    }) as React.ReactElement;

    const timeElement = TimePickerComponent({
      id: "start_time",
      name: "start_time",
      value: new Date("2026-01-01T10:00:00.000Z"),
      onChange: handleTimeChange,
    }) as React.ReactElement;

    const dateEvent = { target: { name: "start_date", value: "2026-01-05" } } as React.ChangeEvent<HTMLInputElement>;
    const timeEvent = { target: { name: "start_time", value: "09:30" } } as React.ChangeEvent<HTMLInputElement>;

    (dateElement.props.onChange as (event: React.ChangeEvent<HTMLInputElement>) => void)(dateEvent);
    (timeElement.props.onChange as (event: React.ChangeEvent<HTMLInputElement>) => void)(timeEvent);

    expect(handleDateChange).toHaveBeenCalled();
    expect(handleTimeChange).toHaveBeenCalled();
    expect(handleDateChange).toHaveBeenCalledWith(dateEvent);
    expect(handleTimeChange).toHaveBeenCalledWith(timeEvent);
  });
});
