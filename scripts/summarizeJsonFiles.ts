import fs from "fs";
import path from "path";

const workspaces = ["backend", "frontend", "scripts", "shared", "combined"];
const baseDir = "C:/Bright/ems";
const outputFile = path.join(baseDir, "combined", "all-json-summaries.txt");

function summarizeJsonFile(fullPath: string, workspace: string): string {
  try {
    const raw = fs.readFileSync(fullPath, "utf-8");
    const parsed = JSON.parse(raw);
    const keys = Object.keys(parsed);
    return `\n=== ${workspace} :: ${fullPath} ===\nTop-level keys: ${keys.join(", ")}\n`;
  } catch (err) {
    return `\nError reading ${fullPath}: ${err}\n`;
  }
}

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
        result += summarizeJsonFile(fullPath, workspace);
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
  console.log(`Summaries saved to ${outputFile}`);
}

main();


// usage: ts-node scripts/summarizeJsonFiles.ts