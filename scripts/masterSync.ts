// 📁 scripts/masterSync.ts
import { execSync } from "child_process";
import chokidar from "chokidar";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool: any; // will hold DB pool reference
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
  runScript("./arrangeMigrations.ts", dryRun);
  runScript("./runMigrations.ts", dryRun);
  runScript("./syncRegistriesFromDB.ts", dryRun);
  runScript("./fixBarrelExtensions.ts", dryRun);
  runScript("./scaffoldDomainsFromPermissions.ts", dryRun);
  runScript("./syncDb.ts", dryRun); 
  runScript("./updateDomainPermissions.ts", dryRun);
}

// --- CLI entry ---
const args = process.argv.slice(2);
const watchMode = args.includes("--watch");
const dryRun = args.includes("--dry-run");

console.log("🚀 Master Sync starting...");
if (dryRun) {
  console.log("📝 Dry-run mode enabled. No files will be overwritten.");
}

syncAll(dryRun);

// --- Debounced re-sync ---
function triggerSync(reason: string) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`📡 Triggered by ${reason}, running sync...`);
    syncAll(dryRun);
  }, 1500); // wait 1.5s to avoid overlapping runs
}

// --- Watch for file changes ---
if (watchMode) {
  console.log("👀 Watch mode enabled. Listening for schema/migration/script changes...");
  const watcher = chokidar.watch([
    path.resolve(__dirname, "./*.ts"), // watch all scripts
    path.resolve(__dirname, "../backend/src/db/kysely.generated.ts"),
    path.resolve(__dirname, "../backend/migrations/**/*.ts"),
  ]);

  watcher.on("change", (changedPath) => {
    triggerSync(`file change: ${changedPath}`);
  });
}

// --- Listen for DB changes ---
async function listenForDbChanges() {
  try {
    const dbPath = path.resolve(__dirname, "../backend/src/config/infra/database.ts");
    const dbModule = await import(pathToFileURL(dbPath).href);
    pool = dbModule.pool;

    pool.on("notification", (msg: any) => {
      if (msg.channel === "permissions_changed") {
        triggerSync("DB notification (permissions_changed)");
      }
    });

    await pool.query("LISTEN permissions_changed");
    console.log("🔔 Listening for DB notifications on channel 'permissions_changed'");
  } catch (err) {
    console.error("❌ Failed to set up DB listener:", err);
  }
}

listenForDbChanges();

// --- Graceful shutdown ---
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down masterSync...");
  if (pool) {
    await pool.end();
    console.log("🔌 Closed DB pool.");
  }
  process.exit(0);
});


/*
▶️ Usage
Normal run (updates files):

powershell
pnpm ts-node-esm scripts/masterSync.ts
Dry-run (preview only, no writes):

powershell
pnpm ts-node-esm scripts/masterSync.ts --dry-run
Watch mode (auto‑rerun on file/schema changes):

powershell
pnpm ts-node-esm scripts/masterSync.ts --watch
Watch + dry-run (simulate only):

powershell
pnpm ts-node-esm scripts/masterSync.ts --watch --dry-run

*/