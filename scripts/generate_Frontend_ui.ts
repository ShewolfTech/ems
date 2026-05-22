import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const frontendBase = path.resolve(__dirname, "../frontend/src/domains");
const componentsBase = path.resolve(__dirname, "../frontend/src/components/domains");

interface DomainField { name: string; label: string; uiType?: string; relation?: string; }
const SYSTEM_FIELDS = ["id", "schoolId", "school_id", "userId", "user_id", "createdAt", "updatedAt", "deletedAt", "isDeleted", "created_at", "updated_at", "deleted_at"];

// Resources with approval workflow - these should be manually implemented (not overwritten by script)
const APPROVAL_WORKFLOW_RESOURCES = ["leaves", "leave_requests"];

const capitalize = (s: string) => s.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase()).replace(/_/g, "");
const getSafeName = (s: string) => capitalize(s).replace(/[\s\-_]+/g, "");
const toSnake = (key: string) => key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();

function getResourceMeta(module: string, resource: string, route_type: string) {
  const segments = [module];
  const isReadOnly = ["view", "report"].includes(route_type);
  if (isReadOnly) segments.push("views");
  segments.push(resource);
  return { relPath: segments.join("/"), isReadOnly, pascalName: getSafeName(resource) };
}

/** --- TEMPLATES --- **/

const generateList = (name: string, fields: DomainField[]) => {
  const displayFields = fields.filter((f) => !SYSTEM_FIELDS.includes(f.name)).slice(0, 5);
  return `import React, { useState, useMemo } from "react";
import { ChevronRight, Database, Loader2 } from "lucide-react";

interface ${name}ListProps {
  data?: any[];
  loading?: boolean;
  onSelect: (item: any) => void;
  pageSize?: number;
}

const PAGE_SIZE = 100;

export function ${name}List({ data, loading, onSelect, pageSize = PAGE_SIZE }: ${name}ListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    if (!data) return [];
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil((data?.length || 0) / pageSize);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 bg-white border border-slate-200 rounded-[2.5rem]">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-slate-900" />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Loading...</p>
    </div>
  );
  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 text-slate-400">
      <Database className="w-12 h-12 mb-4 opacity-10" />
      <p className="font-bold uppercase tracking-tight text-center">No records found</p>
    </div>
  );
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
            <tr>
              ${displayFields.map(f => `<th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">${f.label}</th>`).join('')}
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedData.map((item: any) => (
              <tr key={item.id} onClick={() => onSelect(item)} className="hover:bg-slate-50/80 cursor-pointer transition-all group">
                ${displayFields.map(f => `<td className="px-8 py-5 text-sm text-slate-700 font-bold">{String(item.${toSnake(f.name)} ?? "—")}</td>`).join('')}
                <td className="px-8 py-5 text-right"><ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors inline" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-xs text-slate-500 font-medium">
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, data.length)} of {data.length} records
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 hover:bg-white rounded-xl disabled:opacity-30"><ChevronRight className="w-5 h-5 rotate-180" /></button>
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 hover:bg-white rounded-xl disabled:opacity-30">←</button>
            <span className="text-sm font-bold text-slate-500">Page {currentPage} of {totalPages}</span>
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 hover:bg-white rounded-xl disabled:opacity-30">→</button>
            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 hover:bg-white rounded-xl disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
export default ${name}List;`;
};

const generateDetail = (name: string, fields: DomainField[]) => {
  const displayFields = fields.filter((f) => !SYSTEM_FIELDS.includes(f.name));
  return `import React from "react";
import { X } from "lucide-react";

interface ${name}DetailProps {
  item: any;
  onClose: () => void;
}

export function ${name}Detail({ item, onClose }: ${name}DetailProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">${name} Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <div className="p-10 space-y-6">
        ${displayFields.map(f => {
          const fn = toSnake(f.name);
          return `<div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">${f.label}</span>
          <span className="text-lg font-bold text-slate-900">{String(item.${fn} ?? "—")}</span>
        </div>`;
        }).join('\n        ')}
      </div>
    </div>
  );
}
export default ${name}Detail;`;
};

const generateForm = (name: string, fields: DomainField[]) => {
  // Helper to determine UI type
  const isBooleanField = (fieldName: string): boolean => {
    const lower = fieldName.toLowerCase();
    return lower.startsWith('is_') || lower.startsWith('has_') || lower.startsWith('can_') || 
           lower.startsWith('requires_') || lower === 'active' || lower === 'enabled' || 
           lower === 'visible' || lower === 'deleted' || lower === 'required' || 
           lower === 'mandatory' || lower === 'locked' || lower === 'published';
  };

  const isTimestampField = (fieldName: string): boolean => {
    const lower = fieldName.toLowerCase();
    return lower === 'created_at' || lower === 'updated_at' || lower === 'deleted_at' || 
           lower === 'assigned_at' || lower === 'unassigned_at' || 
           lower.startsWith('created_') || lower.startsWith('updated_') || lower.startsWith('deleted_');
  };

  const getUiType = (f: DomainField): string => {
    // Use uiType from metadata if available
    if (f.uiType) return f.uiType;
    // Fallback to heuristics
    const fieldName = toSnake(f.name);
    if (isTimestampField(fieldName)) return 'date';
    if (isBooleanField(fieldName)) return 'boolean';
    return 'text';
  };

  const renderInput = (f: DomainField) => {
    const fieldName = toSnake(f.name);
    const uiType = getUiType(f);
    
    if (uiType === 'date') {
      return `<Input label="${f.label}" name="${fieldName}" type="date" defaultValue={initialData?.["${fieldName}"]?.split('T')[0]} />`;
    }
    if (uiType === 'boolean') {
      return `
          <div className="flex items-center gap-3 p-4 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50/30">
            <input type="checkbox" name="${fieldName}" defaultChecked={!!initialData?.["${fieldName}"]} className="w-5 h-5 accent-slate-900" />
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">${f.label} (Yes/No)</label>
          </div>`;
    }
    // Handle relation/select fields
    if (uiType === 'relation' && f.relation) {
      const pascalRelation = capitalize(f.relation.replace(/_(\w)/g, (_, c) => c.toUpperCase()));
      return `<Select 
            label="${f.label}" 
            name="${fieldName}" 
            relation="${f.relation}"
            placeholder="Select ${f.label}"
            defaultValue={initialData?.["${fieldName}"]}
          />`;
    }
    return `<Input label="${f.label}" name="${fieldName}" defaultValue={initialData?.["${fieldName}"]} />`;
  };

  const booleanFields = fields.filter(f => getUiType(f) === 'boolean');
  const otherFields = fields.filter(f => !SYSTEM_FIELDS.includes(f.name) && getUiType(f) !== 'boolean');

  return `import React from "react";
