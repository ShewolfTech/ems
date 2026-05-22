// Path: src/components/layout/Topbar.tsx
import React from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { useLocation, Link } from "react-router-dom";
import { ComponentRegistry } from "@/app/routes/RouteRegistry.js";
import {
  Home,
  Users,
  BookOpen,
  ShieldCheck,
  Database,
  MessageSquare,
  Folder,
  Settings,
} from "lucide-react";

const ICON_MAP: Record<string, JSX.Element> = {
  dashboard: <Home size={14} />,
  studentsmgt: <Users size={14} />,
  academics: <BookOpen size={14} />,
  audit: <ShieldCheck size={14} />,
  vault: <Database size={14} />,
  communications: <MessageSquare size={14} />,
  filesmgt: <Folder size={14} />,
  system: <Settings size={14} />,
};

const toLabel = (str: string) => {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

export const Topbar: React.FC = () => {
  const { user, school } = useAuthContext();
  const location = useLocation();

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email?.split("@")[0] || "User";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // 1. Generate Breadcrumbs from URL segments
  const segments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/");
    const entry = Object.values(ComponentRegistry).find(e => e.path === path);
    const moduleName = segments[0]; 
    const icon = ICON_MAP[moduleName?.toLowerCase()] || null;
    return {
      path,
      label: entry?.label || toLabel(seg),
      icon,
    };
  });

  // 2. Build full list, avoiding duplicate /dashboard entries
  const fullBreadcrumbs = [];
  
  // Always start with Dashboard UNLESS we are already on the dashboard or landing
  if (location.pathname !== "/" && location.pathname !== "/dashboard") {
    fullBreadcrumbs.push({
      path: "/dashboard",
      label: "Dashboard",
      icon: ICON_MAP["dashboard"],
    });
  }
  
  fullBreadcrumbs.push(...breadcrumbs);

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center px-8 sticky top-0 z-10">
      {/* LEFT: Breadcrumbs */}
      <div className="flex-1 flex items-center gap-2 text-sm text-slate-600">
        {fullBreadcrumbs.map((crumb, idx) => (
          // ✅ FIX: Use index + path for a truly unique key
          <React.Fragment key={`${idx}-${crumb.path}`}>
            <Link to={crumb.path} className="flex items-center gap-1 hover:text-[#0d9488] font-medium transition-colors">
              {crumb.icon}
              <span className="truncate max-w-[150px]">{crumb.label}</span>
            </Link>
            {idx < fullBreadcrumbs.length - 1 && <span className="text-slate-300 mx-1">›</span>}
          </React.Fragment>
        ))}
      </div>

      {/* CENTER: School Name */}
      <div className="flex-[2] text-center px-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tight font-gill truncate">
          {school?.name ? toLabel(school.name) : "Management System"}
        </h1>
      </div>

      {/* RIGHT: Date + Profile */}
      <div className="flex-1 flex items-center justify-end gap-6">
        <div className="text-xs text-slate-400 font-medium hidden lg:block">{today}</div>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none mb-1">{fullName}</p>
            {user?.role && (
              <p className="text-[10px] uppercase tracking-wider text-[#0d9488] font-bold">
                {user.role}
              </p>
            )}
          </div>
          
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
            <span className="text-white font-black text-sm">
              {fullName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
