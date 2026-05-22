/**
 * Script to convert snake_case words in a specific migration file to camelCase
 * Usage: pnpm ts-node migrate_common_reference_tables_to_camel.ts
 */
import { promises as fs } from "fs";

const targetFile = "C:\\Bright\\ems\\migrations\\0001_aadvance_hr_for_academics.sql";

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

async function processFile(filePath: string) {
  let content = await fs.readFile(filePath, "utf-8");
  const originalContent = content;

  // Convert snake_case identifiers everywhere
  content = content.replace(/\b[a-z]+_[a-z0-9_]+\b/g, (match: string) => snakeToCamel(match));

  // Convert snake_case inside quoted strings (seed data, labels, etc.)
  content = content.replace(/'([^']*?)'/g, (match: string, inner: string) => {
    const converted = inner
      .split(" ")
      .map((word) => (word.includes("_") ? snakeToCamel(word) : word))
      .join(" ");
    return `'${converted}'`;
  });

  if (content !== originalContent) {
    await fs.writeFile(filePath, content, "utf-8");
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`ℹ️ No changes made: ${filePath}`);
  }
}

async function main() {
  try {
    console.log(`Processing file: ${targetFile}`);
    await processFile(targetFile);
    console.log("\n✨ Conversion complete!");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
