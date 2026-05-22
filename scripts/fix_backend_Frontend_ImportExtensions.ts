// scripts/fixImportExtensions.ts
import { promises as fs } from "fs";
import path from "path";

// Directories to scan
const baseDirs = [
  path.resolve("frontend/src/domains"),
  path.resolve("backend/src/domains"),
];

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile() && (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx"))) {
      files.push(fullPath);
    }
  }
  return files;
}

async function fixFile(file: string) {
  let content = await fs.readFile(file, "utf-8");

  // Add .js extension to relative imports if missing
  content = content.replace(/(from\s+["']\..+?)(["'];)/g, (match, p1, p2) => {
    if (!p1.endsWith(".js")) {
      return p1 + ".js" + p2;
    }
    return match;
  });

  await fs.writeFile(file, content, "utf-8");
  console.log(`✅ Fixed imports in ${file}`);
}

async function run() {
  for (const baseDir of baseDirs) {
    const files = await walk(baseDir);
    console.log(`📡 Scanning ${files.length} files in ${baseDir}...`);
    for (const file of files) {
      await fixFile(file);
    }
  }
  console.log("✨ Import extension fix complete for frontend + backend.");
}

run().catch(console.error);

