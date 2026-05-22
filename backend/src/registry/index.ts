// ⚠️ Auto-generated Registry. Do not edit manually.
import { z } from "zod";
import { AcademicYearsSchema } from "../domains/academics/academic_years/validator.js";
import { AdmissionStatusesSchema } from "../domains/admissions/applications/validator.js";
import { AssessmentResultSchema } from "../domains/academics/assessment_results/validator.js";
import { AssessmentsSchema } from "../domains/academics/assessments/validator.js";
import { AssetAssignmentsSchema } from "../domains/assetsmgt/asset_assignments/validator.js";
import { AssetMaintenanceLogsSchema } from "../domains/assetsmgt/asset_maintenance_logs/validator.js";
import { AssetTypesSchema } from "../domains/assetsmgt/asset_types/validator.js";
import { AssignmentsSchema } from "../domains/academics/assignments/validator.js";
import { AttendancePoliciesSchema } from "../domains/attendances/attendance_policies/validator.js";
import { AttendanceRecordsSchema } from "../domains/attendances/attendance_records/validator.js";
import { AttendanceSessionsSchema } from "../domains/attendances/attendance_sessions/validator.js";
import { AttendanceStatusSchema } from "../domains/studentsmgt/attendance_status/validator.js";
import { ReportAttendanceSummarySchema } from "../domains/attendances/report_attendance_summary/validator.js";
import { AuditlogsReportSchema } from "../domains/audit/auditlogs_report/validator.js";
import { AuditrouteReportSchema } from "../domains/audit/auditroute_report/validator.js";
import { CampusAccessLogsSchema } from "../domains/attendances/campus_access_logs/validator.js";
import { ClassesSchema } from "../domains/academics/classes/validator.js";
import { ContactTypesSchema } from "../domains/system/contact_types/validator.js";
import { CurriculaSchema } from "../domains/academics/curricula/validator.js";
import { DepartmentsSchema } from "../domains/staffmgt/departments/validator.js";
import { DistrictsSchema } from "../domains/system/districts/validator.js";
import { DocumentTypesSchema } from "../domains/filesmgt/document_types/validator.js";
import { EducationLevelsSchema } from "../domains/staffmgt/education_levels/validator.js";
import { EmploymentTypesSchema } from "../domains/staffmgt/employment_types/validator.js";
import { EnquiryStatusTypesSchema } from "../domains/admissions/enquiries/validator.js";
import { ExamResultsSchema } from "../domains/academics/exam_results/validator.js";
import { ExamsSchema } from "../domains/academics/exams/validator.js";
import { GendersSchema } from "../domains/system/genders/validator.js";
import { GradeLevelsSchema } from "../domains/academics/grade_levels/validator.js";
import { LeavesSchema } from "../domains/attendances/leaves/validator.js";
import { LeaveTypesSchema } from "../domains/attendances/leave_types/validator.js";
import { LessonDeliverySchema } from "../domains/academics/lesson_deliveries/validator.js";
import { LessonsSchema } from "../domains/academics/lessons/validator.js";
import { PermissionsSchema } from "../domains/permissions/validator.js";
import { RelationshipTypesSchema } from "../domains/system/relationship_types/validator.js";
import { ReportCardsSchema } from "../domains/academics/report_cards/validator.js";
import { RolePermissionsSchema } from "../domains/profiles/role_permissions/validator.js";
import { RolesSchema } from "../domains/profiles/roles/validator.js";
import { RoutePermissionsSchema } from "../domains/profiles/route_permissions/validator.js";
import { SchoolsSchema } from "../domains/system/schools/validator.js";
import { StaffmgtRolesSchema } from "../domains/staffmgt/staffmgt_roles/validator.js";
import { StreamsSchema } from "../domains/academics/streams/validator.js";
import { SubjectsSchema } from "../domains/academics/subjects/validator.js";
import { TermsSchema } from "../domains/academics/terms/validator.js";
import { TimetablesSchema } from "../domains/academics/timetables/validator.js";
import { UserPermissionsSchema } from "../domains/profiles/user_permissions/validator.js";
import { UserRolesSchema } from "../domains/profiles/user_roles/validator.js";
import { UsersSchema } from "../domains/profiles/users/validator.js";


