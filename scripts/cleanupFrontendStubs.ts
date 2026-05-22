// scripts/cleanupGeneratedStubs.ts
import { promises as fs } from "fs";
import path from "path";

const baseDir = path.resolve("frontend/src/components/domains");

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile() && fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files;
}

async function cleanupFile(file: string) {
  let content = await fs.readFile(file, "utf-8");

  // 1. Add .js extensions to relative imports
  content = content.replace(/(from\s+["']\..+?)(["'];)/g, (m, p1, p2) => {
    if (!p1.endsWith(".js")) return p1 + ".js" + p2;
    return m;
  });

  // 2. Replace header -> label in Table columns
  content = content.replace(/header:/g, "label:");

  // 3. Normalize pluralization drift
  content = content
    .replace(/AttendanceStatu/g, "AttendanceStatus")
    .replace(/AttendanceStatuss/g, "AttendanceStatus")
    .replace(/CreateStudent/g, "CreateStudents")
    .replace(/Student\b/g, "Students"); // careful: only singular type names

  await fs.writeFile(file, content, "utf-8");
  console.log(`✅ Cleaned ${file}`);
}

async function run() {
  const files = await walk(baseDir);
  console.log(`📡 Cleaning ${files.length} files...`);
  for (const file of files) {
    await cleanupFile(file);
  }
  console.log("✨ Cleanup complete.");
}

run().catch(console.error);
