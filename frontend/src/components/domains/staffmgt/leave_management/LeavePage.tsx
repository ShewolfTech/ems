import React, { useState, useMemo } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { useLeaveRequests, useLeaveTypes, useLeaveQuotas, useLeaveStatistics } from "@/domains/staffmgt/leave_management/hooks/useLeave.js";
import { Button } from "@/components/domains/aacommon/index.js";
import { Plus, RotateCw, Search, Check, X, Calendar, User, Clock, Filter } from "lucide-react";
import type { LeaveRequest, LeaveQuota, LeaveType } from "@/domains/staffmgt/leave_management/types.js";

export function LeavePage() {
  const { user } = useAuthContext() as any;

  // View state
  const [viewMode, setViewMode] = useState<"list" | "quotas">("list");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    staff_id: "",
    page: 1,
    limit: 20,
  });

  // Data fetching
  const { requests, loading, refresh, approve, reject } = useLeaveRequests({ autoFetch: true, filters });
  const { leaveTypes } = useLeaveTypes({ autoFetch: true });
  const { quotas } = useLeaveQuotas({ autoFetch: true });
  const { statistics } = useLeaveStatistics({ autoFetch: true });

  // Handlers
  const handleApprove = async (request: LeaveRequest) => {
    try {
      await approve(request.id, "Approved");
      refresh();
    } catch (error) {
      console.error("Error approving leave:", error);
    }
  };

  const handleReject = async (request: LeaveRequest) => {
    try {
      await reject(request.id, "Rejected");
      refresh();
    } catch (error) {
      console.error("Error rejecting leave:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
          >
            Requests
          </Button>
          <Button
            variant={viewMode === "quotas" ? "default" : "outline"}
            onClick={() => setViewMode("quotas")}
          >
            Quotas
          </Button>
          <Button variant="outline" onClick={refresh}>
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {viewMode === "list" && (
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full px-3 py-2 border rounded-lg"
                value={filters.staff_id}
                onChange={(e) => setFilters({ ...filters, staff_id: e.target.value })}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-lg"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Staff</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Dates</th>
                  <th className="px-4 py-3 text-left">Days</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">Loading...</td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">No leave requests found</td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {request.staff?.first_name} {request.staff?.last_name}
                        </div>
                      </td>
                      <td className="px-4 py-3">{request.leave_type?.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">{request.days_requested}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {request.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(request)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleReject(request)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === "quotas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotas.map((quota) => (
            <div key={quota.id} className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold">{quota.leave_type?.name}</h3>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Used:</span>
                  <span>{quota.days_used || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining:</span>
                  <span>{(quota.total_days || 0) - (quota.days_used || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Total:</span>
                  <span>{quota.total_days || 0}</span>
                </div>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(((quota.days_used || 0) / (quota.total_days || 1)) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LeavePage;