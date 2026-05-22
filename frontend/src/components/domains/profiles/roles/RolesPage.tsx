import React, { useState, useMemo } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { useRoles } from "@/domains/profiles/roles/hooks/useRoles.js";
import { RolesList } from "./RolesList.js";
import { RolesDetail } from "./RolesDetail.js";
import { Button } from "@/components/domains/aacommon/index.js";
import { Plus, RotateCw, Search, Trash2, Edit3 } from "lucide-react";
import { RolesForm } from "./RolesForm.js";

export function RolesPage() {
  const { user } = useAuthContext() as any;
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"none" | "detail" | "form">("none");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, reload, save, update, remove } = useRoles({ autoFetch: true }) as any;

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
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Roles</h1>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => reload()} disabled={loading}>
            <RotateCw className={loading ? 'animate-spin' : ''} size={20} />
          </Button>
          
          <Button variant="primary" onClick={() => { setSelectedItem(null); setViewMode("form"); }}>
            <Plus size={20} className="mr-2" /> New Record
          </Button>
        </div>
      </div>
      
      <div className="relative max-w-xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-8 py-5 border-2 rounded-[2rem] outline-none focus:border-slate-900 transition-all font-bold" />
      </div>

      <RolesList data={filteredData} loading={loading} onSelect={(item) => { setSelectedItem(item); setViewMode("detail"); }} />

      {viewMode === "detail" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="w-full max-w-4xl relative">
             <RolesDetail item={selectedItem} onClose={() => setViewMode("none")} />
             
             <div className="mt-8 flex justify-center gap-6">
               <button onClick={() => handleDelete(selectedItem.id)} className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-red-500 text-white rounded-2xl border border-white/20 transition-all font-bold group">
                  <Trash2 size={20} className="text-red-400 group-hover:text-white" />
                  <span>Delete Record</span>
               </button>
               <button onClick={() => setViewMode("form")} className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-105 transition-all font-bold">
                  <Edit3 size={20} />
                  <span>Edit Details</span>
               </button>
             </div>
           </div>
        </div>
      )}
      
      {viewMode === "form" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="w-full max-w-4xl">
             <RolesForm initialData={selectedItem} onSave={handlePersistence} onClose={() => setViewMode("none")} />
           </div>
        </div>
      )}
    </div>
  );
}
export default RolesPage;