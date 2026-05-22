import React from "react";
import { X, Calendar, BookOpen, User, Award, Clock, CheckCircle, MessageSquare, FileText } from "lucide-react";

interface AssignmentsDetailProps {
  item: any;
  onClose: () => void;
}

export function AssignmentsDetail({ item, onClose }: AssignmentsDetailProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatJSON = (json: any) => {
    if (!json) return "—";
    try {
      return typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    } catch {
      return String(json);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700">
          <CheckCircle className="w-4 h-4" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-600">
        Inactive
      </span>
    );
  };

  const isOverdue = item?.due_date && item?.is_active && new Date(item.due_date) < new Date();

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-teal-600" />
            Assignment Details
          </h3>
          <p className="text-sm text-slate-600 mt-1">{item.title || "Untitled Assignment"}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
          <X className="w-6 h-6 text-slate-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Basic Information */}
        <div>
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 mb-1">Title</span>
              <span className="text-base font-semibold text-slate-900">{item.title || "—"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 mb-1">Status</span>
              <div className="mt-1">{getStatusBadge(item.is_active)}</div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 mb-1">Class</span>
              <span className="text-base text-slate-900">{item.class_name || (item.class_id ? `Class #${item.class_id}` : "—")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 mb-1">Subject</span>
              <span className="text-base text-slate-900">{item.subject_name || (item.subject_id ? `Subject #${item.subject_id}` : "—")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 mb-1">Term</span>
              <span className="text-base text-slate-900">{item.term_name || (item.term_id ? `Term #${item.term_id}` : "—")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 mb-1">Teacher</span>
              <span className="text-base text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                {item.teacher_name || (item.teacher_id ? `Teacher #${item.teacher_id}` : "—")}
              </span>
            </div>
          </div>
        </div>

        {/* Dates & Scoring */}
        <div>
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Dates & Scoring
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 mb-1">Due Date</span>
              <span className={`text-base font-semibold flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                <Calendar className="w-4 h-4" />
                {formatDate(item.due_date)}
              </span>
              {isOverdue && (
                <span className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 mb-1">Maximum Score</span>
              <span className="text-base font-bold text-teal-600 flex items-center gap-2">
                <Award className="w-4 h-4" />
                {item.max_score ?? "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 mb-1">Weight</span>
              <span className="text-base font-semibold text-slate-900">{item.weight ?? "1.0"}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.description}</p>
            </div>
          </div>
        )}

        {/* Teacher Comments */}
        {item.teacher_comments && (
          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Teacher Comments
            </h4>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-sm text-slate-700">
              <pre className="whitespace-pre-wrap">{formatJSON(item.teacher_comments)}</pre>
            </div>
          </div>
        )}

        {/* Submissions Summary */}
        {item.submissions && item.submissions.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Submissions ({item.submissions.length})
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {item.submissions.map((sub: any, idx: number) => (
                <div key={sub.id || idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">
                      {sub.first_name} {sub.last_name}
                    </span>
                    {sub.score !== null && sub.score !== undefined && (
                      <span className="text-sm font-bold text-teal-600">
                        {sub.score}{item.max_score ? `/${item.max_score}` : ''}
                        {sub.grade_letter && ` (${sub.grade_letter})`}
                      </span>
                    )}
                  </div>
                  {sub.submission_date && (
                    <div className="text-xs text-slate-500">
                      Submitted: {formatDate(sub.submission_date)}
                    </div>
                  )}
                  {sub.remarks && (
                    <div className="text-xs text-slate-600 mt-1 italic">{sub.remarks}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-6 border-t border-slate-200">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Metadata</h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
            <div>
              <span className="font-semibold">Assignment ID:</span> {item.id}
            </div>
            <div>
              <span className="font-semibold">School ID:</span> {item.school_id}
            </div>
            {item.created_at && (
              <div>
                <span className="font-semibold">Created:</span> {formatDate(item.created_at)}
              </div>
            )}
            {item.updated_at && (
              <div>
                <span className="font-semibold">Last Updated:</span> {formatDate(item.updated_at)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentsDetail;
