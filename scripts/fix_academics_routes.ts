import { db } from "../backend/src/config/infra/database.js";

// Fix display names
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

// Fix view routes from old pattern to new
const routeFixes: { old: string; new: string }[] = [
  { old: '/academics/academics_assignment_submissions_view', new: '/academics/views/assignment_submissions' },
  { old: '/academics/academics_classperformance_summary_view', new: '/academics/views/class_performance' },
  { old: '/academics/academics_classschedule_view', new: '/academics/views/class_schedule' },
  { old: '/academics/academics_exams_performance_summary_view', new: '/academics/views/exams_performance_summary' },
  { old: '/academics/academics_exams_performance_view', new: '/academics/views/exams_performance' },
  { old: '/academics/academics_studentsgrades_view', new: '/academics/views/student_grades' },
  { old: '/academics/academics_studentterm_performance_view', new: '/academics/views/term_performance' },
  { old: '/academics/academics_subjectperformance_summary_view', new: '/academics/views/subject_performance' },
];

(async function() {
  console.log('=== Updating display names ===');
  for (const [oldName, newName] of Object.entries(renames)) {
    const result = await (db as any)
      .updateTable('route_permissions')
      .set({ display_name: newName })
      .where('display_name', '=', oldName)
      .execute();
    console.log(`"${oldName}" -> "${newName}": ${result.length} rows`);
  }

  console.log('\n=== Updating route paths ===');
  for (const { old: oldRoute, new: newRoute } of routeFixes) {
    const result = await (db as any)
      .updateTable('route_permissions')
      .set({ route: newRoute })
      .where('route', '=', oldRoute)
      .execute();
    console.log(`"${oldRoute}" -> "${newRoute}": ${result.length} rows`);
  }

  console.log('\nDone! Restart backend and refresh.');
  process.exit(0);
})();
