// Path: frontend/src/components/layout/Sidebar.tsx
import React, { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthContext, PermissionItem } from "@/app/providers/AuthContext.js";
import {
  LogOut,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Menu,
  Home,
  Users,
  BookOpen,
  ShieldCheck,
  Database,
  MessageSquare,
  Folder,
  Settings,
  UserPlus,
  Package,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const ICON_MAP: Record<string, any> = {
  dashboard: <Home size={18} />,
  admissions: <UserPlus size={18} />,
  studentsmgt: <Users size={18} />,
  academics: <BookOpen size={18} />,
  audit: <ShieldCheck size={18} />,
  vault: <Database size={18} />,
  communications: <MessageSquare size={18} />,
  filesmgt: <Folder size={18} />,
  system: <Settings size={18} />,
  assetsmgt: <Package size={18} />,
};

function formatModuleName(moduleName: string): string {
  if (!moduleName) return "";
  let formatted = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  if (formatted.toLowerCase().includes("mgt")) {
    formatted = formatted.replace(/mgt/i, " Management");
  }
  if (formatted.toLowerCase().includes("view")) {
    formatted = formatted.replace(/view/i, "");
  }
  return formatted.trim();
}

const GROUP_LABELS: Record<string, string> = {
  setup: 'Setup',
  configuration: 'Configuration',
  classes_scheduling: 'Classes & Scheduling',
  assessments_grading: 'Assessments & Grading',
  reports_analytics: 'Reports & Analytics',
};

// Groups that should render as collapsible dropdowns
const COLLAPSIBLE_GROUPS = new Set(['setup', 'configuration']);

const ModuleGroup: React.FC<{
  moduleName: string;
  items: PermissionItem[];
  isCollapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ moduleName, items, isCollapsed, isOpen, onToggle }) => {
  const location = useLocation();
  const isChildActive = items.some((item) => location.pathname === item.route);
  const moduleIcon = ICON_MAP[moduleName.toLowerCase()] || <Folder size={18} />;

  // Separate flat items from collapsible groups
  const flatItems = items.filter((i) => !i.group_name || i.group_name === '_flat');
  const collapsibleGroups: Record<string, PermissionItem[]> = {};
  items.forEach((item) => {
    if (item.group_name && COLLAPSIBLE_GROUPS.has(item.group_name)) {
      if (!collapsibleGroups[item.group_name]) collapsibleGroups[item.group_name] = [];
      collapsibleGroups[item.group_name].push(item);
    }
  });

  const hasDropdown = Object.keys(collapsibleGroups).length > 0;

  // Track which collapsible group is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="mb-0.5">
      <button
        onClick={() => !isCollapsed && onToggle()}
        className={`w-full flex items-center px-3 py-2 rounded-xl transition-all group cursor-pointer
          ${(isOpen || isChildActive) && !isCollapsed ? "bg-white/10" : "hover:bg-white/5"}`}
      >
        <div
          className={`w-9 flex-shrink-0 flex justify-center items-center text-lg transition-all
          ${!isCollapsed ? "border-r border-slate-700/50 mr-3 pr-1" : ""}`}
        >
          <span className={isChildActive ? "text-[#2dd4bf]" : "text-slate-400 group-hover:text-white"}>
            {moduleIcon}
          </span>
        </div>

        {!isCollapsed && (
          <div className="flex flex-1 items-center justify-between overflow-hidden">
            <span className={`text-[14px] font-medium tracking-wide transition-colors truncate
              ${isOpen || isChildActive ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
              {formatModuleName(moduleName)}
            </span>
            <ChevronRight
              size={14}
              className={`text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-90 text-[#2dd4bf]" : ""}`}
            />
          </div>
        )}
      </button>

      {isOpen && !isCollapsed && (
        <div className="pl-12 space-y-0.5 mt-0.5 relative">
          <div className="absolute left-[29px] top-0 bottom-2 w-[1px] bg-slate-700/50" />

          {/* Flat items */}
          {flatItems.map((item, idx) => (
            <NavLink
              key={`${item.route}-${idx}`}
              to={item.route}
              className={({ isActive }) => `
                block px-3 py-1.5 rounded-lg text-[13px] transition-all
                ${isActive ? "text-white font-semibold bg-[#0d9488]" : "text-slate-400 font-normal hover:text-white hover:bg-white/5"}
              `}
            >
              {item.displayName}
            </NavLink>
          ))}

          {/* Collapsible dropdowns (e.g., Setup) */}
          {Object.entries(collapsibleGroups).map(([groupName, groupItems]) => {
            const isGroupOpen = openDropdown === groupName;
            const isGroupActive = groupItems.some((item) => location.pathname === item.route);
            return (
              <div key={groupName} className="mt-1">
                <button
                  onClick={() => setOpenDropdown(isGroupOpen ? null : groupName)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all
                    ${isGroupOpen || isGroupActive ? "text-white font-semibold" : "text-slate-400 font-normal hover:text-white hover:bg-white/5"}`}
                >
                  <span>{GROUP_LABELS[groupName] || groupName}</span>
                  <ChevronRight
                    size={14}
                    className={`transition-transform duration-200 ${isGroupOpen ? "rotate-90" : ""}`}
                  />
                </button>
                {isGroupOpen && (
                  <div className="pl-3 space-y-0.5 mt-1">
                    {groupItems.map((item, idx) => (
                      <NavLink
                        key={`${item.route}-${idx}`}
                        to={item.route}
                        className={({ isActive }) => `
                          block px-3 py-1.5 rounded-lg text-[13px] transition-all
                          ${isActive ? "text-white font-semibold bg-[#0d9488]" : "text-slate-400 font-normal hover:text-white hover:bg-white/5"}
                        `}
                      >
                        {item.displayName}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { school, logout } = useAuthContext();
  const [openModuleName, setOpenModuleName] = useState<string | null>(null);

  // ✅ Fixed grouping logic to prevent route mismatches and 404s
  const { dashboardModule, otherModules } = useMemo(() => {
    // We use school.menuItems directly as it's already filtered in AuthContext
    const menuItems = (school?.menuItems || []) as PermissionItem[];
    
    const seenRoutes = new Set<string>();
    const groups: Record<string, PermissionItem[]> = {};

    menuItems.forEach((item) => {
      if (!seenRoutes.has(item.route)) {
        const moduleName = item.module || "system";
        if (!groups[moduleName]) groups[moduleName] = [];
        groups[moduleName].push(item);
        seenRoutes.add(item.route);
      }
    });

    const dashboardKey = Object.keys(groups).find(
      (k) => k.toLowerCase() === "reporting" || k.toLowerCase() === "dashboard",
    );

    const dashboardData = dashboardKey ? groups[dashboardKey] : null;
    const rest = { ...groups };
    if (dashboardKey) delete rest[dashboardKey];

    const sortedRest = Object.fromEntries(
      Object.entries(rest).sort((a, b) => a[0].localeCompare(b[0])),
    );

    return { dashboardModule: dashboardData, otherModules: sortedRest };
  }, [school?.menuItems]); // ✅ Only re-run if menuItems reference changes

  return (
    <div className="flex flex-col h-full bg-[#0F172A] w-full overflow-hidden font-gill shadow-2xl transition-all duration-300 border-r border-slate-800">
      {/* 1. TOP BRANDING */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex flex-col gap-2">
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg hover:bg-[#0d9488] text-slate-400 hover:text-white transition-all flex items-center justify-center w-fit ${isCollapsed ? "mx-auto" : "self-end"}`}
        >
          <Menu size={20} />
        </button>

        {!isCollapsed && school && (
          <div className="flex items-center gap-3 px-1">
            <div className="bg-white p-1 rounded-lg flex-shrink-0 shadow-md">
              {school.logo_url ? (
                <img src={school.logo_url} alt="logo" className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 bg-[#0d9488] flex items-center justify-center text-white font-medium text-lg rounded-md">
                  {school.name ? school.name.charAt(0) : "?"}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-bold text-white truncate leading-tight">{school.name}</h2>
              <p className="text-[11px] font-mono text-[#2dd4bf] tracking-tight">Reg. Number: {school.code}</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. NAVIGATION AREA */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-sidebar-scrollbar">
        {dashboardModule && (
          <NavLink
            to={dashboardModule[0].route}
            onClick={() => setOpenModuleName(null)}
            className={({ isActive }) => `
              flex items-center px-3 py-2 rounded-xl transition-all mb-1
              ${isActive ? "bg-[#0d9488] text-white shadow-md" : "text-slate-100 hover:bg-white/5"}
            `}
          >
            <div className={`w-9 flex-shrink-0 flex justify-center items-center transition-all
              ${!isCollapsed ? "border-r border-slate-700/50 mr-3 pr-1" : ""}`}>
              <Home size={18} />
            </div>
            {!isCollapsed && <span className="text-[14px] font-medium tracking-wide">Dashboard</span>}
          </NavLink>
        )}

        {Object.entries(otherModules).map(([moduleName, items]) => (
          <ModuleGroup
            key={moduleName}
            moduleName={moduleName}
            items={items}
            isCollapsed={isCollapsed}
            isOpen={openModuleName === moduleName}
            onToggle={() => setOpenModuleName(openModuleName === moduleName ? null : moduleName)}
          />
        ))}
      </nav>

      {/* 3. FOOTER */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 transition-colors hover:bg-slate-800/80">
        {!isCollapsed && school && (
          <div className="mb-3 space-y-2 px-1 text-slate-100 animate-[fadeIn_0.4s_ease-out,slideUp_0.4s_ease-out]">
            <h3 className="text-[13px] font-bold text-[#2dd4bf] tracking-wide mb-1">{school.name}</h3>
            <div className="flex items-start gap-2 group">
              <MapPin size={12} className="mt-0.5 text-slate-500 flex-shrink-0 group-hover:text-[#2dd4bf]" />
              <span className="text-[10px] font-normal leading-tight opacity-80 break-words line-clamp-2 group-hover:opacity-100">
                {school.address}
              </span>
            </div>
            <div className="flex items-center gap-2 group">
              <Phone size={12} className="text-slate-500 flex-shrink-0 group-hover:text-[#2dd4bf]" />
              <span className="text-[10px] font-normal opacity-80 group-hover:opacity-100">{school.phone}</span>
            </div>
            <div className="flex items-center gap-2 group">
              <Mail size={12} className="text-slate-500 flex-shrink-0 group-hover:text-[#2dd4bf]" />
              <span className="text-[10px] font-normal opacity-80 break-all group-hover:opacity-100">{school.email}</span>
            </div>
          </div>
        )}

        <div className="border-t border-slate-700/50 my-2 transition-colors hover:border-[#0d9488]"></div>

        <button
          onClick={logout}
          className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3 py-2"} rounded-xl font-bold text-[12px] text-white bg-red-600/10 hover:bg-red-600 transition-all border border-red-600/30 cursor-pointer shadow-sm group`}
        >
          <div className={!isCollapsed ? "w-9 flex-shrink-0 flex justify-center items-center border-r border-red-400/20 mr-1" : ""}>
            <LogOut size={16} className="group-hover:text-white" />
          </div>
          {!isCollapsed && <span className="tracking-tighter">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;