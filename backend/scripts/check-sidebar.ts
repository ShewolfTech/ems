import { db, sql } from "../src/config/infra/database.js";

(async function () {
  console.log("=== Current route_permissions for academics ===\n");

  const rows = await (db as any)
    .selectFrom("route_permissions")
    .select(["display_name", "route", "resource", "is_menu_item", "display_order"])
    .where("module", "=", "academics")
    .orderBy("display_order", "asc")
    .execute();

  for (const r of rows) {
    const mi = String(r.is_menu_item) === "true" || String(r.is_menu_item) === "1" ? "✓" : "✗";
    console.log(`  ${mi} │ order:${String(r.display_order || "?").padStart(3)} │ ${String(r.display_name).padEnd(40)} │ ${r.route}`);
  }

  console.log(`\nTotal: ${rows.length} rows`);
  process.exit(0);
})();
