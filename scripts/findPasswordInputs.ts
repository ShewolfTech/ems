// scripts/findPasswordInputs.ts
import fs from "fs";
import path from "path";

const root = "C:\\Bright\\ems";
const targetDir = path.join(root, "frontend", "src", "domains");

/**
 * Recursively walk through folders and search for password inputs
 */
function walk(currentPath: string) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, idx) => {
        if (line.includes('type="password"')) {
          console.log(`🔎 Found in ${fullPath} (line ${idx + 1}):`);
          console.log("    " + line.trim());
        }
      });
    }
  }
}

function run() {
  console.log("\n🚀 Scanning for password inputs...");
  console.log("---------------------------------------------------");

  if (!fs.existsSync(targetDir)) {
    console.error(`🚨 Target directory not found at: ${targetDir}`);
    return;
  }

  walk(targetDir);

  console.log("---------------------------------------------------");
  console.log("✨ Scan complete.\n");
}

run();
