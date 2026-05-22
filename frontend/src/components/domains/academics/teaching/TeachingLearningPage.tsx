import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Calendar, Users, Clock, ChevronRight, Plus
} from "lucide-react";

const tabs = [
  { id: "lessons", label: "Lessons", icon: <BookOpen className="w-4 h-4" /> },
  { id: "deliveries", label: "Lesson Deliveries", icon: <Users className="w-4 h-4" /> },
  { id: "schedule", label: "Class Schedule", icon: <Calendar className="w-4 h-4" /> },
  { id: "workload", label: "Teacher Workload", icon: <Clock className="w-4 h-4" /> },
];

export function TeachingLearningPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("lessons");

  const renderTabContent = () => {
    switch (activeTab) {
      case "lessons":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Lesson Planning</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                <Plus className="w-4 h-4" /> New Lesson
              </button>
            </div>
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Lesson Management</h3>
              <p className="text-slate-600">Create and organize lesson plans by class and subject.</p>
            </div>
          </div>
        );
      case "deliveries":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Lesson Deliveries</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                <Plus className="w-4 h-4" /> Record Delivery
              </button>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Lesson</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Teacher</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { lesson: "Introduction to Algebra", teacher: "Mr. Smith", class: "P1A", date: "Apr 10, 2026", status: "Delivered" },
                    { lesson: "English Grammar", teacher: "Ms. Jones", class: "P2B", date: "Apr 11, 2026", status: "Scheduled" },
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{item.lesson}</td>
                      <td className="px-4 py-3 text-slate-600">{item.teacher}</td>
                      <td className="px-4 py-3 text-slate-600">{item.class}</td>
                      <td className="px-4 py-3 text-slate-600">{item.date}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "schedule":
        return (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Class Schedule</h3>
            <p className="text-slate-600">View and manage weekly class schedules.</p>
          </div>
        );
      case "workload":
        return (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Teacher Workload</h3>
            <p className="text-slate-600">Track teacher assignments and workload distribution.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-teal-600" />
            Teaching & Learning
          </h1>
          <p className="text-slate-600 mt-2">Manage lessons, deliveries, schedules, and teacher workload</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default TeachingLearningPage;
