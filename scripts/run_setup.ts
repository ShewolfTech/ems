import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSetup = () => {
  const scriptsDir = path.resolve(__dirname);
  const currentScriptName = path.basename(__filename);

  const allFiles = fs.readdirSync(scriptsDir);
  const setupScripts = allFiles
    .filter(file => 
      file.startsWith("setup_") && 
      file !== currentScriptName && 
      (file.endsWith(".ts") || file.endsWith(".js"))
    )
    .sort();

  console.log("--------------------------------------------------");
  console.log(`🚀 MASTER RUNNER: Starting ${setupScripts.length} scripts...`);
  console.log("--------------------------------------------------");

  setupScripts.forEach((file, index) => {
    try {
      console.log(`[${index + 1}/${setupScripts.length}] 🏃 Running: ${file}`);
      execSync(`npx ts-node-esm "${path.join(scriptsDir, file)}"`, { 
        stdio: "inherit",
        env: { ...process.env, MASTER_RUNNER_IN_PROGRESS: "true" }
      });
    } catch (error) {
      console.error(`❌ Error in ${file}. Stopping.`);
      process.exit(1);
    }
  });

  console.log("--------------------------------------------------");
  console.log("✅ ALL SYSTEMS GO: Setup finished.");
};

runSetup();