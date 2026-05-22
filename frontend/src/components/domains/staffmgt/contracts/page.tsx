import React from "react";
import { ModuleOverviewPage } from "@/components/domains/staffmgt/common/ModuleOverviewPage.js";
import { getContractsList } from "@/domains/staffmgt/contracts/services.js";

export default function ContractsPage() {
  return (
    <ModuleOverviewPage
      title="Contracts"
      description="Explore active staff contracts, renewal windows, agreement types and status overview in one teal-branded dashboard."
      fetcher={getContractsList}
      badgeKey="status"
      highlightKey="expiry_date"
    />
  );
}
