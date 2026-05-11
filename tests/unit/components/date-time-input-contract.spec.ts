import * as fs from "fs";
import * as path from "path";
import React from "react";
import moment from "moment";
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

  it("preserves zoned iso date and time display values", () => {
    const dateElement = DatePickerComponent({
      id: "start_date",
      name: "start_date",
      value: "2026-04-07T03:00:00+10:00",
    }) as React.ReactElement;

    const timeElement = TimePickerComponent({
      id: "start_time",
      name: "start_time",
      value: "2026-04-07T03:00:00+10:00",
    }) as React.ReactElement;

    expect(dateElement.props.value).toBe("2026-04-07");
    expect(timeElement.props.value).toBe("03:00");
  });

  it("shows_local_time_for_utc_activity_in_editor", () => {
    const utcSource = "2026-04-01T09:00:00.000Z";
    const expectedLocalDate = moment.utc(utcSource).local().format("YYYY-MM-DD");
    const expectedLocalTime = moment.utc(utcSource).local().format("HH:mm");

    const dateElement = DatePickerComponent({
      id: "start_date",
      name: "start_date",
      value: utcSource,
    }) as React.ReactElement;

    const timeElement = TimePickerComponent({
      id: "start_time",
      name: "start_time",
      value: utcSource,
    }) as React.ReactElement;

    expect(dateElement.props.value).toBe(expectedLocalDate);
    expect(timeElement.props.value).toBe(expectedLocalTime);
  });

  it("does_not_shift_by_12_hours_for_evening_times", () => {
    const utcSource = "2026-04-01T08:00:00.000Z";
    const expectedLocalTime = moment.utc(utcSource).local().format("HH:mm");
    const [expectedHours, expectedMinutes] = expectedLocalTime.split(":");
    const twelveHourDriftTime = `${String((Number(expectedHours) + 12) % 24).padStart(2, "0")}:${expectedMinutes}`;

    const timeElement = TimePickerComponent({
      id: "start_time",
      name: "start_time",
      value: utcSource,
    }) as React.ReactElement;

    expect(timeElement.props.value).toBe(expectedLocalTime);
    expect(timeElement.props.value).not.toBe(twelveHourDriftTime);
  });
});
