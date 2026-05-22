// scripts/updateAppRoutes.ts
import fs from "fs";
import path from "path";

const componentsDir = path.resolve("frontend/src/components/domains");
const appRoutesFile = path.resolve("frontend/src/app/routes/AppRoutes.tsx");

function findPages(dir: string) {
  const pages: { importPath: string; routePath: string; entityName: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...findPages(fullPath));
    } else if (entry.isFile() && entry.name.endsWith("Page.tsx")) {
      const relativePath = path.relative("frontend/src", fullPath).replace(/\\/g, "/");
      const importPath = "@/" + relativePath.replace(/\.tsx$/, ".js");
      const entityName = entry.name.replace(".tsx", "");
      // Route path = folder structure after "domains"
      const routePath =
        "/" + path.relative(componentsDir, path.dirname(fullPath)).replace(/\\/g, "/");
      pages.push({ importPath, routePath, entityName });
    }
  }
  return pages;
}

function generateRoutes() {
  const pages = findPages(componentsDir);

  const imports = pages
    .map((p) => `import { ${p.entityName} } from "${p.importPath}";`)
    .join("\n");
  const routes = pages
    .map((p) => `        <Route path="${p.routePath}" element={<${p.entityName} />} />`)
    .join("\n");

  const content = `import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage.js";
import LoginPage from "@/domains/auth/pages/LoginPage.js";
import { MainLayout } from "@/components/layout/MainLayout.js";
import { useAuthContext } from "@/app/providers/AuthContext.js";

${imports}

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) return null;

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
        <Route index element={<LandingPage />} />
        <Route path="/dashboard" element={<LandingPage />} />

${routes}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
`;

  fs.writeFileSync(appRoutesFile, content, "utf-8");
  console.log(`✅ AppRoutes.tsx updated with ${pages.length} generated Pages.`);

  removeDuplicates(); // cleanup pass
}

function removeDuplicates() {
  let content = fs.readFileSync(appRoutesFile, "utf-8");

  const seenImports = new Set<string>();
  const seenRoutes = new Set<string>();

  const cleaned = content
    .split("\n")
    .filter((line) => {
      if (line.startsWith("import {")) {
        const match = line.match(/import\s+\{\s*(\w+)/);
        if (match) {
          const identifier = match[1];
          if (seenImports.has(identifier)) return false;
          seenImports.add(identifier);
        }
      }
      if (line.trim().startsWith("<Route")) {
        const match = line.match(/path="([^"]+)"/);
        if (match) {
          const routePath = match[1];
          if (seenRoutes.has(routePath)) return false;
          seenRoutes.add(routePath);
        }
      }
      return true;
    })
    .join("\n");

  fs.writeFileSync(appRoutesFile, cleaned, "utf-8");
  console.log("✨ Duplicates removed from AppRoutes.tsx");
}

generateRoutes();
