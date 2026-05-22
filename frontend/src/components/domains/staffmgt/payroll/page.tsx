import React from "react";
import { ModuleOverviewPage } from "@/components/domains/staffmgt/common/ModuleOverviewPage.js";
import { getPayrollList } from "@/domains/staffmgt/payroll/services.js";

export default function PayrollPage() {
  return (
    <ModuleOverviewPage
      title="Payroll"
      description="Track payroll entries, compensation summaries and pay cycle health with sleek cyan-style dashboards."
      fetcher={getPayrollList}
      badgeKey="status"
      highlightKey="pay_date"
    />
  );
}
