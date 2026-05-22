import React, { useState, useMemo } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { useStaffmgtPromotionHistoryView } from "@/domains/staffmgt/views/staffmgt_promotion_history_view/hooks/useStaffmgtPromotionHistoryView.js";
import { StaffmgtPromotionHistoryViewList } from "./StaffmgtPromotionHistoryViewList.js";
import { StaffmgtPromotionHistoryViewDetail } from "./StaffmgtPromotionHistoryViewDetail.js";
import { Button } from "@/components/domains/aacommon/index.js";
import { Plus, RotateCw, Search, Trash2, Edit3 } from "lucide-react";


export function StaffmgtPromotionHistoryViewPage() {
  const { user } = useAuthContext() as any;
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"none" | "detail" | "form">("none");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, reload, save, update, remove } = useStaffmgtPromotionHistoryView({ autoFetch: true }) as any;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data || [];
    return data?.filter((item: any) => Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))) || [];
  }, [data, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanent Action: Are you sure you want to delete this record?")) return;
    try {
      await remove(id);
      setViewMode("none");
      reload();
    } catch (err: any) { console.error("Delete failed:", err.message); }
  };

  const handlePersistence = async (formData: any) => {
    try {
      const payload = { ...formData, school_id: user?.schoolId };
      await save(payload); // save() handles both create (POST) and update (PUT) based on payload.id
      setViewMode("none"); setSelectedItem(null); reload();
    } catch (err: any) { console.error("Save failed:", err.message); }
  };

  return (
    <div className="p-12 space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">StaffmgtPromotionHistoryView</h1>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => reload()} disabled={loading}>
            <RotateCw className={loading ? 'animate-spin' : ''} size={20} />
          </Button>
          
        </div>
      </div>
      
      <div className="relative max-w-xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-8 py-5 border-2 rounded-[2rem] outline-none focus:border-slate-900 transition-all font-bold" />
      </div>

      <StaffmgtPromotionHistoryViewList data={filteredData} loading={loading} onSelect={(item) => { setSelectedItem(item); setViewMode("detail"); }} />

      {viewMode === "detail" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="w-full max-w-4xl relative">
             <StaffmgtPromotionHistoryViewDetail item={selectedItem} onClose={() => setViewMode("none")} />
             
           </div>
        </div>
      )}
      
    </div>
  );
}
export default StaffmgtPromotionHistoryViewPage;