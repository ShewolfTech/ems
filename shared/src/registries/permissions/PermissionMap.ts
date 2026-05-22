// Auto-generated permission map
import { Permissions } from "./permissionsEnum.js";

export const PermissionMap = {
  "academics": {
    "academic_years": {
      "manage": "academics:academic_years:academic_years.manage"
    },
    "academics_assignment_submissions_view": {
      "read": "academics:academics_assignment_submissions_view:academics_assignment_submissions_view.read"
    },
    "academics_classperformance_summary_view": {
      "read": "academics:academics_classperformance_summary_view:academics_classperformance_summary_view.read"
    },
    "academics_classschedule_view": {
      "read": "academics:academics_classschedule_view:academics_classschedule_view.read"
    },
    "academics_exams_performance_summary_view": {
      "read": "academics:academics_exams_performance_summary_view:academics_exams_performance_summary_view.read"
    },
    "academics_exams_performance_view": {
      "read": "academics:academics_exams_performance_view:academics_exams_performance_view.read"
    },
    "academics_studentsgrades_view": {
      "read": "academics:academics_studentsgrades_view:academics_studentsgrades_view.read"
    },
    "academics_studentterm_performance_view": {
      "read": "academics:academics_studentterm_performance_view:academics_studentterm_performance_view.read"
    },
    "academics_subjectperformance_summary_view": {
      "read": "academics:academics_subjectperformance_summary_view:academics_subjectperformance_summary_view.read"
    },
    "assessments": {
      "approve": "academics:assessments:assessments.approve",
      "create": "academics:assessments:assessments.create",
      "delete": "academics:assessments:assessments.delete",
      "export": "academics:assessments:assessments.export",
      "read": "academics:assessments:assessments.read",
      "update": "academics:assessments:assessments.update"
    },
    "assignments": {
      "create": "academics:assignments:assignments.create",
      "grade": "academics:assignments:assignments.grade",
      "submit": "academics:assignments:assignments.submit"
    },
    "classes": {
      "assign_student": "academics:classes:classes.assign_student",
      "create": "academics:classes:classes.create",
      "delete": "academics:classes:classes.delete",
      "read": "academics:classes:classes.read",
      "update": "academics:classes:classes.update"
    },
    "curricula": {
      "manage": "academics:curricula:curricula.manage"
    },
    "exam_results": {
      "read": "academics:exam_results:exam_results.read"
    },
    "exams": {
      "manage": "academics:exams:exams.manage"
    },
    "grade_levels": {
      "manage": "academics:grade_levels:grade_levels.manage"
    },
    "lessons": {
      "manage": "academics:lessons:lessons.manage"
    },
    "report_cards": {
      "export": "academics:report_cards:report_cards.export",
      "read": "academics:report_cards:report_cards.read"
    },
    "subjects": {
      "manage": "academics:subjects:subjects.manage"
    },
    "terms": {
      "manage": "academics:terms:terms.manage"
    },
    "timetables": {
      "manage": "academics:timetables:timetables.manage"
    }
  },
  "admissions": {
    "inquiries": {
      "manage": "admissions:inquiries:inquiries.manage",
      "read": "admissions:inquiries:inquiries.read"
    }
  },
  "audit": {
    "audit_logs_report": {
      "read": "audit:audit_logs_report:audit_logs_report.read"
    },
    "audit_route_report": {
      "read": "audit:audit_route_report:audit_route_report.read"
    }
  },
  "communications": {
    "messages": {
      "read": "communications:messages:messages.read",
      "send": "communications:messages:messages.send"
    },
    "notifications": {
      "create": "communications:notifications:notifications.create",
      "read": "communications:notifications:notifications.read"
    }
  },
  "filesmgt": {
    "document_types": {
      "manage": "filesmgt:document_types:document_types.manage"
    },
    "files": {
      "delete": "filesmgt:files:files.delete",
      "read": "filesmgt:files:files.read",
      "share": "filesmgt:files:files.share",
      "upload": "filesmgt:files:files.upload"
    }
  },
  "reporting": {
    "activities": {
      "read": "reporting:activities:activities.read"
    },
    "audits": {
      "read": "reporting:audits:audits.read"
    },
    "dashboards": {
      "export": "reporting:dashboards:dashboards.export",
      "read": "reporting:dashboards:dashboards.read"
    },
    "kpi": {
      "manage": "reporting:kpi:kpi.manage"
    },
    "teacher_effectiveness": {
      "read": "reporting:teacher_effectiveness:teacher_effectiveness.read"
    }
  },
  "staffmgt": {
    "departments": {
      "manage": "staffmgt:departments:departments.manage"
    },
    "education_levels": {
      "manage": "staffmgt:education_levels:education_levels.manage"
    },
    "employment_types": {
      "manage": "staffmgt:employment_types:employment_types.manage"
    },
    "staff": {
      "create": "staffmgt:staff:staff.create",
      "delete": "staffmgt:staff:staff.delete",
      "promote": "staffmgt:staff:staff.promote",
      "read": "staffmgt:staff:staff.read",
      "update": "staffmgt:staff:staff.update"
    },
    "staffmgt_promotion_history_view": {
      "read": "staffmgt:staffmgt_promotion_history_view:staffmgt_promotion_history_view.read"
    },
    "staffmgt_roles": {
      "manage": "staffmgt:staffmgt_roles:staffmgt_roles.manage"
    },
    "staffmgt_teachereffectiveness_view": {
      "read": "staffmgt:staffmgt_teachereffectiveness_view:staffmgt_teachereffectiveness_view.read"
    },
    "staffmgt_teacherworkload_view": {
      "read": "staffmgt:staffmgt_teacherworkload_view:staffmgt_teacherworkload_view.read"
    }
  },
  "storage": {
    "buckets": {
      "manage": "storage:buckets:buckets.manage"
    },
    "objects": {
      "delete": "storage:objects:objects.delete",
      "read": "storage:objects:objects.read",
      "upload": "storage:objects:objects.upload"
    }
  },
  "studentsmgt": {
    "attendance_status": {
      "manage": "studentsmgt:attendance_status:attendance_status.manage"
    },
    "attendances": {
      "read": "studentsmgt:attendances:attendances.read",
      "record": "studentsmgt:attendances:attendances.record"
    },
    "enrollments": {
      "manage": "studentsmgt:enrollments:enrollments.manage"
    },
    "students": {
      "create": "studentsmgt:students:students.create",
      "delete": "studentsmgt:students:students.delete",
      "promote": "studentsmgt:students:students.promote",
      "read": "studentsmgt:students:students.read",
      "update": "studentsmgt:students:students.update"
    }
  },
  "system": {
    "api_keys": {
      "manage": "system:api_keys:api_keys.manage"
    },
    "contact_types": {
      "manage": "system:contact_types:contact_types.manage"
    },
    "custom_fields": {
      "manage": "system:custom_fields:custom_fields.manage"
    },
    "gender": {
      "manage": "system:gender:gender.manage"
    },
    "integrations": {
      "manage": "system:integrations:integrations.manage"
    },
    "locations": {
      "manage": "system:locations:locations.manage"
    },
    "relationship_types": {
      "manage": "system:relationship_types:relationship_types.manage"
    },
    "schools": {
      "manage": "system:schools:schools.manage"
    },
    "settings": {
      "manage": "system:settings:settings.manage"
    },
    "system_roleroute_access_view": {
      "read": "system:system_roleroute_access_view:system_roleroute_access_view.read"
    },
    "webhooks": {
      "manage": "system:webhooks:webhooks.manage"
    },
    "workflows": {
      "manage": "system:workflows:workflows.manage"
    }
  },
  "vault": {
    "secrets": {
      "manage": "vault:secrets:secrets.manage"
    }
  }
} as const;
