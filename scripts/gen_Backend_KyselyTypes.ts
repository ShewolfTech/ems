import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const outFile = path.resolve(__dirname, "../shared/src/db/kysely.generated.ts");
const insertFile = path.resolve(__dirname, "../shared/src/db/insert.ts");

/**
 * Ensures we don't get "Double S" by stripping existing pluralization
 * before we apply our own naming conventions.
 */
function getCleanBaseName(name: string): string {
  return name.replace(/s$/, ""); 
}

function capitalize(name: string) {
  const clean = getCleanBaseName(name);
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function patchDBKeysToLowercase() {
  const content = fs.readFileSync(outFile, "utf-8");
  const patched = content.replace(/export interface DB\s*{([\s\S]*?)}/, (_, block) => {
    const lines = block
      .split("\n")
      .map((line: string) => {
        const match = line.match(/^\s*("?\w+"?): (\w+);/);
        if (!match) return line;
        const key = match[1].replace(/"/g, "");
        const type = match[2];
        const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
        return `  ${lowerKey}: ${type};`;
      })
      .join("\n");
    return `export interface DB {\n${lines}\n}`;
  });

  fs.writeFileSync(outFile, patched, "utf-8");
  console.log("🔧 DB keys patched to lowercase for Kysely compatibility");
}

function generateInsertTypes() {
  const fileContent = fs.readFileSync(outFile, "utf-8");
  const match = fileContent.match(/export interface DB \{([\s\S]*?)\}/);
  if (!match || !match[1]) return;

  const tableBlock = match[1];
  const tableNames = Array.from(tableBlock.matchAll(/^\s*(\w+):/gm)).map(m => m[1]);

  const banner = `/**
 * 🧬 AUTO-GENERATED INSERT TYPES
 * Do not edit manually. Regenerate via scripts/generateKyselyTypes.ts
 */\n`;

  const header = `import type { DB as KyselyDatabase } from "./kysely.generated.js";\nimport type { KyselyTable } from "./database.ts";\n\n`;
  
  const body = tableNames
    .map(name => {
      const pascal = capitalize(name);
      // Generates "Departments" and "InsertDepartment" (No double S!)
      return `export type ${pascal}s = KyselyDatabase['${name}'];\nexport type Insert${pascal} = KyselyTable<${pascal}s>;`;
    })
    .join("\n");

  fs.writeFileSync(insertFile, `${banner}${header}${body}\n`);
  console.log(`✅ insert.ts created with ${tableNames.length} insertable types`);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL not found in backend/.env");
  process.exit(1);
}

// 🚩 REMOVED --filter flag to fix RangeError
const command = `pnpm exec kysely-codegen --dialect postgres --out-file "${outFile}" --camel-case`;

const proc = spawn(command, {
  env: { ...process.env, DATABASE_URL: connectionString },
  shell: true,
  stdio: "inherit",
});

proc.on("exit", code => {
  if (code === 0) {
    console.log(`✅ kysely.generated.ts created`);
    patchDBKeysToLowercase();
    generateInsertTypes();
  } else {
    console.error(`❌ kysely-codegen failed with exit code ${code}`);
  }
});