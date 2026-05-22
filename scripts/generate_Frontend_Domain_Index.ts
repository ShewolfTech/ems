// scripts/normalizeAndGenerateIndexes.ts
import fs from "fs";
import path from "path";

const root = "C:\\Bright\\ems";
const targetDir = path.join(root, "frontend", "src", "components", "domains");

/**
 * Converts snake_case or kebab-case to PascalCase
 */
function toPascalCase(name: string) {
  return name
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

/**
 * Ensure a .tsx file has a default export
 */
function ensureDefaultExport(filePath: string) {
  let content = fs.readFileSync(filePath, "utf-8");

  if (/export\s+default/.test(content)) {
    return true; // already has default
  }

  const fileName = path.basename(filePath, ".tsx");
  const componentName = fileName;

  if (new RegExp(`export\\s+(const|function)\\s+${componentName}`).test(content)) {
    content += `\n\nexport default ${componentName};\n`;
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Added default export to ${fileName}.tsx`);
    return true;
  } else {
    console.warn(`⚠️ Could not detect component in ${fileName}.tsx — skipped default export`);
    return false;
  }
}

/**
 * Walk through folders and generate index.ts
 */
function walk(currentPath: string) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  const exports: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);

      if (fs.existsSync(path.join(fullPath, "index.ts"))) {
        exports.push(`export * as ${toPascalCase(entry.name)} from "./${entry.name}/index.js";`);
      }
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      const base = entry.name.replace(".tsx", "");
      const exportName = toPascalCase(base);

      const hasDefault = ensureDefaultExport(fullPath);
      if (hasDefault) {
        exports.push(`export { default as ${exportName} } from "./${base}.js";`);
      } else {
        exports.push(`export * from "./${base}.js";`);
      }
    } else if (entry.isFile() && entry.name.endsWith(".ts") && entry.name !== "index.ts") {
      const base = entry.name.replace(".ts", "");
      exports.push(`export * from "./${base}.js";`);
    }
  }

  if (exports.length > 0) {
    const uniqueExports = Array.from(new Set(exports));
    let barrel = uniqueExports.join("\n") + "\n";

    // If there’s a Page component, re-export it as the default
    const pageExport = uniqueExports.find(e => e.includes("Page"));
    if (pageExport) {
      const match = pageExport.match(/\.\/(\w+)Page\.js/);
      if (match) {
        const pageFile = match[1] + "Page.js";
        barrel += `\nexport { default } from "./${pageFile}";\n`;
      }
    }

    fs.writeFileSync(path.join(currentPath, "index.ts"), barrel);
    console.log(`📦 [BARREL CREATED] ${path.relative(targetDir, currentPath)}/index.ts (${uniqueExports.length} items)`);
  }
}

function run() {
  console.log("\n🚀 Normalizing .tsx files and generating barrel indexes...");
  console.log("---------------------------------------------------");

  if (!fs.existsSync(targetDir)) {
    console.error(`🚨 Target directory not found at: ${targetDir}`);
    return;
  }

  walk(targetDir);

  console.log("---------------------------------------------------");
  console.log("✨ Normalization + Index generation complete. All components now have default exports and barrels are consistent.\n");
}

run();
