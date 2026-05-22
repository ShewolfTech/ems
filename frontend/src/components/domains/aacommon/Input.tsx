import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = "", ...props }) => (
  <div className="flex flex-col w-full gap-1.5">
    {label && (
      <label className="text-sm font-bold text-slate-700 tracking-tight ml-1">
        {label}
      </label>
    )}
    <input
      className={`
        w-full px-4 py-3 
        bg-slate-50 border border-slate-200 
        rounded-xl text-sm font-semibold text-slate-900
        placeholder:text-slate-400 placeholder:font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white
        disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
        ${error ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""}
        ${className}
      `}
      {...props}
    />
    {error && (
      <span className="text-[11px] font-bold text-red-600 ml-1 animate-in fade-in slide-in-from-top-1">
        {error}
      </span>
    )}
  </div>
);

export default Input;