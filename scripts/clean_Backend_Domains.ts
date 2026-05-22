import { promises as fs } from "fs";
import path from "path";

const backendBase = path.resolve("backend/src/domains");

// domains to keep
const skipDomains = new Set(["auth", "permissions"]);

async function removeFolder(folder: string) {
  const entries = await fs.readdir(folder, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(folder, entry.name);

    if (entry.isDirectory()) {
      if (skipDomains.has(entry.name)) {
        console.log(`⏭️ Skipped domain: ${entry.name}`);
        continue;
      }
      // remove entire folder recursively
      await fs.rm(fullPath, { recursive: true, force: true });
      console.log(`🗑️ Removed folder: ${fullPath}`);
    }
  }
}

async function run() {
  console.log(`📂 Cleaning domains under: ${backendBase}`);
  await removeFolder(backendBase);
  console.log("\n✨ Cleanup complete (auth & permissions left untouched)");
}

run().catch(console.error);
