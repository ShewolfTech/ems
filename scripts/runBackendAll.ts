// scripts/runBackendAll.ts
import { execSync } from "child_process";
import chokidar from "chokidar";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let debounceTimer: NodeJS.Timeout | null = null;

function runScript(script: string, dryRun: boolean) {
  console.log(`🔄 Running ${script}...`);
  try {
    const cmd = `ts-node-esm ${path.resolve(__dirname, script)}${dryRun ? " --dry-run" : ""}`;
    execSync(cmd, { stdio: "inherit" });
    console.log(`✅ Finished ${script}`);
  } catch (err) {
    console.error(`❌ Failed ${script}:`, err);
  }
}

function syncAll(dryRun: boolean) {
  // === PHASE 1: Database Sync ===
  runScript("./runMigrations.ts", dryRun);
  runScript("./gen_Backend_KyselyTypes.ts", dryRun);
  runScript("./sync_Backend_Db.ts", dryRun);
  runScript("./sync_Backend_Registries_From_DB.ts", dryRun);
  runScript("./genPermissionsDomain.ts", dryRun);
  runScript("./genPermissionMap.ts", dryRun);
  //runScript("./scaffold_Backend_Domains_From_route_permissions.ts", dryRun);

  // === PHASE 2: Domain Code Generation ===
  // ⚠️  SKIPPING custom domains: enquiries, enquiryTypes, enquirySources, enquiryNotes, enquiryAttachments
  // These have custom implementations that should not be auto-generated
  console.log("⏭️  Skipping auto-generation for custom domain: enquiries (and related)");
  
  // Uncomment these ONLY if you want to regenerate ALL domains (will overwrite custom enquiries):
  // runScript("./gen_Backend_Domain_Types.ts", dryRun);
  // runScript("./gen_Backend_Domain_Validators.ts", dryRun);
  // runScript("./gen_Backend_Domain_Services.ts", dryRun);
  // runScript("./gen_Backend_Domain_Controllers.ts", dryRun);
  // runScript("./gen_Backend_Domain_Routes.ts", dryRun);
  // runScript("./gen_Backend_Domain_Errors.ts", dryRun);
  // runScript("./clean_Backend_Subdomains_Without_Types.ts", dryRun);

  // === PHASE 3: Registry & Index Updates ===
  // ✅ These are safe - they update barrel files and registry without overwriting domain logic
  runScript("./gen_Backend_Domain_Index.ts", dryRun);
  runScript("./gen_Backend_Domains_Registry.ts", dryRun);

  // === PHASE 4: Frontend Compatibility ===
  runScript("./fix_backend_Frontend_ImportExtensions.ts", dryRun);
  
  // runScript("./migrateUsers.ts", dryRun);
  // add more backend generators here
}

// --- CLI entry ---
const args = process.argv.slice(2);
const watchMode = args.includes("--watch");
const dryRun = args.includes("--dry-run");

console.log("🚀 Backend Generator starting...");
if (dryRun) {
  console.log("📝 Dry-run mode enabled. No files will be overwritten.");
}

syncAll(dryRun);

// --- Debounced re-sync ---
function triggerSync(reason: string) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`📡 Triggered by ${reason}, running backend generation...`);
    syncAll(dryRun);
  }, 1500);
}

// --- Watch for file changes ---
if (watchMode) {
  console.log("👀 Watch mode enabled. Listening for backend generator changes...");
  const watcher = chokidar.watch([
    path.resolve(__dirname, "./generateBackend*.ts"),
    path.resolve(__dirname, "../shared/src/db/kysely.generated.ts"),
  ]);

  watcher.on("change", (changedPath) => {
    triggerSync(`file change: ${changedPath}`);
  });
}

// --- Graceful shutdown ---
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down runBackendAll...");
  process.exit(0);
});
