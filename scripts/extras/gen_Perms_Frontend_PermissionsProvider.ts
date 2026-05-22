// scripts/gen_Perms_Frontend_PermissionsProvider.ts
import { promises as fs } from "node:fs";
import path from "node:path";

const frontendBase = path.resolve("frontend/src");

async function scaffoldPermissionsProvider() {
  const providerFile = path.join(frontendBase, "domains/permissions/PermissionsProvider.tsx");
  await fs.mkdir(path.dirname(providerFile), { recursive: true });

  const content = `// Auto-generated PermissionsProvider
import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as controller from "./controller";

interface PermissionsContextValue {
  userPermissions: string[];
  refreshPermissions: () => Promise<void>;
}

export const PermissionsContext = createContext<PermissionsContextValue>({
  userPermissions: [],
  refreshPermissions: async () => {},
});

interface Props {
  userId: number;
  children: ReactNode;
}

export function PermissionsProvider({ userId, children }: Props) {
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  async function refreshPermissions() {
    try {
      const res = await controller.listPermissions(userId);
      setUserPermissions(res.data);
    } catch (err) {
      console.error("[PermissionsProvider] Failed to load permissions", err);
      setUserPermissions([]);
    }
  }

  useEffect(() => {
    refreshPermissions();
  }, [userId]);

  return (
    <PermissionsContext.Provider value={{ userPermissions, refreshPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}
`;

  await fs.writeFile(providerFile, content, "utf-8");
  console.log(`[Frontend] ✅ PermissionsProvider Generated`);
}

async function injectIntoApp() {
  const appFile = path.join(frontendBase, "App.tsx");
  try {
    const appContent = await fs.readFile(appFile, "utf-8");

    if (!appContent.includes("PermissionsProvider")) {
      const updated = appContent.replace(
        /function App\(\) {([\s\S]*?)return \(/,
        `import { PermissionsProvider } from "./domains/permissions/PermissionsProvider";\n\nfunction App() {$1return (\n    <PermissionsProvider userId={123}>`
      ).replace(/<\/MainRouter>/, `</MainRouter>\n    </PermissionsProvider>`);

      await fs.writeFile(appFile, updated, "utf-8");
      console.log(`[Frontend] ✅ PermissionsProvider injected into App.tsx`);
    } else {
      console.log(`[Frontend] ℹ PermissionsProvider already present in App.tsx`);
    }
  } catch (err) {
    console.error(`[Frontend] ⚠ Could not inject PermissionsProvider into App.tsx`, err);
  }
}

async function run() {
  await scaffoldPermissionsProvider();
  await injectIntoApp();
}

run().catch(console.error);