export const DomainRegistry = {
  academicYears: {
    resource: "academicYears",
    interface: "AcademicYears",
    schema: AcademicYearsSchema,
    path: "../domains/academics/academic_years",
    isMenuAvailable: false,
  },
  applications: {
    resource: "applications",
    interface: "Applications",
    schema: AdmissionStatusesSchema,
    path: "../domains/admissions/applications",
    isMenuAvailable: false,
  },
  assessmentResults: {
    resource: "assessmentResults",
    interface: "AssessmentResults",
    schema: AssessmentResultSchema,
    path: "../domains/academics/assessment_results",
    isMenuAvailable: false,
  },
  assessments: {
    resource: "assessments",
    interface: "Assessments",
    schema: AssessmentsSchema,
    path: "../domains/academics/assessments",
    isMenuAvailable: false,
  },
  assetAssignments: {
    resource: "assetAssignments",
    interface: "AssetAssignments",
    schema: AssetAssignmentsSchema,
    path: "../domains/assetsmgt/asset_assignments",
    isMenuAvailable: false,
  },
  assetMaintenanceLogs: {
    resource: "assetMaintenanceLogs",
    interface: "AssetMaintenanceLogs",
    schema: AssetMaintenanceLogsSchema,
    path: "../domains/assetsmgt/asset_maintenance_logs",
    isMenuAvailable: false,
  },
  assetTypes: {
    resource: "assetTypes",
    interface: "AssetTypes",
    schema: AssetTypesSchema,
    path: "../domains/assetsmgt/asset_types",
    isMenuAvailable: false,
  },
  assignments: {
    resource: "assignments",
    interface: "Assignments",
    schema: AssignmentsSchema,
    path: "../domains/academics/assignments",
    isMenuAvailable: false,
  },
  attendancePolicies: {
    resource: "attendancePolicies",
    interface: "AttendancePolicies",
    schema: AttendancePoliciesSchema,
    path: "../domains/attendances/attendance_policies",
    isMenuAvailable: false,
  },
  attendanceRecords: {
    resource: "attendanceRecords",
    interface: "AttendanceRecords",
    schema: AttendanceRecordsSchema,
    path: "../domains/attendances/attendance_records",
    isMenuAvailable: false,
  },
  attendanceSessions: {
    resource: "attendanceSessions",
    interface: "AttendanceSessions",
    schema: AttendanceSessionsSchema,
    path: "../domains/attendances/attendance_sessions",
    isMenuAvailable: false,
  },
  attendanceStatus: {
    resource: "attendanceStatus",
    interface: "AttendanceStatus",
    schema: AttendanceStatusSchema,
    path: "../domains/studentsmgt/attendance_status",
    isMenuAvailable: false,
  },
  attendanceSummary: {
    resource: "attendanceSummary",
    interface: "AttendanceSummary",
    schema: ReportAttendanceSummarySchema,
    path: "../domains/attendances/report_attendance_summary",
    isMenuAvailable: false,
  },
  auditlogs: {
    resource: "auditlogs",
    interface: "Auditlogs",
    schema: AuditlogsReportSchema,
    path: "../domains/audit/auditlogs_report",
    isMenuAvailable: false,
  },
  auditrouteReport: {
    resource: "auditrouteReport",
    interface: "AuditrouteReport",
    schema: AuditrouteReportSchema,
    path: "../domains/audit/auditroute_report",
    isMenuAvailable: true,
  },
  campusAccessLogs: {
    resource: "campusAccessLogs",
    interface: "CampusAccessLogs",
    schema: CampusAccessLogsSchema,
    path: "../domains/attendances/campus_access_logs",
    isMenuAvailable: false,
  },
  classes: {
    resource: "classes",
    interface: "Classes",
    schema: ClassesSchema,
    path: "../domains/academics/classes",
    isMenuAvailable: false,
  },
  contactTypes: {
    resource: "contactTypes",
    interface: "ContactTypes",
    schema: ContactTypesSchema,
    path: "../domains/system/contact_types",
    isMenuAvailable: false,
  },
  curricula: {
    resource: "curricula",
    interface: "Curricula",
    schema: CurriculaSchema,
    path: "../domains/academics/curricula",
    isMenuAvailable: false,
  },
  departments: {
    resource: "departments",
    interface: "Departments",
    schema: DepartmentsSchema,
    path: "../domains/staffmgt/departments",
    isMenuAvailable: false,
  },
  districts: {
    resource: "districts",
    interface: "Districts",
    schema: DistrictsSchema,
    path: "../domains/system/districts",
    isMenuAvailable: false,
  },
  documentTypes: {
    resource: "documentTypes",
    interface: "DocumentTypes",
    schema: DocumentTypesSchema,
    path: "../domains/filesmgt/document_types",
    isMenuAvailable: false,
  },
  educationLevels: {
    resource: "educationLevels",
    interface: "EducationLevels",
    schema: EducationLevelsSchema,
    path: "../domains/staffmgt/education_levels",
    isMenuAvailable: false,
  },
  employmentTypes: {
    resource: "employmentTypes",
    interface: "EmploymentTypes",
    schema: EmploymentTypesSchema,
    path: "../domains/staffmgt/employment_types",
    isMenuAvailable: false,
  },
  enquiries: {
    resource: "enquiries",
    interface: "Enquiries",
    schema: EnquiryStatusTypesSchema,
    path: "../domains/admissions/enquiries",
    isMenuAvailable: false,
  },
  examResults: {
    resource: "examResults",
    interface: "ExamResults",
    schema: ExamResultsSchema,
    path: "../domains/academics/exam_results",
    isMenuAvailable: false,
  },
  exams: {
    resource: "exams",
    interface: "Exams",
    schema: ExamsSchema,
    path: "../domains/academics/exams",
    isMenuAvailable: false,
  },
  genders: {
    resource: "genders",
    interface: "Genders",
    schema: GendersSchema,
    path: "../domains/system/genders",
    isMenuAvailable: false,
  },
  gradeLevels: {
    resource: "gradeLevels",
    interface: "GradeLevels",
    schema: GradeLevelsSchema,
    path: "../domains/academics/grade_levels",
    isMenuAvailable: false,
  },
  leaves: {
    resource: "leaves",
    interface: "Leaves",
    schema: LeavesSchema,
    path: "../domains/attendances/leaves",
    isMenuAvailable: false,
  },
  leaveTypes: {
    resource: "leaveTypes",
    interface: "LeaveTypes",
    schema: LeaveTypesSchema,
    path: "../domains/attendances/leave_types",
    isMenuAvailable: false,
  },
  lessonDeliveries: {
    resource: "lessonDeliveries",
    interface: "LessonDeliveries",
    schema: LessonDeliverySchema,
    path: "../domains/academics/lesson_deliveries",
    isMenuAvailable: false,
  },
  lessons: {
    resource: "lessons",
    interface: "Lessons",
    schema: LessonsSchema,
    path: "../domains/academics/lessons",
    isMenuAvailable: false,
  },
  permissions: {
    resource: "permissions",
    interface: "Permissions",
    schema: PermissionsSchema,
    path: "../domains/permissions",
    isMenuAvailable: true,
  },
  relationshipTypes: {
    resource: "relationshipTypes",
    interface: "RelationshipTypes",
    schema: RelationshipTypesSchema,
    path: "../domains/system/relationship_types",
    isMenuAvailable: false,
  },
  reportCards: {
    resource: "reportCards",
    interface: "ReportCards",
    schema: ReportCardsSchema,
    path: "../domains/academics/report_cards",
    isMenuAvailable: false,
  },
  rolePermissions: {
    resource: "rolePermissions",
    interface: "RolePermissions",
    schema: RolePermissionsSchema,
    path: "../domains/profiles/role_permissions",
    isMenuAvailable: true,
  },
  roles: {
    resource: "roles",
    interface: "Roles",
    schema: RolesSchema,
    path: "../domains/profiles/roles",
    isMenuAvailable: false,
  },
  routePermissions: {
    resource: "routePermissions",
    interface: "RoutePermissions",
    schema: RoutePermissionsSchema,
    path: "../domains/profiles/route_permissions",
    isMenuAvailable: true,
  },
  schools: {
    resource: "schools",
    interface: "Schools",
    schema: SchoolsSchema,
    path: "../domains/system/schools",
    isMenuAvailable: false,
  },
  staffmgtRoles: {
    resource: "staffmgtRoles",
    interface: "StaffmgtRoles",
    schema: StaffmgtRolesSchema,
    path: "../domains/staffmgt/staffmgt_roles",
    isMenuAvailable: false,
  },
  streams: {
    resource: "streams",
    interface: "Streams",
    schema: StreamsSchema,
    path: "../domains/academics/streams",
    isMenuAvailable: false,
  },
  subjects: {
    resource: "subjects",
    interface: "Subjects",
    schema: SubjectsSchema,
    path: "../domains/academics/subjects",
    isMenuAvailable: false,
  },
  terms: {
    resource: "terms",
    interface: "Terms",
    schema: TermsSchema,
    path: "../domains/academics/terms",
    isMenuAvailable: false,
  },
  timetables: {
    resource: "timetables",
    interface: "Timetables",
    schema: TimetablesSchema,
    path: "../domains/academics/timetables",
    isMenuAvailable: false,
  },
  userPermissions: {
    resource: "userPermissions",
    interface: "UserPermissions",
    schema: UserPermissionsSchema,
    path: "../domains/profiles/user_permissions",
    isMenuAvailable: true,
  },
  userRoles: {
    resource: "userRoles",
    interface: "UserRoles",
    schema: UserRolesSchema,
    path: "../domains/profiles/user_roles",
    isMenuAvailable: false,
  },
  users: {
    resource: "users",
    interface: "Users",
    schema: UsersSchema,
    path: "../domains/profiles/users",
    isMenuAvailable: false,
  },
} as const;

export type DomainName = keyof typeof DomainRegistry;
