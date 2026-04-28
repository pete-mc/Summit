import React from "react";

type DropdownOption = {
  text: string;
  value: string;
};

type DropdownChangeEvent = {
  value: string;
  element: HTMLSelectElement;
  isInteracted: boolean;
};

interface DropDownListProps {
  id?: string;
  name?: string;
  dataSource: DropdownOption[];
  value?: string;
  text?: string;
  change?: (event: DropdownChangeEvent) => void;
  enabled?: boolean;
}

export const DropDownListComponent: React.FC<DropDownListProps> = ({ id, name, dataSource, value, change, enabled = true }) => {
  return (
    <select
      id={id}
      name={name}
      className="summit-form-input"
      value={value ?? ""}
      disabled={!enabled}
      onChange={(event) => {
        change?.({
          value: event.target.value,
          element: event.target,
          isInteracted: true,
        });
      }}
    >
      <option value="" />
      {dataSource.map((option) => (
        <option key={option.value} value={option.value}>
          {option.text}
        </option>
      ))}
    </select>
  );
};
