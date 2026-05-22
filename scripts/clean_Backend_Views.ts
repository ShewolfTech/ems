import { promises as fs } from "fs";
import path from "path";

async function clearStrayAcademics() {
  // Target the specific directory you listed
  const targetDir = path.resolve("C:/Bright/ems/backend/src/domains/academics");
  
  console.log(`🚀 Auditing: ${targetDir}`);

  try {
    const entries = await fs.readdir(targetDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.endsWith("_view")) {
        const fullPath = path.join(targetDir, entry.name);
        
        // Final safety check: Ensure we aren't deleting the legitimate 'views' folder itself
        if (entry.name !== "views") {
          await fs.rm(fullPath, { recursive: true, force: true });
          console.log(`🗑️  Deleted: ${entry.name}`);
        }
      }
    }
    
    // Also handle staffmgt if needed
    const staffDir = path.resolve("C:/Bright/ems/backend/src/domains/staffmgt");
    const staffEntries = await fs.readdir(staffDir, { withFileTypes: true }).catch(() => []);
    for (const entry of staffEntries) {
      if (entry.isDirectory() && entry.name.endsWith("_view")) {
        await fs.rm(path.join(staffDir, entry.name), { recursive: true, force: true });
        console.log(`🗑️  Deleted: ${entry.name} from staffmgt`);
      }
    }

  } catch (error: any) {
    console.error(`❌ Error during cleanup: ${error.message}`);
  }
}

console.log("\n🧹 Running forced cleanup of misplaced view folders...");
clearStrayAcademics().then(() => console.log("✨ Done. Academics domain is clean."));