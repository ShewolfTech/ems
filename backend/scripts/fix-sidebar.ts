import { db } from "../src/config/infra/database.js";
import { sql } from "kysely";

(async function () {
  console.log("🔧 Fixing academics sidebar labels in database...\n");

  const updates: [string, string][] = [
    ["AcademicYears", "Academic Years"],
    ["GradeLevels", "Grade Levels"],
    ["ExamResults", "Exam Results"],
    ["ReportCards", "Report Cards"],
    ["AcademicsSubjectperformanceSummaryView", "Subject Performance"],
    ["AcademicsStudenttermPerformanceView", "Term Performance"],
    ["AcademicsClassscheduleView", "Class Schedule"],
    ["AcademicsStudentsgradesView", "Student Grades"],
    ["AcademicsClassperformanceSummaryView", "Class Performance"],
    ["AcademicsAssignmentSubmissionsView", "Assignment Submissions"],
    ["AcademicsExamsPerformanceSummaryView", "Exams Performance Summary"],
    ["AcademicsExamsPerformanceView", "Exams Performance"],
  ];

  const routeUpdates: [string, string][] = [
    ["/academics/academics_assignment_submissions_view", "/academics/views/assignment_submissions"],
    ["/academics/academics_classperformance_summary_view", "/academics/views/class_performance"],
    ["/academics/academics_classschedule_view", "/academics/views/class_schedule"],
    ["/academics/academics_exams_performance_summary_view", "/academics/views/exams_performance_summary"],
    ["/academics/academics_exams_performance_view", "/academics/views/exams_performance"],
    ["/academics/academics_studentsgrades_view", "/academics/views/student_grades"],
    ["/academics/academics_studentterm_performance_view", "/academics/views/term_performance"],
    ["/academics/academics_subjectperformance_summary_view", "/academics/views/subject_performance"],
  ];

  console.log("=== Updating display names ===");
  for (const [oldName, newName] of updates) {
    const result = await sql`
      UPDATE route_permissions SET display_name = ${newName} WHERE display_name = ${oldName}
    `.execute(db);
    console.log(`  "${oldName}" → "${newName}": ${result.numChangedRows ?? 0} row(s)`);
  }

  console.log("\n=== Updating route paths ===");
  for (const [oldRoute, newRoute] of routeUpdates) {
    const result = await sql`
      UPDATE route_permissions SET route = ${newRoute} WHERE route = ${oldRoute}
    `.execute(db);
    console.log(`  "${oldRoute}" → "${newRoute}": ${result.numChangedRows ?? 0} row(s)`);
  }

  console.log("\n✅ Done! Log out and log back in to see changes.");
  process.exit(0);
})();
