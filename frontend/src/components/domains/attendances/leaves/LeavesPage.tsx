import React, { useState, useMemo, useEffect } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { useLeaves } from "@/domains/attendances/leaves/hooks/useLeaves.js";
import { useLeaveTypes } from "@/domains/attendances/leave_types/hooks/useLeaveTypes.js";
import { Button, Input, Select } from "@/components/domains/aacommon/index.js";
import { fetchApprovers } from "@/utils/approvers.js";
import { 
  Calendar, CheckCircle, XCircle, Clock, AlertCircle, Search, 
  Plus, RotateCw, User, FileText, ThumbsUp, ThumbsDown, 
  ChevronDown, Filter, CalendarDays, Sparkles
} from "lucide-react";

type ViewMode = "mine" | "team" | "pending";
type LeaveStatus = "pending" | "approved" | "rejected";

export function LeavesPage() {
  const { user } = useAuthContext() as any;
  const [viewMode, setViewMode] = useState<ViewMode>("mine");
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "all">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: leaves, loading, reload, save } = useLeaves({ autoFetch: true }) as any;
  const { data: leaveTypes } = useLeaveTypes({ autoFetch: true }) as any;
  const [approvers, setApprovers] = useState<any[]>([]);

  // Fetch potential approvers - using shared utility
  useEffect(() => {
    console.log("🔄 Fetching approvers...");
    fetchApprovers()
      .then(data => {
        console.log("📋 Approvers data received:", data);
        if (data.success) {
          setApprovers(data.data || []);
        } else {
          console.error("❌ Failed to load approvers:", data.message);
        }
      })
      .catch(err => console.error("❌ Approvers fetch error:", err));
  }, []);

  const canApprove = user?.permissions?.some((p: string) => p.includes(".approve")) || user?.role === "admin";
  const myLeaves = leaves?.filter((l: any) => l.requester_id === user?.id) || [];
  const pendingApproval = leaves?.filter((l: any) => l.status === "pending" && l.requester_id !== user?.id) || [];
  
  const filteredData = useMemo(() => {
    let data = viewMode === "mine" ? myLeaves : viewMode === "pending" ? pendingApproval : leaves || [];
    if (statusFilter !== "all") {
      data = data.filter((item: any) => item.status === statusFilter);
    }
    if (searchTerm) {
      data = data.filter((item: any) => 
        Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return data;
  }, [leaves, myLeaves, pendingApproval, viewMode, statusFilter, searchTerm]);

  const stats = useMemo(() => ({
    pending: myLeaves.filter((l: any) => l.status === "pending").length,
    approved: myLeaves.filter((l: any) => l.status === "approved").length,
    rejected: myLeaves.filter((l: any) => l.status === "rejected").length,
    pendingApprovalCount: pendingApproval.length
  }), [myLeaves, pendingApproval]);

  const handleSubmit = async (formData: any) => {
    try {
      // Debug: Log the incoming formData
      console.log("📝 Submitted formData:", formData);
      
      // Format payload with proper types
      const payload = { 
        ...formData,
        // Convert IDs to numbers - fix: handle empty string properly
        leave_type_id: formData.leave_type_id ? Number(formData.leave_type_id) : undefined,
        approver_id: formData.approver_id && formData.approver_id !== "" ? Number(formData.approver_id) : undefined,
        // Convert dates to ISO strings
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
        // Add metadata (school_id is optional for global tables)
        ...(user?.schoolId && { school_id: user.schoolId }),
        requester_id: user?.id, 
        status: "pending",
        applied_at: new Date().toISOString(),
        // Ensure boolean is properly typed
        is_emergency: Boolean(formData.is_emergency)
      };
      
      console.log("📤 Payload being sent:", payload);
      await save(payload);
      setShowForm(false);
      reload();
    } catch (err: any) { 
      console.error("Save failed:", err.message); 
      alert("Failed: " + err.message); 
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await save({ 
        id: Number(id), 
        status: "approved", 
        approver_id: user?.id, 
        approved_at: new Date().toISOString()
      });
      reload();
    } catch (err: any) { 
      console.error("Approve failed:", err.message); 
      alert("Failed to approve: " + err.message);
    } finally { 
      setProcessingId(null); 
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await save({ 
        id: Number(id), 
        status: "rejected", 
        approver_id: user?.id, 
        approved_at: new Date().toISOString(),
        reject_reason: rejectReason
      });
      setShowRejectModal(false);
      setRejectReason("");
      reload();
    } catch (err: any) { 
      console.error("Reject failed:", err.message); 
      alert("Failed to reject: " + err.message);
    } finally { 
      setProcessingId(null); 
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <CalendarDays className="w-10 h-10 text-indigo-600" />
              Leave Management
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Manage your time off requests and approvals</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(true)} className="shadow-lg shadow-indigo-500/30">
            <Plus className="w-5 h-5 mr-2" /> Request Leave
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-xl"><Clock className="w-5 h-5 text-amber-600" /></div>
              <span className="text-sm font-bold text-slate-500">Pending</span>
            </div>
            <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-xl"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
              <span className="text-sm font-bold text-slate-500">Approved</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-xl"><XCircle className="w-5 h-5 text-red-600" /></div>
              <span className="text-sm font-bold text-slate-500">Rejected</span>
            </div>
            <p className="text-3xl font-black text-red-600">{stats.rejected}</p>
          </div>
          {canApprove && (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl"><AlertCircle className="w-5 h-5" /></div>
                <span className="text-sm font-bold text-white/80">Awaiting Approval</span>
              </div>
              <p className="text-3xl font-black">{stats.pendingApprovalCount}</p>
            </div>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mb-6">
          <button 
            onClick={() => setViewMode("mine")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${viewMode === "mine" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <User className="w-4 h-4" /> My Requests
          </button>
          {canApprove && (
            <>
              <button 
                onClick={() => setViewMode("pending")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${viewMode === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <ThumbsUp className="w-4 h-4" /> Pending Approval
                {stats.pendingApprovalCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{stats.pendingApprovalCount}</span>
                )}
              </button>
              <button 
                onClick={() => setViewMode("team")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${viewMode === "team" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Calendar className="w-4 h-4" /> All Requests
              </button>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${statusFilter === status ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Leave Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((leave: any) => (
            <div key={leave.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${getStatusColor(leave.status)}`}>
                  {getStatusIcon(leave.status)}
                  {leave.status.toUpperCase()}
                </div>
                {leave.is_emergency && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg">EMERGENCY</span>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leave Type</p>
                  <p className="font-bold text-slate-900">{leave.leave_type_id || "N/A"}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">From</p>
                    <p className="font-bold text-slate-900">{leave.start_date?.split('T')[0] || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">To</p>
                    <p className="font-bold text-slate-900">{leave.end_date?.split('T')[0] || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</p>
                  <p className="font-medium text-slate-700 line-clamp-2">{leave.reason || "No reason provided"}</p>
                </div>
              </div>

              {/* Approval Actions */}
              {viewMode === "pending" && canApprove && leave.status === "pending" && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button 
                    variant="primary" 
 
                    onClick={() => handleApprove(leave.id)}
                    disabled={processingId === leave.id}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button 
                    variant="secondary" 
 
                    onClick={() => { setSelectedItem(leave); setShowRejectModal(true); }}
                    disabled={processingId === leave.id}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-bold">No leave requests found</p>
          </div>
        )}
      </div>

      {/* Leave Request Modal */}
      {showForm && (
        <LeaveRequestForm 
          leaveTypes={leaveTypes || []} 
          approvers={approvers}
          onClose={() => setShowForm(false)} 
          onSave={handleSubmit} 
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-4">Reject Leave Request</h3>
            <p className="text-slate-600 mb-4">Please provide a reason for rejecting this leave request.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-red-400 transition-all font-medium h-32 resize-none"
            />
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => { setShowRejectModal(false); setRejectReason(""); }} className="flex-1">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => handleReject(selectedItem.id)}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Reject Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Leave Request Form Component **/
function LeaveRequestForm({ leaveTypes, approvers, onClose, onSave }: { leaveTypes: any[]; approvers: any[]; onClose: () => void; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    leave_type_id: "",
    approver_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    is_emergency: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Request Time Off
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <XCircle className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Leave Type</label>
            <select
              value={formData.leave_type_id}
              onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
              className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-bold bg-white"
              required
            >
              <option value="">Select leave type...</option>
              {leaveTypes.map((lt: any) => (
                <option key={lt.id} value={lt.id}>{lt.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Approver</label>
            <select
              value={formData.approver_id}
              onChange={(e) => setFormData({ ...formData, approver_id: e.target.value })}
              className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-bold bg-white"
              required
            >
              <option value="">Select approver...</option>
              {approvers.map((a: any) => (
                <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Briefly describe the reason for your leave..."
              className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium h-24 resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl bg-red-50">
            <input
              type="checkbox"
              id="emergency"
              checked={formData.is_emergency}
              onChange={(e) => setFormData({ ...formData, is_emergency: e.target.checked })}
              className="w-5 h-5 accent-red-600"
            />
            <label htmlFor="emergency" className="text-sm font-bold text-red-700">This is an emergency leave</label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeavesPage;
