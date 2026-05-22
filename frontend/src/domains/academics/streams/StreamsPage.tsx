import React, { useState, useMemo } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { useStreams } from "@/domains/academics/streams/hooks/useStreams.js";

export function StreamsPage() {
  const { user } = useAuthContext() as any;
  const [view, setView] = useState<"list" | "form">("list");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, reload, save, remove } = useStreams({ autoFetch: true });

  const filteredData = useMemo(() => {
    if (!searchTerm) return data || [];
    return (data || []).filter((item: any) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);

  const handleCreateNew = () => { setSelectedItem(null); setView("form"); };

  const handleSuccess = () => { setView("list"); setSelectedItem(null); reload(); };
  const handleCancel = () => { setView("list"); setSelectedItem(null); };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this stream?")) return;
    try { await remove(id); reload(); } catch (err: any) { console.error("Delete failed:", err.message); }
  };

  const handleSave = async (formData: any) => {
    try {
      const payload = { ...formData, school_id: user?.schoolId };
      await save(payload);
      setView("list"); setSelectedItem(null); reload();
    } catch (err: any) { console.error("Save failed:", err.message); }
  };

  const handleEdit = (item: any) => { setSelectedItem(item); setView("form"); };

  if (view === "form") {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">{selectedItem?.id ? "Edit Stream" : "New Stream"}</h1>
            <p className="text-gray-600 text-sm">{selectedItem?.id ? "Update stream details" : "Create a new stream for parallel classes"}</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">{selectedItem?.id ? "Edit Stream" : "New Stream"}</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave({ ...Object.fromEntries(new FormData(e.currentTarget) as any), id: selectedItem?.id }); }} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stream Name *</label>
                  <input type="text" name="name" required defaultValue={selectedItem?.name || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g. Stream A, Blue Stream" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input type="text" name="code" required defaultValue={selectedItem?.code || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g. A, B, BLUE" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" defaultValue={selectedItem?.description || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" rows={2} placeholder="Optional description..." />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_active" defaultChecked={selectedItem?.is_active ?? true} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">{selectedItem?.id ? "Update Stream" : "Create Stream"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Streams</h1>
            <p className="text-gray-600 text-sm">Manage parallel class streams (A, B, C, etc.)</p>
          </div>
          <button onClick={handleCreateNew} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">+ New Stream</button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input type="text" placeholder="Search streams..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">Loading streams...</div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center"><p className="text-lg text-gray-500">No streams found</p><p className="text-sm text-gray-400 mt-1">Click "New Stream" to get started</p></div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEdit(s)}>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{s.name}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{s.code}</span></td>
                    <td className="px-6 py-4"><div className="text-sm text-gray-600">{s.description || "—"}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{s.is_active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StreamsPage;
