import React from "react";
import { ModuleOverviewPage } from "@/components/domains/staffmgt/common/ModuleOverviewPage.js";
import { getStaffAttendanceList } from "@/domains/staffmgt/staff_attendance/services.js";

export default function StaffAttendancePage() {
  return (
    <ModuleOverviewPage
      title="Staff Attendance"
      description="Review daily clock-ins, shift presence and attendance indicators in a high-contrast teal dashboard."
      fetcher={getStaffAttendanceList}
      badgeKey="status"
      highlightKey="clock_in_time"
    />
  );
}
