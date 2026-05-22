import React from "react";
import { ModuleOverviewPage } from "@/components/domains/staffmgt/common/ModuleOverviewPage.js";
import { getIdAccessList } from "@/domains/staffmgt/id_access/services.js";

export default function IdAccessPage() {
  return (
    <ModuleOverviewPage
      title="ID Access"
      description="Manage staff badge provisioning, access levels, and secure entry records in a polished teal experience."
      fetcher={getIdAccessList}
      badgeKey="access_level"
      highlightKey="badge_number"
    />
  );
}
