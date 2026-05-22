// scripts/gen_Perms_Frontend_PermissionsBarrel.ts
import { promises as fs } from "node:fs";
import path from "node:path";

const frontendBase = path.resolve("frontend/src/domains/permissions");

async function scaffoldPermissionsBarrel() {
  const barrelFile = path.join(frontendBase, "index.ts");
  await fs.mkdir(path.dirname(barrelFile), { recursive: true });

  const content = `// Auto-generated frontend permissions barrel
export * from "./PermissionsProvider";
export * from "./hooks";
export * from "./utils";
export * from "./controller";
export * from "./services";
export * from "./types";
export * from "./validator";
export * from "./errors";
export * from "./routes";
export * from "./auditLogger";
export * from "./components/PermissionGate";
export * from "./components/RoleManager";
// Add other components here as they are scaffolded
`;

  await fs.writeFile(barrelFile, content, "utf-8");
  console.log(`[Frontend] ✅ Permissions Barrel Generated`);
}

scaffoldPermissionsBarrel().catch(console.error);
