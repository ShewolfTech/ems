import { db } from "../backend/src/config/infra/database.js";

const renames: Record<string, string> = {
  'AcademicYears': 'Academic Years',
  'GradeLevels': 'Grade Levels',
  'ExamResults': 'Exam Results',
  'ReportCards': 'Report Cards',
  'AcademicsSubjectperformanceSummaryView': 'Subject Performance',
  'AcademicsStudenttermPerformanceView': 'Term Performance',
  'AcademicsClassscheduleView': 'Class Schedule',
  'AcademicsStudentsgradesView': 'Student Grades',
  'AcademicsClassperformanceSummaryView': 'Class Performance',
  'AcademicsAssignmentSubmissionsView': 'Assignment Submissions',
  'AcademicsExamsPerformanceSummaryView': 'Exams Performance Summary',
  'AcademicsExamsPerformanceView': 'Exams Performance',
};

(async function() {
  for (const [oldName, newName] of Object.entries(renames)) {
    const result = await (db as any)
      .updateTable('route_permissions')
      .set({ display_name: newName })
      .where('display_name', '=', oldName)
      .execute();
    console.log(`"${oldName}" -> "${newName}": ${result.length} rows updated`);
  }
  console.log('\nDone! Restart backend and refresh the page.');
  process.exit(0);
})();
