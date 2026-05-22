import * as fs from "fs";
import * as path from "path";

/**
 * This script reads a large SQL file and splits it into modular sections:
 * - functions.sql
 * - tables.sql
 * - triggers.sql
 * - views.sql
 * - seed.sql
 *
 * It looks for markers like "-- ============================================" and keywords.
 */

const inputFile = path.join(__dirname, "master.sql"); // your big file
const outputDir = path.join(__dirname, "migrations");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Buckets for content
let functions: string[] = [];
let tables: string[] = [];
let triggers: string[] = [];
let views: string[] = [];
let seed: string[] = [];

// Read file
const content = fs.readFileSync(inputFile, "utf-8");
const lines = content.split(/\r?\n/);

let currentSection: "functions" | "tables" | "triggers" | "views" | "seed" | null = null;

for (const line of lines) {
  const lower = line.toLowerCase();

  // Detect section markers
  if (lower.includes("create function") || lower.includes("or replace function")) {
    currentSection = "functions";
  } else if (lower.includes("create table")) {
    currentSection = "tables";
  } else if (lower.includes("create trigger") || lower.includes("drop trigger")) {
    currentSection = "triggers";
  } else if (lower.includes("create view") || lower.includes("drop view")) {
    currentSection = "views";
  } else if (lower.includes("insert into")) {
    currentSection = "seed";
  }

  // Push line into the right bucket
  switch (currentSection) {
    case "functions":
      functions.push(line);
      break;
    case "tables":
      tables.push(line);
      break;
    case "triggers":
      triggers.push(line);
      break;
    case "views":
      views.push(line);
      break;
    case "seed":
      seed.push(line);
      break;
    default:
      // If no section detected, assume it's general (tables)
      tables.push(line);
      break;
  }
}

// Write out files
fs.writeFileSync(path.join(outputDir, "functions.sql"), functions.join("\n"));
fs.writeFileSync(path.join(outputDir, "tables.sql"), tables.join("\n"));
fs.writeFileSync(path.join(outputDir, "triggers.sql"), triggers.join("\n"));
fs.writeFileSync(path.join(outputDir, "views.sql"), views.join("\n"));
fs.writeFileSync(path.join(outputDir, "seed.sql"), seed.join("\n"));

console.log("✅ Migration files arranged into:", outputDir);
