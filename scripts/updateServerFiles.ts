// 📁 scripts/updateServerFiles.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.resolve(__dirname, "../backend/src/server");

function writeFileSafe(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✨ Updated: ${filePath}`);
}

// --- mountRoutes.ts ---
function generateMountRoutes() {
  return `import express from "express";
import { scanRoutes } from "./scanRoutes.js";

// Explicitly import critical domains
import authRoutes from "../domains/auth/routes.js";
import permissionRoutes from "../domains/permissions/routes.js";

export function mountRoutes(app: express.Application) {
  // Critical domains mounted explicitly
  app.use("/auth", authRoutes);
  app.use("/permissions", permissionRoutes);

  // Auto-scan and mount other domains dynamically
  const domainsPath = new URL("../domains", import.meta.url).pathname;
  scanRoutes(app, domainsPath);
}
`;
}

// --- scanRoutes.ts ---
function generateScanRoutes() {
  return `import fs from "fs";
import path from "path";
import express from "express";

export function scanRoutes(app: express.Application, domainsPath: string) {
  const domains = fs.readdirSync(domainsPath);
  for (const domain of domains) {
    const routesFile = path.join(domainsPath, domain, "routes.js");
    if (fs.existsSync(routesFile)) {
      const routes = require(routesFile).default;
      app.use(\`/\${domain}\`, routes);
      console.log(\`🔄 Mounted domain: \${domain}\`);
    }
  }
}
`;
}

// --- server.ts ---
function generateServer() {
  return `import express from "express";
import { mountRoutes } from "./mountRoutes.js";

// Reuse global middleware/config from existing folders
import { errorHandler } from "../middleware/infra/errorHandler.js";
import { cors } from "../config/infra/cors.js";

const app = express();
app.use(express.json());

// Apply global config/middleware
app.use(cors);

// Mount all domain routes
mountRoutes(app);

// Apply global error handler last
app.use(errorHandler);

export default app;
`;
}

// --- start.ts ---
function generateStart() {
  return `import app from "./server.js";

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
`;
}

// --- Main ---
async function main() {
  console.log("🚀 Updating server orchestration files...");

  writeFileSafe(path.join(serverPath, "mountRoutes.ts"), generateMountRoutes());
  writeFileSafe(path.join(serverPath, "scanRoutes.ts"), generateScanRoutes());
  writeFileSafe(path.join(serverPath, "server.ts"), generateServer());
  writeFileSafe(path.join(serverPath, "start.ts"), generateStart());

  console.log("✅ Server files fully updated.");
}

main().catch((err) => {
  console.error("❌ Error updating server files:", err);
  process.exit(1);
});
