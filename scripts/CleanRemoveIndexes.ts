import { promises as fs } from "node:fs";
import path from "node:path";

const bases = [
  "C:/Bright/ems/frontend/src/domains",
  "C:/Bright/ems/frontend/src/components/domains",
];

async function walk(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);

      // After walking, check if directory is empty → remove it
      try {
        const remaining = await fs.readdir(fullPath);
        if (remaining.length === 0) {
          await fs.rmdir(fullPath);
          console.log(`🗑️ Removed empty folder: ${fullPath}`);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.log(`⚠️ Could not remove folder ${fullPath}: ${message}`);
      }
    } else if (entry.isFile()) {
      if (entry.name === "index.ts" || entry.name === "index.tsx") {
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
  console.log("🚮 Cleaning up all index.ts and index.tsx files in domains and components...");
  for (const base of bases) {
    console.log(`🔍 Scanning: ${base}`);
    await walk(base);
  }
  console.log("✅ Cleanup complete.");
}

run().catch(err => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`❌ Script failed: ${message}`);
});
