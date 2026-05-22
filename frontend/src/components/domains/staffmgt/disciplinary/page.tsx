import React from "react";
import { ModuleOverviewPage } from "@/components/domains/staffmgt/common/ModuleOverviewPage.js";
import { getDisciplinaryList } from "@/domains/staffmgt/disciplinary/services.js";

export default function DisciplinaryPage() {
  return (
    <ModuleOverviewPage
      title="Disciplinary"
      description="Track incident reports, warnings and compliance cases with trusted cyan-branded clarity."
      fetcher={getDisciplinaryList}
      badgeKey="status"
      highlightKey="case_number"
    />
  );
}
