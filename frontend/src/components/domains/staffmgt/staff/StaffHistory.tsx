import React, { useState, useEffect } from "react";
import { History, TrendingUp, Building2, Calendar, User, FileText, AlertCircle } from "lucide-react";
import { getStaffTransferHistory, getStaffPromotionHistory } from "@/domains/staffmgt/staff/services.js";

interface StaffHistoryProps {
  staffId: string | number;
}

interface HistoryRecord {
  type: "promotion" | "transfer";
  id: number;
  date: string;
  title: string;
  details: string;
  icon: React.ReactNode;
  color: string;
}

export function StaffHistory({ staffId }: StaffHistoryProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [staffId]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch promotions
      const promotions = await getStaffPromotionHistory(staffId);
      const promotionRecords = (promotions || []).map((record: any) => ({
        type: "promotion" as const,
        id: record.id,
        date: new Date(record.promotion_date).toLocaleDateString(),
        title: `Promoted to ${record.new_role_name || "New Role"}`,
        details: `From ${record.old_role_name || "Previous Role"}${record.remarks ? ` - ${record.remarks}` : ""}`,
        icon: <TrendingUp className="w-5 h-5" />,
        color: "bg-purple-50 border-purple-200"
      }));

      // Fetch transfers
      const transfers = await getStaffTransferHistory(staffId);
      const transferRecords = (transfers || []).map((record: any) => ({
        type: "transfer" as const,
        id: record.id,
        date: new Date(record.transfer_date).toLocaleDateString(),
        title: `Transferred to ${record.new_department_name || "New Department"}`,
        details: `From ${record.old_department_name || "Previous Department"}${record.remarks ? ` - ${record.remarks}` : ""}`,
        icon: <Building2 className="w-5 h-5" />,
        color: "bg-blue-50 border-blue-200"
      }));

      // Combine and sort by date
      const combined = [...promotionRecords, ...transferRecords].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setHistory(combined);
    } catch (err: any) {
      setError(err.message || "Failed to load history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-slate-700">Staff History</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-slate-600" />
        <h3 className="font-bold text-slate-700">Staff Career History</h3>
        <span className="ml-auto text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full font-bold">
          {history.length} record{history.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
          <History className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No history records yet</p>
          <p className="text-sm text-slate-500">Transfers and promotions will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record, idx) => (
            <div
              key={`${record.type}-${record.id}`}
              className={`rounded-lg border-l-4 p-4 ${record.color} transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${record.type === "promotion" ? "text-purple-600" : "text-blue-600"}`}>
                  {record.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-800">{record.title}</h4>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {record.type === "promotion" ? "Promotion" : "Transfer"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{record.details}</p>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {record.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
