import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className, // Added this so we can pass extra classes from the generator
  ...props
}) => {
  // CHANGED: rounded-xl for a modern look, added transition for smoothness
  const base = "px-6 py-2.5 rounded-xl font-bold transition-all duration-200 active:scale-95 focus:outline-none flex items-center justify-center gap-2 shadow-sm";
  
  const styles: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};


export default Button;
