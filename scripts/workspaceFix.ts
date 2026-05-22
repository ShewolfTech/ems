import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const FRONTEND_PATH = path.join(ROOT, "frontend/src");
const BACKEND_PATH = path.join(ROOT, "backend/src");
const SHARED_PATH = path.join(ROOT, "shared/src");

// Folders specific to Frontend UI
const FRONTEND_SUBFOLDERS = ["components", "pages", "hooks", "services", "context", "registry", "schema", "mock", "config"];
// Folders specific to Backend API logic
const BACKEND_SUBFOLDERS = ["services", "schema", "mock", "config", "types", "controllers", "routes", "middleware"];

function scaffold(barrelPath: string, isFrontend: boolean) {
  const dir = path.dirname(barrelPath);
  const foldersToCreate = isFrontend ? FRONTEND_SUBFOLDERS : BACKEND_SUBFOLDERS;

  // 1. Create subfolders and index.ts stubs
  foldersToCreate.forEach(folder => {
    const folderPath = path.join(dir, folder);
    const indexPath = path.join(folderPath, "index.ts");
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    // Only create a stub if the file is completely missing
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, "export {};\n", "utf-8");
    }
  });

  // 2. Handle Barrel Rewriting
  if (isFrontend) {
    // For Frontend, we enforce the professional /index.js format you requested
    const exportLines = foldersToCreate
      .map(f => `export * from "./${f}/index.js";`)
      .join("\n");
    
    const template = `// Auto-generated barrel\n${exportLines}\n\n// Optional files\n// export * from "./types.js";\n// export * from "./validator.js";\n// export * from "./errors.js";`;
    
    fs.writeFileSync(barrelPath, template, "utf-8");
    console.log(`✨ Standardized Frontend Barrel: ${path.relative(ROOT, barrelPath)}`);
  } else {
    // For Backend, we DO NOT overwrite. We just log that it exists.
    console.log(`🛡️  Preserving Backend Barrel: ${path.relative(ROOT, barrelPath)}`);
  }
}

function fixExtensions(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  // ESM requirement: ensures relative imports have .js extensions
  const fixed = content.replace(
    /(from\s+["']|import\s+["'])(\.\.?\/[^"']+(?<!\.js|\.css|\.svg|\.png|\.jpg|\.json))(["'])/g,
    "$1$2.js$3"
  );

  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, "utf-8");
  }
}

function walk(dir: string, isFrontend: boolean) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") walk(fullPath, isFrontend);
    } else if (entry.isFile()) {
      // Find the barrel to trigger scaffolding
      if (entry.name === "barrel.ts") {
        scaffold(fullPath, isFrontend);
      }
      // Fix extensions in all TS/TSX files
      if (/\.(ts|tsx)$/.test(entry.name)) {
        fixExtensions(fullPath);
      }
    }
  }
}

console.log("🚀 Starting Smart Workspace Healer...");
console.log("--------------------------------------");
walk(FRONTEND_PATH, true);
walk(BACKEND_PATH, false);
walk(SHARED_PATH, false);
console.log("--------------------------------------");
console.log("✅ Done! Your workspace is now organized and ESM compliant.");