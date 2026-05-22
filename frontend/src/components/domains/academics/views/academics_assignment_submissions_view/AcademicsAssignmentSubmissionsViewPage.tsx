import React, { useState, useMemo } from "react";
import { useAcademicsAssignmentSubmissionsView } from "@/domains/academics/views/academics_assignment_submissions_view/hooks/useAcademicsAssignmentSubmissionsView.js";
import { AcademicsAssignmentSubmissionsViewList } from "./AcademicsAssignmentSubmissionsViewList.js";

export function AcademicsAssignmentSubmissionsViewPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, reload } = useAcademicsAssignmentSubmissionsView({ autoFetch: true }) as any;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data || [];
    return data?.filter((item: any) => Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))) || [];
  }, [data, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Assignment Submissions</h1>
            <p className="text-gray-600">View all assignment submission records</p>
          </div>
          <button
            onClick={() => reload()}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
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
      <AcademicsAssignmentSubmissionsViewList data={filteredData} loading={loading} />
    </div>
  );
}
export default AcademicsAssignmentSubmissionsViewPage;
