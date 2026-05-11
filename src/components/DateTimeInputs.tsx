import React from "react";
import moment from "moment";

interface BaseDateTimeProps {
  id?: string;
  name?: string;
  value?: Date | string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

interface DatePickerProps extends BaseDateTimeProps {
  format?: string;
  showClearButton?: boolean;
}

interface TimePickerProps extends BaseDateTimeProps {
  format?: string;
  showClearButton?: boolean;
}

const hasExplicitOffset = (value: string) => /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);

const isExplicitUtcOffset = (value: string) => /(?:Z|[+-]00:00)$/i.test(value);

const toDisplayMoment = (value: string) => {
  if (!hasExplicitOffset(value) || isExplicitUtcOffset(value)) {
    const parsedUtc = moment.utc(value, moment.ISO_8601, true);
    return parsedUtc.isValid() ? parsedUtc.local() : null;
  }

  const parsedZoned = moment.parseZone(value, moment.ISO_8601, true);
  return parsedZoned.isValid() ? parsedZoned : null;
};

const toDateValue = (value?: Date | string) => {
  if (typeof value === "string") {
    const parsed = toDisplayMoment(value);
    return parsed && parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
  }

  if (!value || Number.isNaN(value.getTime())) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeValue = (value?: Date | string) => {
  if (typeof value === "string") {
    const parsed = toDisplayMoment(value);
    return parsed && parsed.isValid() ? parsed.format("HH:mm") : "";
  }

  if (!value || Number.isNaN(value.getTime())) {
    return "";
  }

  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const DatePickerComponent: React.FC<DatePickerProps> = ({ id, name, value, onChange, disabled, onFocus }) => {
  return (
    <input
      id={id}
      name={name}
      className="summit-form-input"
      type="date"
      value={toDateValue(value)}
      onChange={onChange}
      disabled={disabled}
      onFocus={onFocus}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck={false}
      data-lpignore="true"
      data-1p-ignore="true"
      data-form-type="other"
    />
  );
};

export const TimePickerComponent: React.FC<TimePickerProps> = ({ id, name, value, onChange, disabled, onFocus }) => {
  return (
    <input
      id={id}
      name={name}
      className="summit-form-input"
      type="time"
      value={toTimeValue(value)}
      onChange={onChange}
      disabled={disabled}
      onFocus={onFocus}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck={false}
      data-lpignore="true"
      data-1p-ignore="true"
      data-form-type="other"
    />
  );
};
