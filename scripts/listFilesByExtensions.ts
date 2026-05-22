import fs from "fs";
import path from "path";

const workspaces = ["backend", "frontend", "scripts", "shared", "combined"];
const baseDir = "C:/Bright/ems";
const outputFile = path.join(baseDir, "combined", "listed_Files_By_Extensions.ts");

function listJsonFiles(workspace: string): string {
  const dirPath = path.join(baseDir, workspace);
  let result = "";

  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          result += `\n=== ${workspace} :: ${fullPath} ===\n${content}\n`;
        } catch (err) {
          result += `\nError reading ${fullPath}: ${err}\n`;
        }
      }
    }
  }

  if (fs.existsSync(dirPath)) {
    walk(dirPath);
  } else {
    result += `\nWorkspace folder not found: ${dirPath}\n`;
  }

  return result;
}

function main() {
  let allOutput = "";
  for (const ws of workspaces) {
    allOutput += listJsonFiles(ws);
  }

  // Ensure combined folder exists
  const combinedDir = path.join(baseDir, "combined");
  if (!fs.existsSync(combinedDir)) {
    fs.mkdirSync(combinedDir);
  }

  fs.writeFileSync(outputFile, allOutput, "utf-8");
  console.log(`Output saved to ${outputFile}`);
}

main();
