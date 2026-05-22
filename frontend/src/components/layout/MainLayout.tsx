// Path: frontend/src/components/layout/MainLayout.tsx
import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar.js";
import { Topbar } from "@/components/layout/Topbar.js";
import { Outlet } from "react-router-dom";

export const MainLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-gill overflow-hidden">
      {/* Sidebar is now fully self-sufficient. 
          It pulls its own optimized menu data from useAuthContext internally.
      */}
      <aside
        className={`h-full transition-all duration-300 ease-in-out flex-shrink-0 z-20 shadow-2xl bg-[#0F172A] ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR: Stays consistent across all pages */}
        <Topbar /> 

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-main-scrollbar">
          <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Outlet renders the child routes defined in AppRoutes */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};