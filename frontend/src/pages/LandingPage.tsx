// Path: src/pages/LandingPage.tsx
import React from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";

/**
 * LANDING PAGE / DASHBOARD
 * Professional design using Tailwind Slate/Blue palette.
 * Updated: 2026-02-14
 */
const LandingPage: React.FC = () => {
  const { user, school, isLoading } = useAuthContext();

  // 1. Handle Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">
            Loading Session...
          </p>
        </div>
      </div>
    );
  }

  // 2. Format Display Name
  // Fixed: Using lastName as defined in AuthContext.tsx
  const displayName = user
    ? `${user.firstName ?? ""}`.trim() || user.email
    : "Guest";

  // 3. Professional Professional UI
  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      {/* Header Section */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">
              Welcome, <span className="text-blue-600">{displayName}</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              Dashboard for <span className="text-slate-900 font-bold">{school?.name || "Your Institution"}</span>
            </p>
          </div>
          <div className="hidden md:block text-right">
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Quick Status Card */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-semibold">Auth Service</span>
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-semibold">Database Sync</span>
              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">Stable</span>
            </div>
          </div>
        </div>

        {/* Global Constraints Card (Ref: 2025-12-26 Instructions) */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-[2rem] p-8">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Instance Configuration</h3>
          <p className="text-slate-600 leading-relaxed mb-6 font-medium">
            Academics and global constraints are active. Your profile is currently being synchronized with the <span className="text-slate-900 font-bold">School ID: {user?.schoolId || "N/A"}</span> database schema.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
              Role: {user?.role || "Staff"}
            </span>
            <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
              Permissions: {user?.permissions?.length || 0} Active
            </span>
          </div>
        </div>

      </div>
      
      {/* Footer Branding */}
      <footer className="mt-20 text-center">
        <div className="h-px w-20 bg-slate-200 mx-auto mb-6"></div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
          EMS Professional Edition
        </p>
      </footer>
    </div>
  );
};

// CRITICAL: Explicitly export default to resolve AppRoutes.tsx errors
export default LandingPage;