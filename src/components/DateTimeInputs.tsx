import React from "react";

interface BaseDateTimeProps {
  id?: string;
  name?: string;
  value?: Date;
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

const toDateValue = (value?: Date) => {
  if (!value || Number.isNaN(value.getTime())) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeValue = (value?: Date) => {
  if (!value || Number.isNaN(value.getTime())) {
    return "";
  }

  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const DatePickerComponent: React.FC<DatePickerProps> = ({ id, name, value, onChange, disabled, onFocus }) => {
  return <input id={id} name={name} className="summit-form-input" type="date" value={toDateValue(value)} onChange={onChange} disabled={disabled} onFocus={onFocus} />;
};

export const TimePickerComponent: React.FC<TimePickerProps> = ({ id, name, value, onChange, disabled, onFocus }) => {
  return <input id={id} name={name} className="summit-form-input" type="time" value={toTimeValue(value)} onChange={onChange} disabled={disabled} onFocus={onFocus} />;
};
