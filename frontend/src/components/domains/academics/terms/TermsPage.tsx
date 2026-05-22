import React, { useState, useMemo } from "react";
import { useTerms } from "@/domains/academics/terms/hooks/useTerms.js";
import { TermsList } from "./TermsList.js";
import { TermsForm } from "./TermsForm.js";

export function TermsPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, reload, save, update, remove } = useTerms({ autoFetch: true }) as any;

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
    if (!window.confirm("Are you sure you want to delete this term?")) return;
    try {
      await remove(id);
      reload();
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSave = async (formData: any) => {
    try {
      await save(formData);
      handleSuccess();
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
                <h1 className="text-2xl font-bold text-gray-800">Terms</h1>
                <p className="text-gray-600">Manage academic terms within academic years</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + New Term
              </button>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <input
                type="text"
                placeholder="Search by term name, code, academic year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <TermsList data={filteredData} loading={loading} onSelect={handleView} />
        </div>
      ) : (
        <div className="p-6">
          <TermsForm
            initialData={selectedItem}
            onSave={handleSave}
            onClose={handleCancel}
          />
        </div>
      )}
    </div>
  );
}

export default TermsPage;
