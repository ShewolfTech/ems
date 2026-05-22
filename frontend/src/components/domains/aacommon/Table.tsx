// frontend/src/components/domains/aacommon/Table.tsx
import React from "react";

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
}

// frontend/src/components/domains/aacommon/Table.tsx

export function Table<T extends Record<string, any>>({ columns, data, loading }: TableProps<T>) {
  if (loading) return <div className="p-12 text-center text-slate-400 animate-pulse">Loading records...</div>;

  // 🛡️ Guard: Ensure data is an array before trying to access .length or .map
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 italic">No records available.</td>
            </tr>
          ) : (
            safeData.map((row, i) => (
              <tr key={row.id || i} className="group hover:bg-slate-50/80 transition-colors cursor-pointer">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-slate-600">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;