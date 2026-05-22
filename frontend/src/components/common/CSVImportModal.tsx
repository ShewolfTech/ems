import React, { useState, useCallback } from "react";
import { Upload, Download, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface CSVImportProps {
  entityName: string;
  columns: { key: string; label: string; required?: boolean; example?: string }[];
  onImport: (data: any[]) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function CSVImportModal({ entityName, columns, onImport, isOpen, onClose }: CSVImportProps) {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: any[] } | null>(null);
  const [error, setError] = useState("");

  const resetState = () => {
    setCsvData([]);
    setFileName("");
    setImporting(false);
    setImportResult(null);
    setError("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    const results: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx];
        });
        results.push(row);
      }
    }

    return results;
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setCsvData(parsed);
      setImportResult(null);
    };
    reader.readAsText(file);
  }, []);

  const downloadTemplate = () => {
    const header = columns.map(c => c.key).join(",");
    const example = columns.map(c => c.example || "").join(",");
    const csv = `${header}\n${example}`;
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entityName.toLowerCase().replace(/\s+/g, "_")}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      setError("No data to import");
      return;
    }

    setImporting(true);
    setError("");

    try {
      const result = await onImport(csvData);
      setImportResult({
        success: result?.success || csvData.length,
        failed: result?.failed || 0,
        errors: result?.errors || []
      });
    } catch (err: any) {
      setError(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Import {entityName}</h3>
            <p className="text-sm text-slate-600 mt-1">Upload a CSV file to create multiple entries at once</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Download Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900">Step 1: Download Template</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Use the correct format by downloading the CSV template
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload File */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 text-slate-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">Step 2: Upload CSV File</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Fill in the template with your {entityName.toLowerCase()} data and upload it
                </p>
                <div className="mt-3">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-50">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600">
                      {fileName || "Click to select CSV file"}
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Data */}
          {csvData.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">
                Preview: {csvData.length} {entityName.toLowerCase()} found
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      {columns.map(col => (
                        <th key={col.key} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {csvData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {columns.map(col => (
                          <td key={col.key} className="px-3 py-2 text-slate-700">
                            {row[col.key] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 5 && (
                  <div className="px-3 py-2 bg-slate-50 text-sm text-slate-600 text-center">
                    ... and {csvData.length - 5} more entries
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                importResult.failed === 0 
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}>
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Import Complete</p>
                  <p className="text-sm">
                    {importResult.success} succeeded, {importResult.failed} failed
                  </p>
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <h5 className="font-semibold text-red-900 mb-2">Errors:</h5>
                  <ul className="text-sm text-red-800 space-y-1">
                    {importResult.errors.slice(0, 10).map((err: any, idx: number) => (
                      <li key={idx}>
                        Row {err.index + 1}: {err.error}
                      </li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li>... and {importResult.errors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={handleImport}
            disabled={importing || csvData.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {importing ? "Importing..." : `Import ${csvData.length} ${entityName}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CSVImportModal;
