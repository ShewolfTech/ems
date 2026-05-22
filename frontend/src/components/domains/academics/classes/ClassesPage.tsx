import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { useClasses } from "@/domains/academics/classes/hooks/useClasses.js";
import { ClassesList } from "./ClassesList.js";
import { ClassesDetail } from "./ClassesDetail.js";
import { ClassesForm } from "./ClassesForm.js";

export function ClassesPage() {
  const { user } = useAuthContext() as any;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  
  const [view, setView] = useState<"list" | "form">("list");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, detail, detailLoading, reload, loadDetail, save, remove } = useClasses({ autoFetch: true });

  // Handle edit query param
  useEffect(() => {
    if (editId && !selectedId) {
      setSelectedId(editId);
      loadDetail(editId).then(() => setView("form"));
    }
  }, [editId]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data || [];
    return (data || []).filter((item: any) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);

  const handleCreateNew = () => {
    setSelectedId(undefined);
    setView("form");
  };

  const handleView = async (item: any) => {
    setSelectedId(item.id);
    await loadDetail(item.id);
    setView("list");
  };

  const handleSuccess = () => {
    setView("list");
    setSelectedId(undefined);
    reload();
  };

  const handleCancel = () => {
    setView("list");
    setSelectedId(undefined);
    navigate("/academics/classes", { replace: true });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await remove(id);
      reload();
    } catch (err: any) {
      console.error("Delete failed:", err.message);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const payload = { ...formData, school_id: user?.schoolId };
      await save(payload);
      setView("list");
      setSelectedId(undefined);
      reload();
    } catch (err: any) {
      console.error("Save failed:", err.message);
    }
  };

  const handleEdit = async (item: any) => {
    setSelectedId(item.id);
    await loadDetail(item.id);
    setView("form");
  };

  // Form view
  if (view === "form") {
    const initialData = detail || (data || []).find((c: any) => c.id === selectedId);
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {selectedId ? "Edit Class" : "New Class"}
            </h1>
            <p className="text-gray-600 text-sm">
              {selectedId ? "Update class details" : "Create a new class section"}
            </p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <ClassesForm
            initialData={initialData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
            <p className="text-gray-600 text-sm">Manage class sections, teachers, and enrollments</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            + New Class
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Classes</div>
            <div className="text-2xl font-bold text-gray-900">{(data || []).length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Active Classes</div>
            <div className="text-2xl font-bold text-green-600">{(data || []).filter((c: any) => c.is_active).length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Students</div>
            <div className="text-2xl font-bold text-blue-600">{(data || []).reduce((sum: number, c: any) => sum + (c.student_count || 0), 0)}</div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, code, teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {/* List */}
        <ClassesList
          data={filteredData}
          loading={loading}
          onSelect={handleView}
          onDelete={handleDelete}
        />

        {/* Detail Modal */}
        {selectedId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">{detail?.name || "Class"}</h2>
                <button onClick={() => setSelectedId(undefined)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <div className="p-6">
                {detailLoading ? (
                  <p className="text-center text-gray-500 py-8">Loading details...</p>
                ) : (
                  <ClassesDetail item={detail} onClose={() => setSelectedId(undefined)} />
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50">
                <button
                  onClick={() => handleEdit(detail)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Edit Class
                </button>
                <button
                  onClick={() => setSelectedId(undefined)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ClassesPage;