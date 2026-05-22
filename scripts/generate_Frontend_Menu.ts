// scripts/generate_Frontend_Menu.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/components/layout");
const menuFile = path.join(frontendBase, "AppMenu.tsx");

function formatLabel(resource: string) {
  return resource.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatPath(domain: string, resource: string) {
  return `/${domain}/${resource.replace(/_/g, "-")}`;
}

async function run() {
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;
  let groupedLinks: Record<string, string[]> = {};

  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      const perms = registry[domain][resource];
      if (perms.includes(`${resource}:page`)) {
        const label = formatLabel(resource);
        const pathUrl = formatPath(domain, resource);

        const link = `
          {userPermissions.includes("${resource}:page") && (
            <Link to="${pathUrl}" className="menu-link">${label}</Link>
          )}`;

        if (!groupedLinks[domain]) groupedLinks[domain] = [];
        groupedLinks[domain].push(link);
      }
    }
  }

  const domainSections = Object.entries(groupedLinks)
    .map(([domain, links]) => {
      const sectionLabel = domain.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const sectionKey = domain.replace(/[^a-zA-Z0-9]/g, "");
      return `
      <div className="menu-section">
        <button
          className="menu-section-title"
          onClick={() => setOpenSection(openSection === "${sectionKey}" ? null : "${sectionKey}")}
        >
          {openSection === "${sectionKey}" ? "▼" : "▶"} ${sectionLabel}
        </button>
        {openSection === "${sectionKey}" && (
          <div className="space-y-1">
            ${links.join("\n")}
          </div>
        )}
      </div>`;
    })
    .join("\n");

  const content = `import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/app/providers/AuthContext.js";

export const AppMenu: React.FC = () => {
  const { school } = useAuthContext();
  const userPermissions =
    school?.permissions_meta?.map((p: { permissionCode: string }) => p.permissionCode) || [];

  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <nav className="space-y-6">
      <Link to="/dashboard" className="menu-link">Dashboard</Link>
      ${domainSections}
    </nav>
  );
};`;

  await fs.mkdir(frontendBase, { recursive: true });
  await fs.writeFile(menuFile, content, "utf-8");
  console.log("✅ Global AppMenu.tsx generated successfully with collapsible domain sections");
}

run().catch(console.error);
