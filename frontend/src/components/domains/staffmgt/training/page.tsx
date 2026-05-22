import React from "react";
import { ModuleOverviewPage } from "@/components/domains/staffmgt/common/ModuleOverviewPage.js";
import { getTrainingList } from "@/domains/staffmgt/training/services.js";

export default function TrainingPage() {
  return (
    <ModuleOverviewPage
      title="Training"
      description="Visualize active learning paths, certifications and progress for staff development."
      fetcher={getTrainingList}
      badgeKey="status"
      highlightKey="course_name"
    />
  );
}
