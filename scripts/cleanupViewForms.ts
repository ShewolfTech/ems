// scripts/cleanupViewForms.ts
import { promises as fs } from "node:fs";
import path from "node:path";

const frontendBase = path.resolve("frontend/src/domains");

async function walk(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile()) {
      // Delete any Form.tsx or Filter.tsx inside "views" folders
      if (
        (entry.name.endsWith("Form.tsx") || entry.name.endsWith("Filter.tsx")) &&
        fullPath.includes(path.sep + "views" + path.sep)
      ) {
        await fs.unlink(fullPath);
        console.log(`🗑️ Deleted: ${fullPath}`);
      }
    }
  }
}

async function run() {
  console.log("🚮 Cleaning up view Form/Filter components...");
  await walk(frontendBase);
  console.log("✅ Cleanup complete.");
}

run().catch(console.error);
