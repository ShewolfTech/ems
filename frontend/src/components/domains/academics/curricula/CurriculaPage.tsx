import React, { useState, useMemo } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { useCurricula } from "@/domains/academics/curricula/hooks/useCurricula.js";
import { CurriculaList } from "./CurriculaList.js";
import { CurriculaForm } from "./CurriculaForm.js";

export function CurriculaPage() {
  const { user } = useAuthContext() as any;
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, reload, save, update, remove } = useCurricula({ autoFetch: true }) as any;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data || [];
    return data?.filter((item: any) => Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))) || [];
  }, [data, searchTerm]);

  const handleCreateNew = () => {
    setSelectedId(undefined);
    setView('form');
  };

  const handleView = (item: any) => {
    setSelectedId(item.id);
    setView('form');
  };

  const handleSuccess = async () => {
    setView('list');
    setSelectedId(undefined);
    reload();
  };

  const handleCancel = () => {
    setView('list');
    setSelectedId(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await remove(id);
      reload();
    } catch (err: any) { console.error("Delete failed:", err.message); }
  };

  const handleSave = async (formData: any) => {
    try {
      const payload = { ...formData, school_id: user?.schoolId };
      await save(payload);
      handleSuccess();
    } catch (err: any) { console.error("Save failed:", err.message); }
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
                <h1 className="text-2xl font-bold text-gray-800">Curricula</h1>
                <p className="text-gray-600">Manage all curriculum records</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + New Record
              </button>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <CurriculaList data={filteredData} loading={loading} onSelect={handleView} onDelete={handleDelete} />
        </div>
      ) : (
        <div className="p-6">
          <CurriculaForm
            initialData={selectedItem}
            onSave={handleSave}
            onClose={handleCancel}
          />
        </div>
      )}
    </div>
  );
}
export default CurriculaPage;
