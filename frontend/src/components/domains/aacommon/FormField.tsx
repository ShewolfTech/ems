import React from "react";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children, error }) => (
  <div className="form-field">
    <label className="form-label">{label}</label>
    {children}
    {error && <span className="form-error">{error}</span>}
  </div>
);


export default FormField;