import { Button, Input, Select } from "@/components/domains/aacommon/index.js";
import { X } from "lucide-react";

export function ${name}Form({ initialData, onClose, onSave }: any) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    ${booleanFields.map(f => {
      const fn = toSnake(f.name);
      return `data.${fn} = formData.get("${fn}") === "on";`;
    }).join('\n    ')}
    
    // Include id from initialData for updates
    if (initialData?.id) {
      data.id = initialData.id;
    }

    onSave(data);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">${name} Editor</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-10 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          ${otherFields.map(f => renderInput(f)).join('\n          ')}
          ${booleanFields.map(f => renderInput(f)).join('\n          ')}
        </div>
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

export default ${name}Form;`;
};

const generatePage = (name: string, rel: string, isReadOnly: boolean) => {
  const formImport = !isReadOnly ? `import { ${name}Form } from "./${name}Form.js";` : "";
  const newRecordBtn = !isReadOnly ? `
          <Button variant="primary" onClick={() => { setSelectedItem(null); setViewMode("form"); }}>
            <Plus size={20} className="mr-2" /> New Record
          </Button>` : "";
  const formModal = !isReadOnly ? `
      {viewMode === "form" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="w-full max-w-4xl">
             <${name}Form initialData={selectedItem} onSave={handlePersistence} onClose={() => setViewMode("none")} />
           </div>
        </div>
      )}` : "";
  const detailActions = !isReadOnly ? `
             <div className="mt-8 flex justify-center gap-6">
               <button onClick={() => handleDelete(selectedItem.id)} className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-red-500 text-white rounded-2xl border border-white/20 transition-all font-bold group">
                  <Trash2 size={20} className="text-red-400 group-hover:text-white" />
                  <span>Delete Record</span>
               </button>
               <button onClick={() => setViewMode("form")} className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-105 transition-all font-bold">
                  <Edit3 size={20} />
                  <span>Edit Details</span>
               </button>
             </div>` : "";

  return `import React, { useState, useMemo } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { use${name} } from "@/domains/${rel}/hooks/use${name}.js";
