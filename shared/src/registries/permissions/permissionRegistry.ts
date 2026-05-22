export const permissionRegistry = {
  "academics": {
    "academic_setup": [
      "academic_setup.manage"
    ],
    "academic_years": [
      "academic_years.manage"
    ],
    "assessment_calendar": [
      "assessment_calendar.read"
    ],
    "assessment_results": [
      "assessment_results.create",
      "assessment_results.delete",
      "assessment_results.manage",
      "assessment_results.read",
      "assessment_results.update"
    ],
    "assessments": [
      "assessments.approve",
      "assessments.create",
      "assessments.delete",
      "assessments.export",
      "assessments.read",
      "assessments.update"
    ],
    "assessments_grading": [
      "assessments_grading.manage"
    ],
    "assignment_submissions": [
      "assignment_submissions.read"
    ],
    "assignments": [
      "assignments.create",
      "assignments.grade",
      "assignments.read",
      "assignments.submit"
    ],
    "class_schedule": [
      "class_schedule.read"
    ],
    "classes": [
      "classes.assign_student",
      "classes.create",
      "classes.delete",
      "classes.read",
      "classes.update"
    ],
    "classes_scheduling": [
      "classes_scheduling.manage"
    ],
    "curricula": [
      "curricula.manage"
    ],
    "dashboard": [
      "dashboard.view"
    ],
    "exam_results": [
      "exam_results.read"
    ],
    "exams": [
      "exams.manage"
    ],
    "grade_levels": [
      "grade_levels.manage"
    ],
    "gradebook": [
      "gradebook.read"
    ],
    "lesson_deliveries": [
      "lesson_deliveries.create",
      "lesson_deliveries.delete",
      "lesson_deliveries.manage",
      "lesson_deliveries.read",
      "lesson_deliveries.update"
    ],
    "lessons": [
      "lessons.manage"
    ],
    "management": [
      "management.view"
    ],
    "report_cards": [
      "report_cards.export",
      "report_cards.read"
    ],
    "student_grades": [
      "student_grades.read"
    ],
    "student_report": [
      "student_report.read"
    ],
    "subjects": [
      "subjects.manage"
    ],
    "terms": [
      "terms.manage"
    ],
    "timetables": [
      "timetables.manage"
    ]
  },
  "admissions": {
    "applications": [
      "applications.create",
      "applications.delete",
      "applications.manage",
      "applications.update",
      "applications.view"
    ],
    "decisions": [
      "decisions.make",
      "decisions.update",
      "decisions.view"
    ],
    "enquiries": [
      "enquiries.manage",
      "enquiries.read"
    ],
    "enrollments": [
      "enrollments.complete",
      "enrollments.create",
      "enrollments.update",
      "enrollments.view"
    ],
    "entrance_exams": [
      "entrance_exams.create",
      "entrance_exams.delete",
      "entrance_exams.manage",
      "entrance_exams.update",
      "entrance_exams.view"
    ],
    "interviews": [
      "interviews.complete",
      "interviews.create",
      "interviews.delete",
      "interviews.update",
      "interviews.view"
    ]
  },
  "assetsmgt": {
    "asset_assignments": [
      "asset_assignments.create",
      "asset_assignments.delete",
      "asset_assignments.export",
      "asset_assignments.read",
      "asset_assignments.send",
      "asset_assignments.share",
      "asset_assignments.submit",
      "asset_assignments.update",
      "asset_assignments.upload"
    ],
    "asset_maintenance_logs": [
      "asset_maintenance_logs.create",
      "asset_maintenance_logs.delete",
      "asset_maintenance_logs.export",
      "asset_maintenance_logs.read",
      "asset_maintenance_logs.send",
      "asset_maintenance_logs.share",
      "asset_maintenance_logs.submit",
      "asset_maintenance_logs.update",
      "asset_maintenance_logs.upload"
    ],
    "asset_types": [
      "asset_types.create",
      "asset_types.delete",
      "asset_types.export",
      "asset_types.read",
      "asset_types.send",
      "asset_types.share",
      "asset_types.submit",
      "asset_types.update",
      "asset_types.upload"
    ],
    "assets": [
      "assets.create",
      "assets.delete",
      "assets.export",
      "assets.read",
      "assets.send",
      "assets.share",
      "assets.submit",
      "assets.update",
      "assets.upload"
    ]
  },
  "attendances": {
    "attendance_policies": [
      "attendance_policies.create",
      "attendance_policies.delete",
      "attendance_policies.export",
      "attendance_policies.read",
      "attendance_policies.send",
      "attendance_policies.share",
      "attendance_policies.submit",
      "attendance_policies.update",
      "attendance_policies.upload"
    ],
    "attendance_records": [
      "attendance_records.create",
      "attendance_records.delete",
      "attendance_records.export",
      "attendance_records.manage",
      "attendance_records.read",
      "attendance_records.send",
      "attendance_records.share",
      "attendance_records.submit",
      "attendance_records.upload"
    ],
    "attendance_sessions": [
      "attendance_sessions.create",
      "attendance_sessions.delete",
      "attendance_sessions.export",
      "attendance_sessions.read",
      "attendance_sessions.send",
      "attendance_sessions.share",
      "attendance_sessions.submit",
      "attendance_sessions.update",
      "attendance_sessions.upload"
    ],
    "campus_access_logs": [
      "campus_access_logs.create",
      "campus_access_logs.delete",
      "campus_access_logs.export",
      "campus_access_logs.read",
      "campus_access_logs.send",
      "campus_access_logs.share",
      "campus_access_logs.submit",
      "campus_access_logs.update",
      "campus_access_logs.upload"
    ],
    "leave_types": [
      "leave_types.create",
      "leave_types.delete",
      "leave_types.export",
      "leave_types.read",
      "leave_types.send",
      "leave_types.share",
      "leave_types.submit",
      "leave_types.update",
      "leave_types.upload"
    ],
    "leaves": [
      "leaves.create",
      "leaves.delete",
      "leaves.export",
      "leaves.read",
      "leaves.send",
      "leaves.share",
      "leaves.submit",
      "leaves.update",
      "leaves.upload"
    ],
    "report_attendance_compliance": [
      "report_attendance_compliance.export",
      "report_attendance_compliance.read",
      "report_attendance_compliance.send",
      "report_attendance_compliance.share"
    ],
    "report_attendance_summary": [
      "report_attendance_summary.export",
      "report_attendance_summary.read",
      "report_attendance_summary.send",
      "report_attendance_summary.share"
    ],
    "report_leave_summary": [
      "report_leave_summary.export",
      "report_leave_summary.read",
      "report_leave_summary.send",
      "report_leave_summary.share"
    ]
  },
  "audit": {
    "auditlogs_report": [
      "auditlogs_report.read"
    ],
    "auditroute_report": [
      "auditroute_report.read"
    ]
  },
  "communications": {
    "messages": [
      "messages.read",
      "messages.send"
    ],
    "notifications": [
      "notifications.create",
      "notifications.read"
    ]
  },
  "filesmgt": {
    "document_types": [
      "document_types.manage"
    ],
    "files": [
      "files.delete",
      "files.read",
      "files.share",
      "files.upload"
    ]
  },
  "profiles": {
    "role_permissions": [
      "role_permissions.create",
      "role_permissions.delete",
      "role_permissions.export",
      "role_permissions.read",
      "role_permissions.send",
      "role_permissions.share",
      "role_permissions.submit",
      "role_permissions.update",
      "role_permissions.upload"
    ],
    "roles": [
      "roles.create",
      "roles.delete",
      "roles.export",
      "roles.read",
      "roles.send",
      "roles.share",
      "roles.submit",
      "roles.update",
      "roles.upload"
    ],
    "route_permissions": [
      "route_permissions.create",
      "route_permissions.delete",
      "route_permissions.export",
      "route_permissions.read",
      "route_permissions.send",
      "route_permissions.share",
      "route_permissions.submit",
      "route_permissions.update",
      "route_permissions.upload"
    ],
    "user_permissions": [
      "user_permissions.create",
      "user_permissions.delete",
      "user_permissions.export",
      "user_permissions.read",
      "user_permissions.send",
      "user_permissions.share",
      "user_permissions.submit",
      "user_permissions.update",
      "user_permissions.upload"
    ],
    "user_roles": [
      "user_roles.create",
      "user_roles.delete",
      "user_roles.export",
      "user_roles.read",
      "user_roles.send",
      "user_roles.share",
      "user_roles.submit",
      "user_roles.update",
      "user_roles.upload"
    ],
    "users": [
      "users.create",
      "users.delete",
      "users.export",
      "users.read",
      "users.send",
      "users.share",
      "users.submit",
      "users.update",
      "users.upload"
    ]
  },
  "staffmgt": {
    "departments": [
      "departments.manage"
    ],
    "education_levels": [
      "education_levels.manage"
    ],
    "employment_types": [
      "employment_types.manage"
    ],
    "staff": [
      "staff.create",
      "staff.delete",
      "staff.promote",
      "staff.read",
      "staff.update"
    ],
    "staffmgt_promotion_history_view": [
      "staffmgt_promotion_history_view.read"
    ],
    "staffmgt_roles": [
      "staffmgt_roles.manage"
    ],
    "staffmgt_teacher_workload_view": [
      "staffmgt_teacher_workload_view.read"
    ],
    "staffmgt_teachereffectiveness_view": [
      "staffmgt_teachereffectiveness_view.read"
    ]
  },
  "storage": {
    "buckets": [
      "buckets.manage"
    ],
    "objects": [
      "objects.delete",
      "objects.read",
      "objects.upload"
    ]
  },
  "studentsmgt": {
    "attendance_status": [
      "attendance_status.manage"
    ],
    "attendances": [
      "attendances.read",
      "attendances.record"
    ],
    "enrollments": [
      "enrollments.manage"
    ],
    "students": [
      "students.create",
      "students.delete",
      "students.promote",
      "students.read",
      "students.update"
    ]
  },
  "system": {
    "api_keys": [
      "api_keys.manage"
    ],
    "contact_types": [
      "contact_types.manage"
    ],
    "custom_fields": [
      "custom_fields.manage"
    ],
    "districts": [
      "districts.manage"
    ],
    "genders": [
      "genders.manage"
    ],
    "integrations": [
      "integrations.manage"
    ],
    "relationship_types": [
      "relationship_types.manage"
    ],
    "schools": [
      "schools.manage"
    ],
    "settings": [
      "settings.manage"
    ],
    "system_roleroute_access_view": [
      "system_roleroute_access_view.read"
    ],
    "webhooks": [
      "webhooks.manage"
    ],
    "workflows": [
      "workflows.manage"
    ]
  },
  "vault": {
    "secrets": [
      "secrets.manage"
    ]
  }
};
