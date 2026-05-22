import React, { useState, useMemo } from "react";
import { useAcademicYears } from "@/domains/academics/academic_years/hooks/useAcademicYears.js";
import { AcademicYearsList } from "./AcademicYearsList.js";
import { AcademicYearsForm } from "./AcademicYearsForm.js";

export function AcademicYearsPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, reload, save, update, remove } = useAcademicYears({ autoFetch: true }) as any;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data || [];
    return data?.filter((item: any) =>
      Object.values(item).some((val: any) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];
  }, [data, searchTerm]);

  const handleCreateNew = () => {
    setSelectedId(undefined);
    setView('form');
  };

  const handleView = (item: any) => {
    setSelectedId(item.id);
    setView('form');
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedId(undefined);
    reload();
  };

  const handleCancel = () => {
    setView('list');
    setSelectedId(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this academic year?")) return;
    try {
      await remove(id);
      reload();
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const selectedItem = useMemo(() => {
    if (!selectedId) return undefined;
    return data?.find((item: any) => item.id === selectedId);
  }, [data, selectedId]);

  return (
    <div className="min-h-screen bg-gray-100">
      {view === 'list' ? (
        <div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Academic Years</h1>
                <p className="text-gray-600">Manage academic year periods and their status</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + New Year
              </button>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <input
                type="text"
                placeholder="Search by year name, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <AcademicYearsList data={filteredData} loading={loading} onSelect={handleView} />
        </div>
      ) : (
        <div className="p-6">
          <AcademicYearsForm
            initialData={selectedItem}
            onSave={handleSuccess}
            onClose={handleCancel}
          />
        </div>
      )}
    </div>
  );
}

export default AcademicYearsPage;
