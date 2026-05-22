import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAssessments } from "@/domains/academics/assessments/hooks/useAssessments.js";
import { AssessmentsList } from "./AssessmentsList.js";
import { AssessmentsForm } from "./AssessmentsForm.js";
import { BulkAssessmentsForm } from "./BulkAssessmentsForm.js";

export function AssessmentsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBulkCreate, setShowBulkCreate] = useState(false);

  const { data, loading, reload, save, remove } = useAssessments({ autoFetch: true }) as any;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data || [];
    return data?.filter((item: any) => 
      Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];
  }, [data, searchTerm]);

  const handleCreateNew = () => {
    setSelectedId(undefined);
    setView('form');
  };

  const handleEdit = (item: any) => {
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
    if (!window.confirm("Are you sure you want to delete this assessment?")) return;
    try {
      await remove(id);
      reload();
    } catch (err: any) {
      console.error("Delete failed:", err.message);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (formData.id) {
        await update(formData);
      } else {
        await save(formData);
      }
      handleSuccess();
    } catch (err: any) {
      console.error("Save failed:", err.message);
      throw err;
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
                <h1 className="text-2xl font-bold text-gray-800">Assessments</h1>
                <p className="text-gray-600">Manage assessments, tests, and examinations</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/academics/gradebook")}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  📊 Grade Book
                </button>
                <button
                  onClick={() => navigate("/academics/assessment-calendar")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  📅 Calendar
                </button>
                <button
                  onClick={() => setShowBulkCreate(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  📦 Bulk Create
                </button>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  + New Assessment
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <AssessmentsList 
            data={filteredData} 
            loading={loading} 
            onSelect={handleEdit} 
            onDelete={handleDelete}
          />
        </div>
      ) : (
        <div className="p-6">
          <AssessmentsForm
            initialData={selectedItem}
            onSave={handleSave}
            onClose={handleCancel}
          />
        </div>
      )}

      {showBulkCreate && (
        <BulkAssessmentsForm
          onSave={() => { setShowBulkCreate(false); reload(); }}
          onClose={() => setShowBulkCreate(false)}
        />
      )}
    </div>
  );
}

export default AssessmentsPage;
