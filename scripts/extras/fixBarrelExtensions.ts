import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targets = [
  path.resolve(__dirname, "../backend/src/domains"),
  path.resolve(__dirname, "../frontend/src/domains")
];

function fixImports(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Regex to find relative imports/exports that don't have an extension
  // It looks for things like "../context/AuthProvider" and adds ".js"
  const fixed = content.replace(
    /(from\s+["']|import\s+["'])(\.\.?\/[^"']+(?<!\.js|[./]))(["'])/g,
    "$1$2.js$3"
  );

  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, "utf-8");
    console.log(`✨ Fixed imports in: ${filePath}`);
  }
}

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      fixImports(fullPath);
    }
  }
}

console.log("🚀 Starting global extension fix...");
targets.forEach(walk);
console.log("✅ Fix complete.");

// To run this script, use: `ts-node scripts/fixBarrelExtensions.ts`