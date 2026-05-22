import React from "react";

interface StaticSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}

export const StaticSelect: React.FC<StaticSelectProps> = ({ options, value, onChange }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

// Example presets
export const YesNoSelect = (props: Omit<StaticSelectProps, "options">) =>
  <StaticSelect {...props} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />;
