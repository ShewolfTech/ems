/**
 * Auto-generate CRUD Page components for all entities from DB
 * Usage: ts-node generatePages.ts
 */

import fs from "fs";
import path from "path";
import { Client } from "pg"; // PostgreSQL client

// 🔹 Template generator
function generatePage(entityName: string, folderName: string) {
  const permissionKey = folderName.replace("_view", "");
  return `import React, { useState } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { Button } from "@/components/domains/aacommon/index.js";
import { Plus } from "lucide-react";
import { ${entityName}List, ${entityName}Detail } from "./index.js";

export function ${entityName}Page() {
    const { school } = useAuthContext();
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const userPermissions = school?.permissions_meta?.map((p: any) => p.permissionCode) || [];

    if (!userPermissions.includes("${permissionKey}:page")) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
                    <span className="text-3xl font-bold">!</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
                <p className="text-slate-500 max-w-xs mt-2 text-sm font-medium">
                    You do not have the required permissions to view ${entityName.toLowerCase()} management.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
                <div>
                    <nav className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-2">Management Portal</nav>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">${entityName}</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Review and manage institutional ${entityName.toLowerCase()} records.</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 flex items-center gap-2">
                        <Plus size={16} />
                        <span>Add New Entry</span>
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <main className="xl:col-span-7">
                    <${entityName}List 
                        permissions={userPermissions} 
                        onSelect={(item) => setSelectedItem(item)} 
                    />
                </main>
                <aside className="xl:col-span-5 sticky top-8">
                    <${entityName}Detail item={selectedItem} permissions={userPermissions} />
                </aside>
            </div>
        </div>
    );
}
export default ${entityName}Page;`;
}
