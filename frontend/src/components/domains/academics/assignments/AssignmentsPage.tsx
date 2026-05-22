import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAssignments } from "@/domains/academics/assignments/hooks/useAssignments.js";
import { AssignmentsList } from "./AssignmentsList.js";
import { AssignmentsForm } from "./AssignmentsForm.js";
import { BulkSubmissionEntry } from "./BulkSubmissionEntry.js";
import { AssignmentAnalytics } from "./AssignmentAnalytics.js";
import { BulkAssignmentsForm } from "./BulkAssignmentsForm.js";
import { FileText, BarChart3, FileSpreadsheet, Plus, Calendar, Package, BookOpen } from "lucide-react";

type TabType = 'assignments' | 'submissions' | 'analytics';

export function AssignmentsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('assignments');
  const [assignmentView, setAssignmentView] = useState<'list' | 'form'>('list');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // Triggers refresh in analytics
  const [showBulkCreate, setShowBulkCreate] = useState(false);

  const { data, loading, reload, save, remove } = useAssignments({ autoFetch: true }) as any;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data || [];
    return data?.filter((item: any) =>
      Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];
  }, [data, searchTerm]);

  const handleCreateNew = () => {
    setSelectedId(undefined);
    setAssignmentView('form');
  };

  const handleEdit = (item: any) => {
    setSelectedId(item.id);
    setAssignmentView('form');
  };

  const handleView = (item: any) => {
    navigate(`/academics/assignments/${item.id}`);
  };

  const handleSuccess = async () => {
    setAssignmentView('list');
    setSelectedId(undefined);
    reload();
  };

  const handleCancel = () => {
    setAssignmentView('list');
    setSelectedId(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await remove(id);
      reload();
    } catch (err: any) {
      console.error("Delete failed:", err.message);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      await save(formData);
      handleSuccess();
    } catch (err: any) {
      console.error("Save failed:", err.message);
    }
  };

  const selectedItem = useMemo(() => {
    if (!selectedId) return undefined;
    return data?.find((item: any) => item.id === selectedId);
  }, [data, selectedId]);

  const tabs = [
    {
      id: 'assignments' as TabType,
      label: 'Assignments Management',
      icon: <FileText className="w-5 h-5" />,
      description: 'Create and manage assignments'
    },
    {
      id: 'submissions' as TabType,
      label: 'Bulk Submissions Entry',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      description: 'Grade entire class submissions'
    },
    {
      id: 'analytics' as TabType,
      label: 'Assignment Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Submission insights and trends'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Assignments Center</h1>
              <p className="text-slate-600 mt-1">Comprehensive assignment management and analytics</p>
            </div>
            {activeTab === 'assignments' && assignmentView === 'list' && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/academics/gradebook")}
                  className="flex items-center gap-2 px-5 py-2.5 border border-indigo-600 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-all font-medium"
                >
                  <BookOpen className="w-5 h-5" />
                  Grade Book
                </button>
                <button
                  onClick={() => navigate("/academics/assignments/calendar")}
                  className="flex items-center gap-2 px-5 py-2.5 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-all font-medium"
                >
                  <Calendar className="w-5 h-5" />
                  Calendar
                </button>
                <button
                  onClick={() => setShowBulkCreate(true)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-all font-medium"
                >
                  <Package className="w-5 h-5" />
                  Bulk Create
                </button>
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  <Plus className="w-5 h-5" />
                  New Assignment
                </button>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-white shadow-md text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <div>
                  <div className="font-semibold text-sm">{tab.label}</div>
                  <div className="text-xs opacity-70">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <>
            {assignmentView === 'list' ? (
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search assignments by title, class, subject, or term..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <AssignmentsList
                  data={filteredData}
                  loading={loading}
                  onSelect={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </div>
            ) : (
              <AssignmentsForm
                initialData={selectedItem}
                onSave={handleSave}
                onClose={handleCancel}
              />
            )}
          </>
        )}

        {/* Bulk Submissions Entry Tab */}
        {activeTab === 'submissions' && (
          <BulkSubmissionEntry onSubmissionsSaved={() => { reload(); setRefreshKey(k => k + 1); }} />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AssignmentAnalytics assignments={data} loading={loading} refreshKey={refreshKey} />
        )}
      </div>

      {/* Bulk Create Modal */}
      {showBulkCreate && (
        <BulkAssignmentsForm
          onSave={() => { setShowBulkCreate(false); reload(); }}
          onClose={() => setShowBulkCreate(false)}
        />
      )}
    </div>
  );
}

export default AssignmentsPage;
