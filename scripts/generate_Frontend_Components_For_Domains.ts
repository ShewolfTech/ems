import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceDir = path.join(root, "frontend", "src", "domains");
const targetDir = path.join(root, "frontend", "src", "components", "domains");
const protectedFolder = "aacommon"; 

const entityMarkers = ["types.ts", "services.ts", "controller.ts"];
const ignoreList = new Set(["hooks", "auth", "components", "pages", "utils", "services", "contracts"]);

let generatedCount = 0;
let cleanedCount = 0;

function capitalize(name: string) {
  return name.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function ensureFolder(folderPath: string) {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
}

function isReadOnlyView(folderName: string, fullPath: string): boolean {
  return folderName.toLowerCase().endsWith("view") || fullPath.includes(`${path.sep}views${path.sep}`);
}

/**
 * SMART PARSER: Extracts fields from types.ts and detects dropdown needs
 */
function parseFields(filePath: string, entityName: string) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const regex = new RegExp(`export (?:type|interface) (?:${entityName}Payload|${entityName})\\s*=\\s*{([^}]+)}`, "s");
  const match = content.match(regex);
  if (!match) return [];
  
  const body = match[1];
  return [...body.matchAll(/(\w+)\??:\s*([\w\[\]\|]+)/g)]
    .map(m => ({ name: m[1], type: m[2] }))
    .filter(f => !["id", "createdAt", "updatedAt", "deletedAt"].includes(f.name));
}

function generateDetail(entityName: string, fields: any[]) {
  return `import React from "react";

export function ${entityName}Detail({ item }: { item: any }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">${entityName} Details</h3>
      </div>
      <div className="p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          ${fields.map(f => {
            const label = f.name.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
            return `
          <div className="space-y-1">
            <dt className="text-[10px] font-black text-slate-400 uppercase tracking-wider">${label}</dt>
            <dd className="text-sm font-semibold text-slate-600">{item?.${f.name}?.toString() || '-'}</dd>
          </div>`;
          }).join('')}
        </dl>
      </div>
    </div>
  );
}
`;
}

function generateForm(entityName: string, fields: any[]) {
  return `import React from "react";
import { useForm } from "react-hook-form";
import { FormField, Button } from "@/components/domains/aacommon/index.js";

export function ${entityName}Form({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { register, handleSubmit } = useForm();
  
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
      <div className="mb-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Manage ${entityName}</h3>
        <p className="text-xs text-slate-400 font-medium italic">Fill in the fields to update the record.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        ${fields.map(f => {
          const label = f.name.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
          if (["gender", "status", "class", "role"].some(key => f.name.toLowerCase().includes(key))) {
            return `
        <FormField label="${label}">
          <select {...register("${f.name}")} className="w-full h-11 px-4 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm font-medium">
            <option value="">Select ${label}...</option>
            <option value="active">Active / Primary</option>
            <option value="inactive">Inactive / Secondary</option>
          </select>
        </FormField>`;
          }
          const inputType = f.name.toLowerCase().includes("date") ? "date" : f.type.includes("number") ? "number" : "text";
          return `
        <FormField label="${label}">
          <input type="${inputType}" {...register("${f.name}")} className="w-full h-11 px-4 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm font-medium shadow-inner" placeholder="Enter ${label.toLowerCase()}..." />
        </FormField>`;
        }).join('')}
        
        <div className="pt-4">
          <Button type="submit" className="w-full bg-slate-900 text-white h-12 rounded-xl font-black text-sm hover:bg-black transition-all shadow-lg shadow-slate-200">Save Configuration</Button>
        </div>
      </form>
    </div>
  );
}
`;
}

function mirror(src: string, dest: string) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith(".") || ignoreList.has(entry.name)) continue;
      const srcPath = path.join(src, entry.name);

      const isViewsContainer = entry.name === "views";
      const currentDest = isViewsContainer
        ? path.join(dest, "views")   // ✅ put under views subfolder
        : path.join(dest, entry.name);

      ensureFolder(currentDest);

      const childEntries = fs.readdirSync(srcPath);
      if (childEntries.some(name => entityMarkers.includes(name))) {
        const entityName = capitalize(entry.name);
        const isView = isReadOnlyView(entry.name, srcPath);
        const fields = parseFields(path.join(srcPath, "types.ts"), entityName);

        // 1. Generate List Stub
        fs.writeFileSync(path.join(currentDest, `${entityName}List.tsx`), `import React from "react";

export function ${entityName}List({ data = [] }: { data?: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">${entityName} Index</h3>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{data.length} items</span>
      </div>
      <div className="p-10 text-center text-slate-400 text-xs italic font-medium">No ${entityName} records available for display.</div>
    </div>
  );
}
`);

        // 2. Generate Detail
        fs.writeFileSync(path.join(currentDest, `${entityName}Detail.tsx`), generateDetail(entityName, fields));

        // 3. Generate Form (only for tables, not views)
        const stubs = ["List", "Detail"];
        if (!isView) {
          stubs.push("Form");
          fs.writeFileSync(path.join(currentDest, `${entityName}Form.tsx`), generateForm(entityName, fields));
        }

        // 4. Generate Barrel
        const barrelContent = `// Auto-generated UI barrel\n` +
          stubs.sort().map(s => `export * from "./${entityName}${s}.js";`).join("\n") + "\n";
        fs.writeFileSync(path.join(currentDest, "index.ts"), barrelContent);

        console.log(`  ${isView ? "👁️  VIEW " : "🛠️  TABLE"}: ${entry.name} (${fields.length} fields)`);
        generatedCount += stubs.length;
      }

      mirror(srcPath, currentDest);
    }
  }
}

function run() {
  console.log("🚀 [Master UI Sync] Building Professional EMS Infrastructure...");
  ensureFolder(targetDir);

  // Clean existing domain folders except the protected one
  const items = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory() && item.name !== protectedFolder) {
      fs.rmSync(path.join(targetDir, item.name), { recursive: true, force: true });
      cleanedCount++;
    }
  }

  // Mirror domains into components/domains
  mirror(sourceDir, targetDir);

  console.log(`\n✅ Sync Complete.\n- Folders Cleaned: ${cleanedCount}\n- Components Generated: ${generatedCount}`);
}

run();
