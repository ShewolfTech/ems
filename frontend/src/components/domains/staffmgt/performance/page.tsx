import React from "react";
import { ModuleOverviewPage } from "@/components/domains/staffmgt/common/ModuleOverviewPage.js";
import { getPerformanceList } from "@/domains/staffmgt/performance/services.js";

export default function PerformancePage() {
  return (
    <ModuleOverviewPage
      title="Performance"
      description="Monitor staff ratings, review cycles, and coaching opportunities with intuitive metrics and quick search."
      fetcher={getPerformanceList}
      badgeKey="status"
      highlightKey="review_date"
    />
  );
}
