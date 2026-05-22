import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";

interface SelectProps {
  label?: string;
  name: string;
  relation: string;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  className?: string;
}

export default function Select({
  label,
  name,
  relation,
  placeholder = "Select an option",
  defaultValue,
  required = false,
  className = "",
}: SelectProps) {
  const { user } = useAuthContext() as any;
  const [options, setOptions] = useState<{ id: number; name: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOptions() {
      if (!relation || !user?.schoolId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/${relation}?school_id=${user.schoolId}&limit=1000`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch ${relation}`);
        }

        const data = await response.json();
        
        // Transform data to options format
        // Try to find a name/label field, otherwise use id
        const opts = (data.data || data).map((item: any) => ({
          id: item.id,
          name: item.name || item.label || item.title || item.code || String(item.id),
          label: item.name || item.label || item.title || item.code || String(item.id),
        }));
        
        setOptions(opts);
      } catch (err: any) {
        console.error(`Error fetching ${relation}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOptions();
  }, [relation, user?.schoolId]);

  return (
    <div className={className}>
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        name={name}
        defaultValue={defaultValue || ""}
        required={required}
        disabled={loading}
        className="w-full px-6 py-4 border-2 border-slate-200 rounded-[1.5rem] outline-none focus:border-slate-900 transition-all font-bold bg-white"
      >
        <option value="" disabled>
          {loading ? "Loading..." : placeholder}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
