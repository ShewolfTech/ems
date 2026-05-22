import fs from 'fs';
import path from 'path';

function printTree(dir: string, prefix = ''): void {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach((item: fs.Dirent, index: number) => {
    const fullPath = path.join(dir, item.name);

    // ⛔ Skip noisy or irrelevant items
    if (
      item.name === 'node_modules' ||
      item.name === '.git' ||
      item.name === '.temp' ||
      item.name === 'migrations' ||
      (!item.isDirectory() && item.name.endsWith('.sql.bak'))
    ) {
      return;
    }

    const isLast = index === items.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const newPrefix = prefix + (isLast ? '    ' : '│   ');

    console.log(prefix + connector + item.name);

    if (item.isDirectory()) {
      printTree(fullPath, newPrefix);
    }
  });
}

// ✅ Accept path from CLI argument
const inputPath = process.argv[2];
const rootDir: string = inputPath ? path.resolve(inputPath) : process.cwd();

// 🛡️ Safety check
if (!fs.existsSync(rootDir)) {
  console.error(`❌ Folder not found: ${rootDir}`);
  process.exit(1);
}

console.log(`📁 Printing structure from: ${rootDir}\n`);
printTree(rootDir);

// how to run: ts-node backend/src/scripts/printTree.ts backend/src/domains/schools
