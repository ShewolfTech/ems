import { promises as fs, existsSync } from "node:fs";
import path from "node:path";

const root = "C:\\Bright\\ems";
const componentsBase = path.join(root, "frontend", "src", "components", "domains");
const appRoutesFile = path.join(root, "frontend", "src", "app", "routes", "AppRoutes.tsx");

const skipDomains = new Set(["auth", "permissions", "aacommon"]);

function capitalize(name: string) {
  return name.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

function getUniqueAlias(relativePath: string) {
  return relativePath.split(/[\\/]/).map(p => capitalize(p)).join("") + "Page";
}

let imports: string[] = [];
let routeEntries: string[] = [];

async function walk(currentPath: string) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || skipDomains.has(entry.name)) continue;

    const subPath = path.join(currentPath, entry.name);
    const relativePath = path.relative(componentsBase, subPath).replace(/\\/g, "/");

    const entityName = capitalize(entry.name);
    const pageFileName = `${entityName}Page.tsx`;
    const pageFilePath = path.join(subPath, pageFileName);

    if (existsSync(pageFilePath)) {
      const uniqueAlias = getUniqueAlias(relativePath);

      // Aliased import
      imports.push(`import { ${entityName}Page as ${uniqueAlias} } from "@/components/domains/${relativePath}/index.js";`);

      // Permission key
      const permissionKey = entry.name.replace("_view", "");
      const routePath = `/${relativePath.toLowerCase().replace(/_/g, "-")}`;

      routeEntries.push(`
        {userPermissions.includes("${permissionKey}:page") && (
          <Route path="${routePath}" element={<${uniqueAlias} />} />
        )}`);
    }

    await walk(subPath);
  }
}

async function run() {
  console.log("\n🚀 [EMS 2026] Generating AppRoutes.tsx...");

  await walk(componentsBase);

  const content = `import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage.js";
import LoginPage from "@/domains/auth/pages/LoginPage.js";
import { MainLayout } from "@/components/layout/MainLayout.js";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { normalizePermissions } from "@/app/utils/permissions.js";

// --- Dynamic Domain Page Imports (Aliased for Safety) ---
${imports.join("\n")}

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading, school } = useAuthContext();

  // ✅ Use fullCode + normalizePermissions
  const rawPermissions = school?.permissions_meta?.map(p => p.fullCode) || [];
  const userPermissions = normalizePermissions(rawPermissions);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Static Core Routes */}
        <Route index element={<LandingPage />} />
        <Route path="/dashboard" element={<LandingPage />} />

        {/* --- Automatically Generated & Permission-Gated Routes --- */}
        ${routeEntries.join("")}

        {/* Global Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
`;

  await fs.writeFile(appRoutesFile, content, "utf-8");
  console.log(`\n✨ Success: AppRoutes.tsx updated with ${imports.length} dynamic routes.`);
}

run().catch(console.error);
