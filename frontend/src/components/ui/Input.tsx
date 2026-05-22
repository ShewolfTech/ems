import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700">{label}</label>
    <input 
      {...props}
      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm outline-none"
    />
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);