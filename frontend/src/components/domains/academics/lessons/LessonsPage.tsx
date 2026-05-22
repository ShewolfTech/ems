import React, { useState, useMemo, useEffect } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { useLessons } from "@/domains/academics/lessons/hooks/useLessons.js";
import { LessonsList } from "./LessonsList.js";
import { LessonsForm } from "./LessonsForm.js";
import api from "@/utils/api.js";
import { Calendar, Loader2 } from "lucide-react";

export function LessonsPage() {
  const { user } = useAuthContext() as any;
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [timetables, setTimetables] = useState<any[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const { data, loading, reload, save, update, remove } = useLessons({ autoFetch: true }) as any;

  // Load timetables for generation
  useEffect(() => {
    api.get("/academics/timetables").then(r => {
      setTimetables(r.data?.data || []);
    }).catch(() => setTimetables([]));
  }, []);

  const handleGenerateFromTimetable = async () => {
    if (!selectedTimetable) {
      setGenMessage({ type: 'error', text: 'Please select a timetable' });
      return;
    }
    setGenerating(true);
    setGenMessage(null);
    try {
      const { data: res } = await api.post("/academics/lessons/generate-from-timetable", { 
        timetableId: Number(selectedTimetable) 
      });
      if (res.success) {
        setGenMessage({ 
          type: 'success', 
          text: `✅ Generated ${res.data.success} lessons from timetable` 
        });
        reload();
      } else {
        setGenMessage({ type: 'error', text: res.message || 'Generation failed' });
      }
    } catch (err: any) {
      setGenMessage({ type: 'error', text: err.response?.data?.message || 'Failed to generate lessons' });
    } finally {
      setGenerating(false);
    }
  };

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
                <h1 className="text-2xl font-bold text-gray-800">Lessons</h1>
                <p className="text-gray-600">Manage all lesson records</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Generate from Timetable */}
                <div className="flex items-center gap-2 bg-white rounded-lg shadow p-2 border border-gray-200">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedTimetable}
                    onChange={(e) => setSelectedTimetable(e.target.value)}
                    className="text-sm border-0 bg-transparent focus:ring-0"
                  >
                    <option value="">Select timetable...</option>
                    {timetables.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleGenerateFromTimetable}
                    disabled={generating || !selectedTimetable}
                    className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {generating && <Loader2 className="w-3 h-3 animate-spin" />}
                    Generate
                  </button>
                </div>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  + New Record
                </button>
              </div>
            </div>
            {genMessage && (
              <div className={`mb-4 px-4 py-3 rounded-lg ${genMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {genMessage.text}
              </div>
            )}
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
          <LessonsList data={filteredData} loading={loading} onSelect={handleView} onDelete={handleDelete} />
        </div>
      ) : (
        <div className="p-6">
          <LessonsForm
            initialData={selectedItem}
            onSave={handleSave}
            onClose={handleCancel}
          />
        </div>
      )}
    </div>
  );
}
export default LessonsPage;
