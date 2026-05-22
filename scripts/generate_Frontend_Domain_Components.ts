// scripts/generate_Frontend_Domain_Components.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");
const skipDomains = new Set(["auth", "permissions", "storage", "realtime", "vault", "extensions"]);

let generatedCount = 0;

function getTypeNameFromContent(content: string): string | null {
  const match = content.match(/export (?:type|interface) ([A-Z][A-Za-z0-9]+)\s*=\s*\{|export interface ([A-Z][A-Za-z0-9]+)\s*\{/);
  if (!match) return null;
  return match[1] || match[2];
}

function getResourceCapabilities(domain: string, resource: string) {
  const registry = permissionRegistry as any;
  const perms = registry[domain]?.[resource] || [];
  return {
    hasRead: perms.includes(`${resource}.read`) || perms.includes(`${resource}.manage`),
    hasCreate: perms.includes(`${resource}.create`) || perms.includes(`${resource}.manage`),
    hasUpdate: perms.includes(`${resource}.update`) || perms.includes(`${resource}.manage`),
    hasDelete: perms.includes(`${resource}.delete`) || perms.includes(`${resource}.manage`),
  };
}

async function generateComponents(folder: string, resource: string, domain: string) {
  const typesFilePath = path.join(folder, "types.ts");
  
  try {
    const typesContent = await fs.readFile(typesFilePath, "utf-8");
    const typeName = getTypeNameFromContent(typesContent);
    if (!typeName) return;

    const caps = getResourceCapabilities(domain, resource);
    if (!caps.hasRead) return;

    const isView = resource.endsWith("_view") || folder.includes(path.sep + "views" + path.sep);
    const componentsFolder = path.join(folder, "components");
    await fs.mkdir(componentsFolder, { recursive: true });

    // --- LIST COMPONENT ---
    const listFile = path.join(componentsFolder, `${typeName}List.tsx`);
    const hookMethods = ['data', 'loading', 'error'];
    if (!isView && caps.hasDelete) hookMethods.push('remove');

    const listContent = `import React from 'react';
import { use${typeName} } from '../hooks/use${typeName}.js';

interface ${typeName}ListProps {
  permissions: string[];
  onEdit?: (item: any) => void;
}

export const ${typeName}List: React.FC<${typeName}ListProps> = ({ permissions, onEdit }) => {
  const { ${hookMethods.join(', ')} } = use${typeName}({ permissions, autoFetch: true });

  if (loading) return <p>Loading ${typeName}...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {data.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <ul>
          {data.map((item: any) => (
            <li key={item.id}>
              {item.name || item.title || item.label || item.code || item.fullName || \`ID: \${item.id}\`}
              ${!isView && caps.hasUpdate ? `<button onClick={() => onEdit?.(item)}>Edit</button>` : ""}
              ${!isView && caps.hasDelete ? `<button onClick={() => remove(item.id)}>Delete</button>` : ""}
              ${isView ? `<span>Read Only</span>` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};`;
    await fs.writeFile(listFile, listContent, "utf-8");
    generatedCount++;

    // --- FORM COMPONENT (Resources only, not Views) ---
    if (!isView && (caps.hasCreate || caps.hasUpdate)) {
      const formFile = path.join(componentsFolder, `${typeName}Form.tsx`);
      const formHookMethods = ['loading'];
      if (caps.hasCreate) formHookMethods.push('save');
      if (caps.hasUpdate) formHookMethods.push('update');

      const formContent = `import React from 'react';
import { use${typeName} } from '../hooks/use${typeName}.js';

interface ${typeName}FormProps {
  permissions: string[];
  onClose?: () => void;
  initialData?: any;
}

export const ${typeName}Form: React.FC<${typeName}FormProps> = ({ permissions, onClose, initialData }) => {
  const { ${formHookMethods.join(', ')} } = use${typeName}({ permissions, autoFetch: false });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      if (initialData?.id && permissions.includes('${resource}.update')) {
        await update(initialData.id, payload);
      } else if (permissions.includes('${resource}.create')) {
        await save(payload);
      }
      onClose?.();
    } catch (err) { console.error(err); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" defaultValue={initialData?.name} />
      <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      {onClose && <button type="button" onClick={onClose}>Cancel</button>}
    </form>
  );
};`;
      await fs.writeFile(formFile, formContent, "utf-8");
      generatedCount++;
    }

  } catch (err) {
    // Fail silently
  }
}

async function walk(dir: string, currentDomain: string | null = null) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipDomains.has(entry.name) || entry.name.includes('.')) continue;
      const domain = currentDomain || entry.name;
      const hasTypes = await fs.access(path.join(fullPath, "types.ts")).then(() => true).catch(() => false);
      if (hasTypes) await generateComponents(fullPath, entry.name, domain);
      await walk(fullPath, domain);
    }
  }
}

async function run() {
  console.log("🎨 [UI Generator] Syncing components with Permission Registry...");
  await walk(frontendBase);
  console.log(`\n✨ Finished. Total UI components generated: ${generatedCount}`);
}

run().catch(console.error);
