import { promises as fs } from "fs";
import path from "path";

const frontendBase = path.resolve("frontend/src/domains");
const skipDomains = new Set(["auth", "permissions"]);

async function cleanFolder(folder: string, isRoot = false) {
  const entries = await fs.readdir(folder, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(folder, entry.name);

    if (entry.isDirectory()) {
      if (skipDomains.has(entry.name)) continue; // skip auth/permissions
      // recurse, but mark nested folders as non-root
      await cleanFolder(fullPath, false);
    } else {
      // remove placeholder index.ts files
      if (entry.name === "index.ts") {
        await fs.unlink(fullPath);
        console.log(`🗑️ Removed: ${fullPath}`);
      }

      // remove empty barrel.ts
      if (entry.name === "barrel.ts") {
        const content = await fs.readFile(fullPath, "utf-8");
        if (!content.trim()) {
          await fs.unlink(fullPath);
          console.log(`🗑️ Removed empty barrel: ${fullPath}`);
        }
      }

      // remove misplaced services.ts if not at root
      if (entry.name === "services.ts" && !isRoot) {
        await fs.unlink(fullPath);
        console.log(`🗑️ Removed misplaced services.ts: ${fullPath}`);
      }
    }
  }
}

async function run() {
  console.log(`📂 Cleaning domains under: ${frontendBase}`);
  await cleanFolder(frontendBase, true);
  console.log("\n✨ Cleanup complete (auth & permissions left untouched)");
}

run().catch(console.error);
