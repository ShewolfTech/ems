import React from 'react';
import { cn } from '../utils/cn.js';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { label: string; value: string | number }[];
  error?: string;
}

export const Select = ({ label, options, error, className, ...props }: SelectProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <select
      className={cn(
        "h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all",
        error && "border-red-500",
        className
      )}
      {...props}
    >
      <option value="">Select {label}...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);