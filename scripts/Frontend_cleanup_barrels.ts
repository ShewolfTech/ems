import fs from "fs";
import path from "path";

const root = "C:\\Bright\\ems";
const targetDir = path.join(root, "frontend", "src", "domains");

/**
 * Recursively search and destroy barrel.ts files
 */
function deleteBarrels(currentPath: string) {
    if (!fs.existsSync(currentPath)) return;

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
            // Recurse into subdirectories
            deleteBarrels(fullPath);
        } else if (entry.isFile() && entry.name === "barrel.ts") {
            // Found a target
            try {
                fs.unlinkSync(fullPath);
                console.log(`  🗑️  Deleted: ${path.relative(root, fullPath)}`);
            } catch (err) {
                console.error(`  ❌ Failed to delete ${fullPath}:`, err);
            }
        }
    }
}

function run() {
    console.log("\n🧹 [EMS 2026] Cleaning up legacy barrel files...");
    console.log("---------------------------------------------------");
    
    deleteBarrels(targetDir);
    
    console.log("---------------------------------------------------");
    console.log("✅ Cleanup complete. Ready for the new indexing system.\n");
}

run();