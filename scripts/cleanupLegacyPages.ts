// scripts/cleanupLegacyPages.ts
import { promises as fs } from "fs";
import path from "path";

async function deleteLegacyPages(baseDir: string) {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "pages") {
        await fs.rm(fullPath, { recursive: true, force: true });
        console.log(`🗑️ Deleted legacy pages folder: ${fullPath}`);
        continue;
      }
      await deleteLegacyPages(fullPath);
    }
  }
}

async function run() {
  const frontendBase = path.resolve("frontend/src/domains");
  console.log("\n🚀 Cleaning up legacy Page folders...");
  await deleteLegacyPages(frontendBase);
  console.log("✨ Cleanup complete.\n");
}

run().catch(console.error);
