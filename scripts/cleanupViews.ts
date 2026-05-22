// scripts/cleanupStrayViews.ts
import { promises as fs } from "fs";
import path from "path";

async function deleteStrayViews(baseDir: string) {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      // Delete if folder ends with _view but is NOT inside a "views" folder
      if (entry.name.endsWith("_view") && path.basename(path.dirname(fullPath)) !== "views") {
        await fs.rm(fullPath, { recursive: true, force: true });
        console.log(`🗑️ Deleted stray view folder: ${fullPath}`);
        continue;
      }
      // Recurse deeper
      await deleteStrayViews(fullPath);
    }
  }
}

async function run() {
  const componentsBase = path.resolve("frontend/src/components/domains");
  console.log("\n🚀 Cleaning stray _view folders outside views/...");
  await deleteStrayViews(componentsBase);
  console.log("✨ Cleanup complete.\n");
}

run().catch(console.error);
