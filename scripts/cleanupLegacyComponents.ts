import fs from "fs";
import path from "path";

const targetDir = "C:\\Bright\\ems\\frontend\\src\\components\\domains";

function cleanup(currentPath: string) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    
    if (entry.isDirectory()) {
      cleanup(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      const folderName = path.basename(currentPath);
      const fileName = entry.name.replace(".tsx", "");
      
      // If we have a file named "AcademicYears.tsx" inside a folder "academic_years"
      // and we ALSO have "AcademicYearsPage.tsx", the former is likely legacy.
      const pascalFolder = folderName.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
      
      if (fileName === pascalFolder && fs.existsSync(path.join(currentPath, `${fileName}Page.tsx`))) {
        console.log(`🗑️ Removing legacy component: ${entry.name}`);
        fs.unlinkSync(fullPath);
      }
    }
  }
}

cleanup(targetDir);