import { promises as fs } from "node:fs";
import path from "node:path";

const baseDir = "C:/Bright/ems/frontend/src/domains";

async function walk(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile()) {
      if (entry.name === "Menu.tsx" || entry.name === "routes.tsx") {
        try {
          await fs.unlink(fullPath);
          console.log(`🗑️ Deleted: ${fullPath}`);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          console.log(`⚠️ Could not delete ${fullPath}: ${message}`);
        }
      }
    }
  }
}

async function run() {
  console.log("🚮 Cleaning up domain Menu.tsx and routes.tsx files...");
  await walk(baseDir);
  console.log("✅ Cleanup complete.");
}

run().catch(err => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`❌ Script failed: ${message}`);
});
