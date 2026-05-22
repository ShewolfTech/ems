import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");

// ✅ Define the files or directories you want to combine (relative to project root)
const selectedPaths = [
    "frontend/src/components/domains/aacommon/",
  // "backend/src/domains/auth/",
  // "frontend/src/domains/auth/"
 
  // "frontend/src/domains/permissions/",

 "backend/src/domains/auth/enrichUserMetadata.ts",
  "frontend/src/app/providers/AuthContext.tsx",
  "frontend/src/domains/studentsmgt/enrollments/",
  "backend/src/domains/studentsmgt/enrollments/",
  "frontend/src/components/domains/studentsmgt/enrollments/",
  "backend/src/domains/metadata.types.index.ts",

   // You can still list individual files here if needed
];

// ✅ Output location
const outputDir = path.resolve(__dirname, "../combined");
const outputFile = path.join(outputDir, "combined.selectedFiles.ts");

// Recursively collect all files in a directory
function collectFilesRecursively(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFilesRecursively(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function combineSelectedFiles() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output: string[] = [];

  for (const relativePath of selectedPaths) {
    const fullPath = path.resolve(projectRoot, relativePath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Path not found: ${relativePath}`);
      continue;
    }

    const stats = fs.statSync(fullPath);

    let filesToCombine: string[] = [];
    if (stats.isDirectory()) {
      filesToCombine = collectFilesRecursively(fullPath);
    } else if (stats.isFile()) {
      filesToCombine = [fullPath];
    }

    for (const filePath of filesToCombine) {
      const content = fs.readFileSync(filePath, "utf-8");
      const relativeFilePath = path.relative(projectRoot, filePath);
      output.push(
        `\n\n// ===== ${relativeFilePath} =====\n// 📁 Full path: ${filePath}\n\n${content.trim()}\n`
      );
    }
  }

  fs.writeFileSync(outputFile, output.join("\n\n"), "utf-8");
  console.log(`✅ Combined output written to: ${outputFile}`);
}

combineSelectedFiles();
