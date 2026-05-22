import { execSync } from "child_process";
import chokidar from "chokidar";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let debounceTimer: NodeJS.Timeout | null = null;

function runScript(script: string, dryRun: boolean) {
  console.log(`🔄 Running ${script}...`);
  const cmd = `ts-node-esm ${path.resolve(__dirname, script)}${dryRun ? " --dry-run" : ""}`;
  execSync(cmd, { stdio: "inherit" });
  console.log(`✅ Finished ${script}`);
}

function syncAll(dryRun: boolean) {
  // ⚠️  SKIPPING auto-generation for custom domain: enquiries
  // These have custom implementations that should not be auto-generated
  console.log("⏭️  Skipping auto-generation for custom domain: enquiries (and related)");
  console.log("   Custom files preserved:");
  console.log("   - frontend/src/components/domains/admissions/enquiries/");
  console.log("   - frontend/src/domains/admissions/enquiries/");

  const scripts = [
    // ❌  THESE WILL OVERWRITE CUSTOM ENQUIRIES - KEEP COMMENTED:
    // "./scaffold_Frontend_Domains_From_Backend.ts",
    // "./generate_Frontend_Domain_Types.ts",
    // "./generate_Frontend_Domain_Validators.ts",
    // "./generate_Frontend_Domain_Errors.ts",
    // "./generate_Frontend_Stack.ts",
    // "./generate_Frontend_Components_For_Domains.ts",

    // ✅ Safe to run - these update other domains or global files:
    "./generate_Frontend_ui.ts",
    "./generate_Frontend_ui_attendance.ts",
    "./generate_Frontend_ComponentsDomains_Stubs_Index.ts",  // This now skips enquiries folder
    "./generate_Frontend_Domain_Index.ts",
    "./generate_Frontend_Router.ts",
    "./fix_backend_Frontend_ImportExtensions.ts",

    // Optional (commented out by default):
    //"./generate_Frontend_Domain_Services.ts",
    //"./generate_Frontend_Domain_Controllers.ts",
    //"./generate_Frontend_Domain_Hooks.ts",
    //"./generate_Frontend_ui_attendance.ts",
    // "./migrate_Users_To_Supabase_Auth.ts",
  ];

  try {
    for (const script of scripts) {
      runScript(script, dryRun);
    }
  } catch (err) {
    console.error("❌ Aborted due to failure:", err);
    process.exit(1);
  }
}

// --- CLI entry ---
const args = process.argv.slice(2);
const watchMode = args.includes("--watch");
const dryRun = args.includes("--dry-run");

console.log("🚀 Frontend Generator starting...");
if (dryRun) {
  console.log("📝 Dry-run mode enabled. No files will be overwritten.");
}

syncAll(dryRun);

// --- Debounced re-sync ---
function triggerSync(reason: string) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`📡 Triggered by ${reason}, running frontend generation...`);
    try {
      syncAll(dryRun);
    } catch (err) {
      console.error("❌ Watch mode aborted due to failure:", err);
      process.exit(1);
    }
  }, 1500);
}

// --- Watch for file changes ---
if (watchMode) {
  console.log("👀 Watch mode enabled. Listening for frontend generator changes...");
  const watcher = chokidar.watch([
    path.resolve(__dirname, "./generateFrontend*.ts"),
    path.resolve(__dirname, "../backend/src/db/kysely.generated.ts"),
  ]);

  watcher.on("change", (changedPath) => {
    triggerSync(`file change: ${changedPath}`);
  });
}

// --- Graceful shutdown ---
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down generateFrontendAll...");
  process.exit(0);
});

/*
▶️ Usage
Normal run (updates files):

pnpm ts-node-esm scripts/runFrontendAll.ts

Dry-run (preview only, no writes):

pnpm ts-node-esm scripts/runFrontendAll.ts --dry-run

Watch mode (auto‑rerun on file/schema changes):

pnpm ts-node-esm scripts/runFrontendAll.ts --watch

Watch + dry-run (simulate only):

pnpm ts-node-esm scripts/runFrontendAll.ts --watch --dry-run

⚠️  NOTE: Custom domains (enquiries) are excluded from auto-generation.
To regenerate ALL domains including enquiries, uncomment the scaffold scripts above.
*/
