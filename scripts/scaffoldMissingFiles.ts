import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target all domain roots
const domainRoots = [
  path.resolve(__dirname, "../frontend/src/domains"),
  path.resolve(__dirname, "../backend/src/domains")
];

// The standard sub-folders your barrels usually reference
const standardFolders = [
  "components", "pages", "hooks", "services", 
  "context", "config", "registry", "schema", "mock", "types"
];

function scaffoldDomain(domainPath: string) {
  standardFolders.forEach(folder => {
    const folderPath = path.join(domainPath, folder);
    const indexPath = path.join(folderPath, "index.ts");

    // 1. Create the directory if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`📁 Created folder: ${folderPath}`);
    }

    // 2. Create a stub index.ts if it doesn't exist
    if (!fs.existsSync(indexPath)) {
      // Basic stub content to satisfy TypeScript
      fs.writeFileSync(indexPath, "export {};\n", "utf-8");
      console.log(`📄 Created stub: ${indexPath}`);
    }
  });
}

function main() {
  console.log("🚀 Starting Global Scaffolding...");

  domainRoots.forEach(root => {
    if (!fs.existsSync(root)) return;

    // Get all subdirectories (e.g., auth, academics, users)
    const domains = fs.readdirSync(root, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    domains.forEach(domain => {
      const fullPath = path.join(root, domain);
      
      // If it's a nested structure like academics/academic_year, handle it
      const subDomains = fs.readdirSync(fullPath, { withFileTypes: true })
        .filter(d => d.isDirectory() && !standardFolders.includes(d.name));

      if (subDomains.length > 0) {
        subDomains.forEach(sd => scaffoldDomain(path.join(fullPath, sd.name)));
      } else {
        scaffoldDomain(fullPath);
      }
    });
  });

  console.log("✅ Scaffolding complete. All TS2307 errors should be resolved.");
}

main();

// To run this script, use: `ts-node scripts/scaffoldMissingFiles.ts`