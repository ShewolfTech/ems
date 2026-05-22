// scripts/cleanSubdomainsWithoutTypes.ts
import { promises as fs } from "fs";
import path from "path";

const domainsBase = path.resolve("backend/src/domains");

async function cleanDomain(domainPath: string, domainName: string) {
  const entries = await fs.readdir(domainPath, { withFileTypes: true });
  let hasTypes = false;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const subdomainPath = path.join(domainPath, entry.name);

    // Skip protected domains and views folders
    if (
      domainName.toLowerCase() === "auth" ||
      domainName.toLowerCase() === "permissions" ||
      entry.name.toLowerCase() === "views"
    ) {
      console.log(`⏭️ Skipped: ${subdomainPath}`);
      continue;
    }

    const typesFile = path.join(subdomainPath, "types.ts");

    try {
      await fs.access(typesFile);
      // ✅ types.ts exists → keep this subdomain
      hasTypes = true;
      console.log(`✔️ Kept subdomain: ${subdomainPath}`);
    } catch {
      // ❌ types.ts missing → drop this subdomain
      await fs.rm(subdomainPath, { recursive: true, force: true });
      console.log(`🗑️ Dropped subdomain: ${subdomainPath}`);
    }
  }

  // If no subdomains had types.ts, drop the entire domain (except protected ones)
  if (!hasTypes && domainName.toLowerCase() !== "auth" && domainName.toLowerCase() !== "permissions") {
    await fs.rm(domainPath, { recursive: true, force: true });
    console.log(`🗑️ Dropped entire domain: ${domainPath}`);
  }
}

async function run() {
  const domains = await fs.readdir(domainsBase, { withFileTypes: true });

  for (const domain of domains) {
    if (domain.isDirectory()) {
      const domainPath = path.join(domainsBase, domain.name);
      await cleanDomain(domainPath, domain.name);
    }
  }

  console.log("\n✨ Cleanup complete — only domains/subdomains with types.ts remain (auth & permissions untouched, views skipped).");
}

run().catch(console.error);