import { ${name}List } from "./${name}List.js";
import { ${name}Detail } from "./${name}Detail.js";
import { Button } from "@/components/domains/aacommon/index.js";
import { Plus, RotateCw, Search, Trash2, Edit3 } from "lucide-react";
${formImport}

export function ${name}Page() {
  const { user } = useAuthContext() as any;
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"none" | "detail" | "form">("none");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, reload, save, update, remove } = use${name}({ autoFetch: true }) as any;

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
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">${name}</h1>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => reload()} disabled={loading}>
            <RotateCw className={loading ? 'animate-spin' : ''} size={20} />
          </Button>
          ${newRecordBtn}
        </div>
      </div>
      
      <div className="relative max-w-xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-8 py-5 border-2 rounded-[2rem] outline-none focus:border-slate-900 transition-all font-bold" />
      </div>

      <${name}List data={filteredData} loading={loading} onSelect={(item) => { setSelectedItem(item); setViewMode("detail"); }} />

      {viewMode === "detail" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="w-full max-w-4xl relative">
             <${name}Detail item={selectedItem} onClose={() => setViewMode("none")} />
             ${detailActions}
           </div>
        </div>
      )}
      ${formModal}
    </div>
  );
}
export default ${name}Page;`;
};

/** --- RUNNER --- **/
async function run() {
  try {
    const dbPath = pathToFileURL(path.resolve(__dirname, "../shared/src/db/database.ts")).href;
    const { pool } = await import(dbPath);
    const { rows } = await pool.query("SELECT module, resource, route_type FROM route_permissions WHERE module IS NOT NULL");

    for (const info of rows) {
      if (info.module === "auth") continue;
      const { relPath, isReadOnly, pascalName } = getResourceMeta(info.module, info.resource, info.route_type);
      const uiPath = path.join(componentsBase, relPath);
      const domainPath = path.join(frontendBase, relPath);

      try { await fs.access(domainPath); } catch { continue; }

      let fields: DomainField[] = [];
      try {
        const typeContent = await fs.readFile(path.join(domainPath, "types.ts"), "utf-8");
        // Read field name, label, uiType, and optional relation from metadata
        // Example: { name: "leave_type_id", label: "Leave Type Id", uiType: "relation", relation: "leave_types", required: true }
        const fieldRegex = /name:\s*["'](\w+)["']\s*,\s*label:\s*["']([^"']+)["']\s*,\s*uiType:\s*["'](\w+)["'](?:,\s*relation:\s*["'](\w+)["'])?/g;
        fields = Array.from(typeContent.matchAll(fieldRegex)).map(m => ({ name: m[1], label: m[2], uiType: m[3], relation: m[4] }));
      } catch { }

      await fs.mkdir(uiPath, { recursive: true });
      // Check if this is an approval workflow resource
      const normalizedResource = info.resource.toLowerCase();
      const isApprovalWorkflow = APPROVAL_WORKFLOW_RESOURCES.includes(normalizedResource);
      
      // Skip generating ALL files for approval workflow resources - they need manual implementation
      if (isApprovalWorkflow) {
        console.log(`⏭️ Skipped ${relPath}: approval workflow - manually implemented`);
      } else {
        await fs.writeFile(path.join(uiPath, `${pascalName}List.tsx`), generateList(pascalName, fields));
        await fs.writeFile(path.join(uiPath, `${pascalName}Detail.tsx`), generateDetail(pascalName, fields));
        await fs.writeFile(path.join(uiPath, `${pascalName}Page.tsx`), generatePage(pascalName, relPath, isReadOnly));
        
        const exports = [`export * from "./${pascalName}List.js";`, `export * from "./${pascalName}Detail.js";`, `export * from "./${pascalName}Page.js";`];
        if (!isReadOnly) {
          await fs.writeFile(path.join(uiPath, `${pascalName}Form.tsx`), generateForm(pascalName, fields));
          exports.push(`export * from "./${pascalName}Form.js";`);
        }
        await fs.writeFile(path.join(uiPath, "index.ts"), exports.join("\n"));
        console.log(`✅ Mirrored: ${relPath}`);
      }
    }
  } catch (err) { console.error(err); } finally { process.exit(0); }
}

run();
