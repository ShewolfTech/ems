import { promises as fs } from "node:fs";
import path from "node:path";

// Define BOTH possible locations where forms might live
const locations = [
  path.resolve("frontend/src/domains"),
  path.resolve("frontend/src/components/domains")
];

async function deepCleanup(dir: string) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await deepCleanup(fullPath);
      } else if (entry.name.endsWith("Form.tsx")) {
        // DELETE ALL FORMS - We will regenerate the correct ones next
        await fs.unlink(fullPath);
        console.log(`🗑️ Removed: ${entry.name}`);
      }
    }
  } catch (e) {
    // Directory might not exist, skip
  }
}

async function start() {
  console.log("🧼 Starting deep cleanup of ALL generated forms...");
  for (const loc of locations) {
    await deepCleanup(loc);
  }
  console.log("✨ Environment cleaned. You can now run your updated Generator safely.");
}

start();