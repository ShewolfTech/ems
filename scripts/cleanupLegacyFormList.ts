// scripts/cleanupLegacyUI.ts
import { promises as fs } from "fs";
import path from "path";

async function deleteLegacyFolders(baseDir: string) {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      // Delete legacy UI folders
      if (["Form", "List", "components"].includes(entry.name)) {
        await fs.rm(fullPath, { recursive: true, force: true });
        console.log(`🗑️ Deleted legacy folder: ${fullPath}`);
        continue;
      }
      // Recurse into subfolders
      await deleteLegacyFolders(fullPath);
    }
  }
}

async function run() {
  const frontendBase = path.resolve("frontend/src/domains");
  console.log("\n🚀 Cleaning up legacy Form, List & components folders...");
  await deleteLegacyFolders(frontendBase);
  console.log("✨ Cleanup complete.\n");
}

run().catch(console.error);
