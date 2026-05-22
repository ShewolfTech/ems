import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { useTimetables } from "@/domains/academics/timetables/hooks/useTimetables.js";
import { TimetablesList } from "./TimetablesList.js";
import { TimetablesForm } from "./TimetablesForm.js";
import { TimetableGrid } from "./TimetableGrid.js";
import api from "@/utils/api.js";

const SUBJECT_COLORS = [
  "#dbeafe", "#fef3c7", "#d1fae5", "#fce7f3", "#e0e7ff",
  "#ccfbf1", "#fef9c3", "#ede9fe", "#ffedd5", "#f1f5f9",
  "#cffafe", "#fecdd3", "#bbf7d0", "#fde68a", "#c4b5fd",
  "#fca5a5", "#86efac", "#fcd34d", "#93c5fd", "#f9a8d4",
];

const getSubjectColor = (name: string | null) => {
  if (!name) return "";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

export function TimetablesPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext() as any;
  const [view, setView] = useState<'list' | 'form' | 'grid'>('list');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [showSchoolWorkload, setShowSchoolWorkload] = useState(false);
  const [schoolWorkloadData, setSchoolWorkloadData] = useState<any[]>([]);
  const [workloadLoading, setWorkloadLoading] = useState(false);

  const { data, loading, reload, save, update, remove } = useTimetables({ autoFetch: true }) as any;

  // Load school-wide workload
  const loadSchoolWorkload = async () => {
    if (schoolWorkloadData && (schoolWorkloadData as any).summary) return; // Already loaded
    setWorkloadLoading(true);
    try {
      const res = await api.get("/academics/timetables/workload");
      setSchoolWorkloadData(res.data?.data || {});
    } catch (e) {
      console.error("Failed to load school workload", e);
    } finally {
      setWorkloadLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get("/academics/subjects").then(r => r.data?.data || []),
      api.get("/staffmgt/staff").then(r => r.data?.data || []),
    ]).then(([subs, stf]) => {
      setSubjects(subs);
      setStaff(stf);
    }).catch(console.error);
  }, []);

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data || [];
    return data?.filter((item: any) => Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))) || [];
  }, [data, searchTerm]);

  const handleCreateNew = () => {
    setSelectedId(undefined);
    setView('form');
  };

  const handleViewGrid = (item: any) => {
    setSelectedId(item.id);
    setView('grid');
  };

  const handleViewForm = (item: any) => {
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
    if (!window.confirm("Delete this timetable and all its entries?")) return;
    try {
      await remove(id);
      reload();
    } catch (err: any) { console.error("Delete failed:", err.message); }
  };

  const handleSave = async (formData: any) => {
    try {
      const payload = { ...formData, school_id: user?.schoolId };
      let result: any;
      if (selectedItem?.id) {
        result = await update(selectedItem.id, payload);
      } else {
        result = await save(payload);
      }
      // Capture the new timetable ID before reloading
      const newId = result?.data?.id;
      
      // Reload the list
      setView('list');
      setSelectedId(undefined);
      reload();

      // Auto-open the grid for the newly created/updated timetable
      if (newId) {
        setTimeout(() => {
          setSelectedId(newId);
          setView('grid');
        }, 300);
      }
    } catch (err: any) { console.error("Save failed:", err.message); }
  };

  const selectedItem = React.useMemo(() => {
    if (!selectedId) return undefined;
    return data?.find((item: any) => item.id === selectedId);
  }, [data, selectedId]);

  if (view === 'grid' && selectedId) {
    return (
      <div className="p-6">
        <TimetableGrid
          timetableId={Number(selectedId)}
          subjects={subjects}
          staff={staff}
          onBack={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {view === 'list' ? (
        <div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Timetables</h1>
                <p className="text-gray-600">Manage class schedules and time slots</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowSchoolWorkload(!showSchoolWorkload); if (!showSchoolWorkload) loadSchoolWorkload(); }}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${showSchoolWorkload ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                >
                  📊 School Workload
                </button>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  + New Timetable
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            {/* School Workload Summary */}
            {showSchoolWorkload && (
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">🏫 School-Wide Teacher Workload</h3>
                  <span className="text-xs text-gray-400">Excludes breaks. Sorted by workload.</span>
                </div>
                {workloadLoading ? (
                  <p className="text-sm text-gray-500 py-8 text-center">Loading...</p>
                ) : schoolWorkloadData && (schoolWorkloadData as any).teachers?.length ? (
                  <div className="border border-gray-200 rounded max-h-96 overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Teacher</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Hours</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Slots</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Classes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {(schoolWorkloadData as any).teachers.map((t: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-1.5 text-gray-400 text-xs">{i + 1}</td>
                            <td className="px-4 py-1.5 font-medium text-gray-900">{t.name}</td>
                            <td className="px-4 py-1.5 text-right text-gray-500">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                t.totalMinutes > 300 ? 'bg-red-100 text-red-700' :
                                t.totalMinutes > 180 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {Math.floor(t.totalMinutes / 60)}h {t.totalMinutes % 60}m
                              </span>
                            </td>
                            <td className="px-4 py-1.5 text-right text-gray-500">{t.periods}</td>
                            <td className="px-4 py-1.5 text-gray-500">
                              <div className="flex flex-wrap gap-1">
                                {t.classNames?.map((c: string, ci: number) => (
                                  <span key={ci} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{c}</span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-8 text-center">No teaching entries found. Add periods to timetables to see workload data.</p>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <input
                type="text"
                placeholder="Search timetables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          <TimetablesList
            data={filteredData}
            loading={loading}
            onSelect={handleViewGrid}
            onEdit={handleViewForm}
            onDelete={handleDelete}
          />
        </div>
      ) : (
        <div className="p-6">
          <TimetablesForm
            initialData={selectedItem}
            onSave={handleSave}
            onClose={handleCancel}
          />
        </div>
      )}
    </div>
  );
}
export default TimetablesPage;
