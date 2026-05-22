import React from "react";
import { ModuleOverviewPage } from "@/components/domains/staffmgt/common/ModuleOverviewPage.js";
import { getLeaveRequests } from "@/domains/staffmgt/leave_management/services.js";

export default function LeaveManagementPage() {
  return (
    <ModuleOverviewPage
      title="Leave Management"
      description="Stay ahead of staff leave requests, approval statuses, and quota balances in a fresh cyan experience."
      fetcher={getLeaveRequests}
      badgeKey="status"
      highlightKey="start_date"
    />
  );
}
