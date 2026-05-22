import React, { useState, useMemo } from "react";
import { useLessonDeliveries } from "@/domains/academics/lesson_deliveries/hooks/useLessonDeliveries.js";
import { LessonDeliveriesList } from "./LessonDeliveriesList.js";
import { LessonDeliveryModal } from "./LessonDeliveryModal.js";
import { GenerateDeliveriesButton } from "./GenerateDeliveriesButton.js";

export function LessonDeliveriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDelivery, setModalDelivery] = useState<any>(null);
  const [modalAction, setModalAction] = useState<'delivered' | 'cancelled' | 'postponed' | null>(null);

  const { data, loading, reload, remove } = useLessonDeliveries({ autoFetch: true }) as any;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data || [];
    return data?.filter((item: any) => 
      Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];
  }, [data, searchTerm]);

  const handleView = (item: any) => {
    setModalDelivery(item);
    setModalAction(item.status === 'planned' ? 'delivered' : item.status);
    setModalOpen(true);
  };

  const handleQuickMark = (item: any, action: 'delivered' | 'cancelled' | 'postponed') => {
    setModalDelivery(item);
    setModalAction(action);
    setModalOpen(true);
  };

  const handleModalSuccess = async () => {
    setModalOpen(false);
    setModalDelivery(null);
    setModalAction(null);
    reload();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await remove(id);
      reload();
    } catch (err: any) { console.error("Delete failed:", err.message); }
  };

  // Summary stats
  const stats = useMemo(() => {
    if (!data) return { planned: 0, delivered: 0, cancelled: 0, postponed: 0, total: 0 };
    return {
      planned: data.filter((d: any) => d.status === 'planned').length,
      delivered: data.filter((d: any) => d.status === 'delivered').length,
      cancelled: data.filter((d: any) => d.status === 'cancelled').length,
      postponed: data.filter((d: any) => d.status === 'postponed').length,
      total: data.length,
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Lesson Deliveries</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Planned</p>
            <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Postponed</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.postponed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-600">{stats.total}</p>
          </div>
        </div>

        {/* Generate Button */}
        <GenerateDeliveriesButton />

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mt-6 mb-6">
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <LessonDeliveriesList 
        data={filteredData} 
        loading={loading} 
        onSelect={handleView} 
        onDelete={handleDelete}
        onQuickMark={handleQuickMark}
      />

      {modalOpen && modalDelivery && modalAction && (
        <LessonDeliveryModal
          delivery={modalDelivery}
          action={modalAction}
          onClose={() => { setModalOpen(false); setModalDelivery(null); setModalAction(null); }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

export default LessonDeliveriesPage;
