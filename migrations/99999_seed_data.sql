/*
 99999_seed_data.sql
 Description: Initial seed data for countries, schools, departments, statuses, assessment types, and permissions.
 Note: This script is idempotent and can be safely re-run without creating duplicates.
*/

TRUNCATE TABLE public.permissions RESTART IDENTITY CASCADE;

INSERT INTO public.countries (name, iso_code, phone_code, continent)
VALUES 
  -- East Africa (Priority)
  ('Uganda', 'UG', '+256', 'Africa'),
  ('Kenya', 'KE', '+254', 'Africa'),
  ('Tanzania', 'TZ', '+255', 'Africa'),
  ('Rwanda', 'RW', '+250', 'Africa'),
  ('Burundi', 'BI', '+257', 'Africa'),
  ('South Sudan', 'SS', '+211', 'Africa'),
  ('Democratic Republic of the Congo', 'CD', '+243', 'Africa'),

  -- International Hubs
  ('United Kingdom', 'GB', '+44', 'Europe'),
  ('United States', 'US', '+1', 'North America'),
  ('India', 'IN', '+91', 'Asia'),
  ('United Arab Emirates', 'AE', '+971', 'Asia'),
  ('South Africa', 'ZA', '+27', 'Africa'),
  ('Nigeria', 'NG', '+234', 'Africa'),
  ('Canada', 'CA', '+1', 'North America'),
  ('China', 'CN', '+86', 'Asia')
ON CONFLICT (iso_code) DO NOTHING;


-- 1. Ensure we have districts to reference 
-- (Assuming Central/Kampala districts exist from your previous setup)

INSERT INTO districts (id, name, is_active) 
VALUES 
    (1, 'Kampala', true),
    (2, 'Wakiso', true),
    (3, 'Mbarara', true)
ON CONFLICT (id) DO NOTHING;


-- 2. Insert Schools
INSERT INTO schools (
    id,
    name,
    code,
    address,
    district_id,
    contact_email,
    contact_phone,
    logo_url,
    timezone,
    is_active,
    settings,
    created_by,
    updated_by
) VALUES
(
    10001,
    'Nakwero Secondary School',
    'NSS001',
    'Nakwero, Kira, Uganda',
    2,  -- Wakiso district
    'admin@nakwero.edu.ug',
    '+256703618710',
    'https://example.com/logos/nakwero.png',
    'Africa/Kampala',
    TRUE,
    '{"academic_year_start_month": 9, "default_language": "en", "enable_sms_notifications": true}'::JSONB,
    1,
    1
),
(
    10002,
    'Kampala International Academy',
    'KIA002',
    'Plot 45, Jinja Road, Kampala',
    1,  -- Kampala district
    'info@kia.ac.ug',
    '+256752123456',
    'https://example.com/logos/kia.png',
    'Africa/Kampala',
    TRUE,
    '{"academic_year_start_month": 2, "default_language": "en", "enable_sms_notifications": false}'::JSONB,
    1,
    1
),
(
    10003,
    'Mbarara High School',
    'MHS003',
    'High Street, Mbarara City',
    3,  -- Mbarara district
    'contact@mbararahigh.sc.ug',
    '+256772987654',
    'https://example.com/logos/mhs.png',
    'Africa/Kampala',
    TRUE,
    '{"academic_year_start_month": 2, "default_language": "en", "enable_sms_notifications": true}'::JSONB,
    1,
    1
)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- SEED DATA: Departments (Schools 1, 2, 3)
-- ============================================

INSERT INTO public.departments (school_id, name, code, description) VALUES
-- School 1: St. Mary's Academy
(10001, 'Mathematics', 'MATH-01', 'Core academic department for Mathematics and Statistics.'),
(10001, 'Science & Technology', 'SCI-01', 'Includes Physics, Chemistry, Biology, and ICT.'),
(10001, 'Humanities', 'HUM-01', 'Covers History, Geography, and Religious Education.'),
(10001, 'Finance & Accounts', 'FIN-01', 'Management of school fees, payroll, and budgeting.'),
(10001, 'Administration', 'ADMIN-01', 'Headteacher office and general school management.'),
-- School 2: Wakiso Progressive School
(10002, 'Mathematics', 'MATH-02', 'Academic Mathematics department.'),
(10002, 'Languages', 'LANG-02', 'English, Luganda, and Literature.'),
(10002, 'Vocational Studies', 'VOC-02', 'Technical skills, Agriculture, and Fine Art.'),
(10002, 'Human Resources', 'HR-02', 'Staff welfare and recruitment.'),
(10002, 'Bursar Office', 'BURS-02', 'Financial records and student billing.'),
-- School 3: Western High School
(10003, 'Sciences', 'SCI-03', 'Natural sciences and laboratory management.'),
(10003, 'Sports & Co-Curricular', 'SPRT-03', 'Physical Education and sports department.'),
(10003, 'Library & Records', 'LIB-03', 'Information management and archiving.'),
(10003, 'Security', 'SEC-03', 'Campus safety and premises monitoring.'),
(10003, 'Mathematics', 'MATH-03', 'Mathematics academic block.')
ON CONFLICT (school_id, name) DO NOTHING;

/*
-- Verification query
SELECT s.name AS school_name, d.name AS dept_name, d.code 
FROM departments d
JOIN schools s ON d.school_id = s.id
WHERE d.is_deleted = false
ORDER BY s.id, d.name;
*/
-----------------------------------------------------------------

INSERT INTO statuses (school_id, module, code, label) VALUES
-- Lessons
(10001,'lessons','planned','Planned'),
(10001,'lessons','completed','Completed'),
(10001,'lessons','cancelled','Cancelled'),
(10001,'lessons','postponed','Postponed'),

-- Assignments
(10001,'assignments','assigned','Assigned'),
(10001,'assignments','submitted','Submitted'),
(10001,'assignments','graded','Graded'),
(10001,'assignments','cancelled','Cancelled'),
(10001,'assignments','postponed','Postponed'),

-- Submissions
(10001,'submissions','submitted','Submitted'),
(10001,'submissions','graded','Graded'),
(10001,'submissions','late','Late'),
(10001,'submissions','resubmitted','Resubmitted'),

-- Exams
(10001,'exams','scheduled','Scheduled'),
(10001,'exams','completed','Completed'),
(10001,'exams','cancelled','Cancelled'),
(10001,'exams','postponed','Postponed'),

-- Exam Results
(10001,'exam_results','recorded','Recorded'),
(10001,'exam_results','verified','Verified'),
(10001,'exam_results','published','Published'),

-- Report Cards
(10001,'report_cards','draft','Draft'),
(10001,'report_cards','published','Published'),
(10001,'report_cards','archived','Archived')
ON CONFLICT (module, code) DO NOTHING;

-- ============================================ 
-- Assessment Types Lookup Table -- 
-- ============================================

INSERT INTO assessment_types (school_id, code, label) VALUES
(10001,'exams','Exam'),
(10001,'quizes','Quiz'),
(10001,'assignments','Assignment'),
(10001,'projects','Project'),
(10001,'orals','Oral'),
(10001,'Admissions','Admission'),
(10001,'practicals','Practical');


--- 🚀 Example Seed Script (Current Tables Only)


-- ============================================
-- COMPLETE PERMISSIONS SEED (id starts at 1)
-- Format: resource.action (e.g., 'classes.read', 'academic_years.manage')
-- ============================================

INSERT INTO permissions (id, name, module, resource, action)
VALUES
  (1, 'View Staff Promotion History', 'staffmgt', 'staffmgt_promotion_history_view', 'read'),
  (2, 'View Teacher Effectiveness', 'staffmgt', 'staffmgt_teachereffectiveness_view', 'read'),
  (3, 'View Assignment Submissions', 'academics', 'assignment_submissions', 'read'),
  (4, 'View Student Grades', 'academics', 'student_grades', 'read'),
  (5, 'View Class Schedule', 'academics', 'class_schedule', 'read'),
  (6, 'View Teacher Workload', 'staffmgt', 'staffmgt_teacher_workload_view', 'read'),
  (7, 'View Audit Logs Report', 'audit', 'auditlogs_report', 'read'),
  (8, 'View System Role Access', 'system', 'system_roleroute_access_view', 'read'),
  (9, 'View Audit Route Report', 'audit', 'auditroute_report', 'read'),
  (10, 'Create Student', 'studentsmgt', 'students', 'create'),
  (11, 'View Student', 'studentsmgt', 'students', 'read'),
  (12, 'Update Student', 'studentsmgt', 'students', 'update'),
  (13, 'Delete Student', 'studentsmgt', 'students', 'delete'),
  (14, 'Promote Student', 'studentsmgt', 'students', 'promote'),
  (15, 'Manage Enrollments', 'studentsmgt', 'enrollments', 'manage'),
  (16, 'View Attendance', 'studentsmgt', 'attendances', 'read'),
  (17, 'Record Attendance', 'studentsmgt', 'attendances', 'record'),
  (18, 'Manage Attendance Statuses', 'studentsmgt', 'attendance_status', 'manage'),
  (19, 'Create Staff', 'staffmgt', 'staff', 'create'),
  (20, 'View Staff', 'staffmgt', 'staff', 'read'),
  (21, 'Update Staff', 'staffmgt', 'staff', 'update'),
  (22, 'Delete Staff', 'staffmgt', 'staff', 'delete'),
  (23, 'Promote Staff', 'staffmgt', 'staff', 'promote'),
  (24, 'Manage Departments', 'staffmgt', 'departments', 'manage'),
  (25, 'Manage Education Levels', 'staffmgt', 'education_levels', 'manage'),
  (26, 'Manage Employment Types', 'staffmgt', 'employment_types', 'manage'),
  (27, 'Manage Staff Roles', 'staffmgt', 'staffmgt_roles', 'manage'),
  (28, 'Create Class', 'academics', 'classes', 'create'),
  (29, 'View Class', 'academics', 'classes', 'read'),
  (30, 'Update Class', 'academics', 'classes', 'update'),
  (31, 'Delete Class', 'academics', 'classes', 'delete'),
  (32, 'Assign Student to Classes', 'academics', 'classes', 'assign_student'),
  (33, 'Manage Subjects', 'academics', 'subjects', 'manage'),
  (34, 'Manage Curricula', 'academics', 'curricula', 'manage'),
  (35, 'Manage Grade Levels', 'academics', 'grade_levels', 'manage'),
  (36, 'Manage Terms', 'academics', 'terms', 'manage'),
  (37, 'Manage Academic Years', 'academics', 'academic_years', 'manage'),
(38, 'Manage Academic Configuration', 'academics', 'academic_setup', 'manage'),
(39, 'Manage Lessons', 'academics', 'lessons', 'manage'),
(40, 'Manage Timetables', 'academics', 'timetables', 'manage'),
(260, 'Manage Classroom Management', 'academics', 'classes_scheduling', 'manage'),
(41, 'Create Assessment', 'academics', 'assessments', 'create'),
(42, 'View Assessment', 'academics', 'assessments', 'read'),
(43, 'Update Assessment', 'academics', 'assessments', 'update'),
(44, 'Delete Assessment', 'academics', 'assessments', 'delete'),
(45, 'Approve Assessment Results', 'academics', 'assessments', 'approve'),
(46, 'Export Assessment Report', 'academics', 'assessments', 'export'),
(250, 'Manage Assessment Results', 'academics', 'assessment_results', 'manage'),
(251, 'View Assessment Results', 'academics', 'assessment_results', 'read'),
(252, 'Create Assessment Result', 'academics', 'assessment_results', 'create'),
(253, 'Update Assessment Result', 'academics', 'assessment_results', 'update'),
(254, 'Delete Assessment Result', 'academics', 'assessment_results', 'delete'),
(255, 'View Grade Book', 'academics', 'gradebook', 'read'),
(256, 'View Student Report', 'academics', 'student_report', 'read'),
(257, 'View Assessment Calendar', 'academics', 'assessment_calendar', 'read'),
(47, 'View Exam Results', 'academics', 'exam_results', 'read'),
(48, 'Manage Exams', 'academics', 'exams', 'manage'),
(49, 'View Report Cards', 'academics', 'report_cards', 'read'),
(50, 'Export Report Cards', 'academics', 'report_cards', 'export'),
(51, 'Create Assignment', 'academics', 'assignments', 'create'),
(52, 'Submit Assignment', 'academics', 'assignments', 'submit'),
(53, 'Grade Assignment', 'academics', 'assignments', 'grade'),
(54, 'Upload File', 'filesmgt', 'files', 'upload'),
(55, 'View File', 'filesmgt', 'files', 'read'),
(56, 'Share File', 'filesmgt', 'files', 'share'),
(57, 'Delete File', 'filesmgt', 'files', 'delete'),
(58, 'Manage Document Types', 'filesmgt', 'document_types', 'manage'),
(59, 'Send Message', 'communications', 'messages', 'send'),
(60, 'Read Message', 'communications', 'messages', 'read'),
(61, 'Create Notification', 'communications', 'notifications', 'create'),
(62, 'View Notifications', 'communications', 'notifications', 'read'),
(63, 'Manage Schools', 'system', 'schools', 'manage'),
(64, 'Manage System Settings', 'system', 'settings', 'manage'),
(65, 'Manage Custom Fields', 'system', 'custom_fields', 'manage'),
(66, 'Manage Contact Types', 'system', 'contact_types', 'manage'),
(67, 'Manage Relationship Types', 'system', 'relationship_types', 'manage'),
(68, 'Manage Genders', 'system', 'genders', 'manage'),
(69, 'Manage Locations', 'system', 'districts', 'manage'),
(70, 'Manage API Keys', 'system', 'api_keys', 'manage'),
(71, 'Manage Integrations', 'system', 'integrations', 'manage'),
(72, 'Manage Webhooks', 'system', 'webhooks', 'manage'),
(73, 'Manage Workflows', 'system', 'workflows', 'manage'),
(74, 'Manage enquiries', 'admissions', 'enquiries', 'manage'),
(75, 'View enquiries', 'admissions', 'enquiries', 'read'),
(76, 'Manage Buckets', 'storage', 'buckets', 'manage'),
(77, 'Upload Object', 'storage', 'objects', 'upload'),
(78, 'View Object', 'storage', 'objects', 'read'),
(79, 'Delete Object', 'storage', 'objects', 'delete'),
(80, 'Manage Secrets', 'vault', 'secrets', 'manage'),
(81, 'Read Assignment', 'academics', 'assignments', 'read'),
(82, 'View Academics Dashboard', 'academics', 'dashboard', 'view'),
(83, 'View Academics Management', 'academics', 'management', 'view'),
(84, 'View Users or Profiles', 'profiles', 'users', 'read'),
(85, 'Create Users or Profiles', 'profiles', 'users', 'create'),
(86, 'Update Users or Profiles', 'profiles', 'users', 'update'),
(87, 'Delete Users or Profiles', 'profiles', 'users', 'delete'),
(88, 'Export Users or Profiles', 'profiles', 'users', 'export'),
(89, 'Submit Users or Profiles', 'profiles', 'users', 'submit'),
(90, 'Upload Users or Profiles', 'profiles', 'users', 'upload'),
(91, 'Share Users or Profiles', 'profiles', 'users', 'share'),
(92, 'Send Users or Profiles', 'profiles', 'users', 'send'),
(93, 'View Roles', 'profiles', 'roles', 'read'),
(94, 'Create Roles', 'profiles', 'roles', 'create'),
(95, 'Update Roles', 'profiles', 'roles', 'update'),
(96, 'Delete Roles', 'profiles', 'roles', 'delete'),
(97, 'Export Roles Data', 'profiles', 'roles', 'export'),
(98, 'Submit Roles Data', 'profiles', 'roles', 'submit'),
(99, 'Upload Roles Data', 'profiles', 'roles', 'upload'),
(100, 'Share Roles Data', 'profiles', 'roles', 'share'),
(101, 'Send Roles Data', 'profiles', 'roles', 'send'),
(102, 'Read role_permissions', 'profiles', 'role_permissions', 'read'),
(103, 'Create role_permissions', 'profiles', 'role_permissions', 'create'),
(104, 'Update role_permissions', 'profiles', 'role_permissions', 'update'),
(105, 'Delete role_permissions', 'profiles', 'role_permissions', 'delete'),
(106, 'Export role_permissions data', 'profiles', 'role_permissions', 'export'),
(107, 'Submit role_permissions data', 'profiles', 'role_permissions', 'submit'),
(108, 'Upload role_permissions data', 'profiles', 'role_permissions', 'upload'),
(109, 'Share role_permissions data', 'profiles', 'role_permissions', 'share'),
(110, 'Send role_permissions data', 'profiles', 'role_permissions', 'send'),
(111, 'Read user_permissions', 'profiles', 'user_permissions', 'read'),
(112, 'Create user_permissions', 'profiles', 'user_permissions', 'create'),
(113, 'Update user_permissions', 'profiles', 'user_permissions', 'update'),
(114, 'Delete user_permissions', 'profiles', 'user_permissions', 'delete'),
(115, 'Export user_permissions', 'profiles', 'user_permissions', 'export'),
(116, 'Submit user_permissions', 'profiles', 'user_permissions', 'submit'),
(117, 'Upload user_permissions', 'profiles', 'user_permissions', 'upload'),
(118, 'Share user_permissions', 'profiles', 'user_permissions', 'share'),
(119, 'Send user_permissions', 'profiles', 'user_permissions', 'send'),
(120, 'Read route_permissions', 'profiles', 'route_permissions', 'read'),
(121, 'Create route_permissions', 'profiles', 'route_permissions', 'create'),
(122, 'Update route_permissions', 'profiles', 'route_permissions', 'update'),
(123, 'Delete route_permissions', 'profiles', 'route_permissions', 'delete'),
(124, 'Export route_permissions', 'profiles', 'route_permissions', 'export'),
(125, 'Submit route_permissions', 'profiles', 'route_permissions', 'submit'),
(126, 'Upload route_permissions', 'profiles', 'route_permissions', 'upload'),
(127, 'Share route_permissions', 'profiles', 'route_permissions', 'share'),
(128, 'Send route_permissions', 'profiles', 'route_permissions', 'send'),
(129, 'Read user_roles', 'profiles', 'user_roles', 'read'),
(130, 'Create user_roles', 'profiles', 'user_roles', 'create'),
(131, 'Update user_roles', 'profiles', 'user_roles', 'update'),
(132, 'Delete user_roles', 'profiles', 'user_roles', 'delete'),
(133, 'Export user_roles', 'profiles', 'user_roles', 'export'),
(134, 'Submit user_roles', 'profiles', 'user_roles', 'submit'),
(135, 'Upload user_roles', 'profiles', 'user_roles', 'upload'),
(136, 'Share user_roles', 'profiles', 'user_roles', 'share'),
(137, 'Send user_roles', 'profiles', 'user_roles', 'send'),
(138, 'Create Assets - tools, assets, devices', 'assetsmgt', 'assets', 'create'),
(139, 'Read Assets - tools, assets, devices', 'assetsmgt', 'assets', 'read'),
(140, 'Update Assets - tools, assets, devices', 'assetsmgt', 'assets', 'update'),
(141, 'Delete Assets - tools, assets, devices', 'assetsmgt', 'assets', 'delete'),
(142, 'Export Assets - tools, assets, devices', 'assetsmgt', 'assets', 'export'),
(143, 'Submit Assets - tools, assets, devices', 'assetsmgt', 'assets', 'submit'),
(144, 'Upload Assets - tools, assets, devices', 'assetsmgt', 'assets', 'upload'),
(145, 'Share Assets - tools, assets, devices', 'assetsmgt', 'assets', 'share'),
(146, 'Send Assets - tools, assets, devices', 'assetsmgt', 'assets', 'send'),
(147, 'Create Asset Assignments', 'assetsmgt', 'asset_assignments', 'create'),
(148, 'Read Asset Assignments', 'assetsmgt', 'asset_assignments', 'read'),
(149, 'Update Asset Assignments', 'assetsmgt', 'asset_assignments', 'update'),
(150, 'Delete Asset Assignments', 'assetsmgt', 'asset_assignments', 'delete'),
(151, 'Export Asset Assignments', 'assetsmgt', 'asset_assignments', 'export'),
(152, 'Submit Asset Assignments', 'assetsmgt', 'asset_assignments', 'submit'),
(153, 'Upload Asset Assignments', 'assetsmgt', 'asset_assignments', 'upload'),
(154, 'Share Asset Assignments', 'assetsmgt', 'asset_assignments', 'share'),
(155, 'Send Asset Assignments', 'assetsmgt', 'asset_assignments', 'send'),
(156, 'Create Asset Maintenance Logs', 'assetsmgt', 'asset_maintenance_logs', 'create'),
(157, 'Read Asset Maintenance Logs', 'assetsmgt', 'asset_maintenance_logs', 'read'),
(158, 'Update Asset Maintenance Logs', 'assetsmgt', 'asset_maintenance_logs', 'update'),
(159, 'Delete Asset Maintenance Logs', 'assetsmgt', 'asset_maintenance_logs', 'delete'),
(160, 'Export Asset Maintenance Logs', 'assetsmgt', 'asset_maintenance_logs', 'export'),
(161, 'Submit Asset Maintenance Logs', 'assetsmgt', 'asset_maintenance_logs', 'submit'),
(162, 'Upload Asset Maintenance Logs', 'assetsmgt', 'asset_maintenance_logs', 'upload'),
(163, 'Share Asset Maintenance Logs', 'assetsmgt', 'asset_maintenance_logs', 'share'),
(164, 'Send Asset Maintenance Logs Data ', 'assetsmgt', 'asset_maintenance_logs', 'send'),
(165, 'Create Asset Types', 'assetsmgt', 'asset_types', 'create'),
(166, 'Read Asset Types', 'assetsmgt', 'asset_types', 'read'),
(167, 'Update Asset Types', 'assetsmgt', 'asset_types', 'update'),
(168, 'Delete Asset Types', 'assetsmgt', 'asset_types', 'delete'),
(169, 'Export Asset Types', 'assetsmgt', 'asset_types', 'export'),
(170, 'Submit Asset Types', 'assetsmgt', 'asset_types', 'submit'),
(171, 'Upload Asset Types', 'assetsmgt', 'asset_types', 'upload'),
(172, 'Share Asset Types', 'assetsmgt', 'asset_types', 'share'),
(173, 'Send Asset Types Data ', 'assetsmgt', 'asset_types', 'send'),
(174, 'Create Attendance Records', 'attendances', 'attendance_records', 'create'),
(175, 'Read Attendance Records', 'attendances', 'attendance_records', 'read'),
(176, 'Manage Attendance Records', 'attendances', 'attendance_records', 'manage'),
(177, 'Export Attendance Records', 'attendances', 'attendance_records', 'export'),
(178, 'Submit Attendance Records', 'attendances', 'attendance_records', 'submit'),
(179, 'Upload Attendance Records', 'attendances', 'attendance_records', 'upload'),
(180, 'Share Attendance Records', 'attendances', 'attendance_records', 'share'),
(181, 'Send Attendance Records', 'attendances', 'attendance_records', 'send'),
(182, 'Delete Attendance Records', 'attendances', 'attendance_records', 'delete'),
(183, 'Create Attendance Sessions', 'attendances', 'attendance_sessions', 'create'),
(184, 'Read Attendance Sessions', 'attendances', 'attendance_sessions', 'read'),
(185, 'Update Attendance Sessions', 'attendances', 'attendance_sessions', 'update'),
(186, 'Delete Attendance Sessions', 'attendances', 'attendance_sessions', 'delete'),
(187, 'Export Attendance Sessions', 'attendances', 'attendance_sessions', 'export'),
(188, 'Submit Attendance Sessions', 'attendances', 'attendance_sessions', 'submit'),
(189, 'Upload Attendance Sessions', 'attendances', 'attendance_sessions', 'upload'),
(190, 'Share Attendance Sessions', 'attendances', 'attendance_sessions', 'share'),
(191, 'Send Attendance Sessions', 'attendances', 'attendance_sessions', 'send'),
(192, 'Create Campus_access_logs', 'attendances', 'campus_access_logs', 'create'),
(193, 'Read Campus_access_logs', 'attendances', 'campus_access_logs', 'read'),
(194, 'Update Campus_access_logs', 'attendances', 'campus_access_logs', 'update'),
(195, 'Delete Campus_access_logs', 'attendances', 'campus_access_logs', 'delete'),
(196, 'Export Campus_access_logs', 'attendances', 'campus_access_logs', 'export'),
(197, 'Submit Campus_access_logs', 'attendances', 'campus_access_logs', 'submit'),
(198, 'Upload Campus_access_logs', 'attendances', 'campus_access_logs', 'upload'),
(199, 'Share Campus_access_logs', 'attendances', 'campus_access_logs', 'share'),
(200, 'Send Campus_access_logs', 'attendances', 'campus_access_logs', 'send'),
(201, 'Create Attendance Policies', 'attendances', 'attendance_policies', 'create'),
(202, 'Read Attendance Policies', 'attendances', 'attendance_policies', 'read'),
(203, 'Update Attendance Policies', 'attendances', 'attendance_policies', 'update'),
(204, 'Delete Attendance Policies', 'attendances', 'attendance_policies', 'delete'),
(205, 'Export Attendance Policies', 'attendances', 'attendance_policies', 'export'),
(206, 'Submit Attendance Policies', 'attendances', 'attendance_policies', 'submit'),
(207, 'Upload Attendance Policies', 'attendances', 'attendance_policies', 'upload'),
(208, 'Share Attendance Policies', 'attendances', 'attendance_policies', 'share'),
(209, 'Send Attendance Policies', 'attendances', 'attendance_policies', 'send'),
(210, 'Create Leave_types', 'attendances', 'leave_types', 'create'),
(211, 'Read Leave_types', 'attendances', 'leave_types', 'read'),
(212, 'Update Leave_types', 'attendances', 'leave_types', 'update'),
(213, 'Delete Leave_types', 'attendances', 'leave_types', 'delete'),
(214, 'Export Leave_types', 'attendances', 'leave_types', 'export'),
(215, 'Submit Leave_types', 'attendances', 'leave_types', 'submit'),
(216, 'Upload Leave_types', 'attendances', 'leave_types', 'upload'),
(217, 'Share Leave_types', 'attendances', 'leave_types', 'share'),
(218, 'Send Leave_types', 'attendances', 'leave_types', 'send'),
(219, 'Create Leaves', 'attendances', 'leaves', 'create'),
(220, 'Read Leaves', 'attendances', 'leaves', 'read'),
(221, 'Update Leaves', 'attendances', 'leaves', 'update'),
(222, 'Delete Leaves', 'attendances', 'leaves', 'delete'),
(223, 'Export Leaves', 'attendances', 'leaves', 'export'),
(224, 'Submit Leaves', 'attendances', 'leaves', 'submit'),
(225, 'Upload Leaves', 'attendances', 'leaves', 'upload'),
(226, 'Share Leaves', 'attendances', 'leaves', 'share'),
(227, 'Send Leaves', 'attendances', 'leaves', 'send'),
(228, 'Read Report_attendance_summary', 'attendances', 'report_attendance_summary', 'read'),
(229, 'Read Report_attendance_summary', 'attendances', 'report_attendance_summary', 'share'),
(230, 'Read Report_attendance_summary', 'attendances', 'report_attendance_summary', 'send'),
(231, 'Read Report_attendance_summary', 'attendances', 'report_attendance_summary', 'export'),
(232, 'Read Report_leave_summary', 'attendances', 'report_leave_summary', 'read'),
(233, 'Read Report_leave_summary', 'attendances', 'report_leave_summary', 'share'),
(234, 'Read Report_leave_summary', 'attendances', 'report_leave_summary', 'send'),
(235, 'Read Report_leave_summary', 'attendances', 'report_leave_summary', 'export'),
(236, 'Read Report_Attendance_compliance', 'attendances', 'report_attendance_compliance', 'read'),
(237, 'Read Report_Attendance_compliance', 'attendances', 'report_attendance_compliance', 'share'),
(238, 'Read Report_Attendance_compliance', 'attendances', 'report_attendance_compliance', 'send'),
(239, 'Read Report_Attendance_compliance', 'attendances', 'report_attendance_compliance', 'export'),
(240, 'Manage Lesson Deliveries', 'academics', 'lesson_deliveries', 'manage'),
(241, 'View Lesson Deliveries', 'academics', 'lesson_deliveries', 'read'),
(242, 'Create Lesson Delivery', 'academics', 'lesson_deliveries', 'create'),
(243, 'Update Lesson Delivery', 'academics', 'lesson_deliveries', 'update'),
(244, 'Delete Lesson Delivery', 'academics', 'lesson_deliveries', 'delete')

   -- Add more permissions as needed for other modules and resources

ON CONFLICT (resource, action) DO UPDATE SET
  name = EXCLUDED.name,
  module = EXCLUDED.module;

--SELECT setval(pg_get_serial_sequence('public.permissions', 'id'), (SELECT MAX(id) FROM public.permissions));

-- REPORTING
/*
(85, 'View Dashboards', 'reporting', 'dashboards', 'read', 'Access analytics dashboards', true, NOW(), NULL, NOW(), NULL, false, NULL, NULL),
(86, 'Export Dashboards', 'reporting', 'dashboards', 'export', 'Download dashboard data', true, NOW(), NULL, NOW(), NULL, false, NULL, NULL),
(87, 'View Activity Feed', 'reporting', 'activity_feed', 'read', 'Monitor system activity log', true, NOW(), NULL, NOW(), NULL, false, NULL, NULL),
(88, 'View Audit Logs', 'reporting', 'auditlogs', 'read', 'Review security and change logs', true, NOW(), NULL, NOW(), NULL, false, NULL, NULL),
(89, 'Manage KPI Definitions', 'reporting', 'kpi_definitions', 'manage', 'Set key performance indicators', true, NOW(), NULL, NOW(), NULL, false, NULL, NULL),
(90, 'View Teacher Effectiveness Report', 'reporting', 'teacher_effectiveness', 'read', 'Access performance evaluation metrics for teachers', true, NOW(), NULL, NOW(), NULL, false, NULL, NULL),
(91, 'Read Assignment', 'academics', 'assignments', 'read', 'Read assignments', true, NOW(), NULL, NOW(), NULL, false, NULL, NULL);
*/

--- Roles seed data

INSERT INTO "public"."roles" (
    "id", "code", "module", "name", "description", "is_system",
    "created_at", "created_by", "updated_at", "updated_by",
    "is_deleted", "deleted_at", "deleted_by"
) VALUES
-- Leadership
(1,  '100', 'Leadership',           'Principal / Head of School',              'Top executive responsible for the strategic and operational lead of the institution.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(2,  '101', 'Leadership',           'Vice Principal(s)',                       'Executive leads for Academics, Student Affairs, or Operations.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(3,  '102', 'Leadership',           'School Board Member',                     'Governance officer responsible for policy oversight and financial sustainability.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(4,  '103', 'Leadership',           'Executive Director',                      'System-wide leader for private or charter school networks.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(5,  '104', 'Leadership',           'Accreditation Coordinator',               'Compliance specialist ensuring the school meets national/international standards.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Academics
(6,  '105', 'Academics',            'Classroom Teacher',                       'Lead educator for primary/elementary levels, managing core curriculum.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(7,  '106', 'Academics',            'Subject Teacher',                         'Specialist instructor for secondary disciplines (Math, Science, etc.).', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(8,  '107', 'Academics',            'Special Education Teacher',               'Specialist for students with diverse learning and physical needs.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(9,  '108', 'Academics',            'ESL / ELL Instructor',                    'Language support specialist for non-native speakers.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(10, '109', 'Academics',            'Gifted & Talented Coordinator',           'Manager of enrichment programs for high-achieving students.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(11, '110', 'Academics',            'Instructional Coach',                     'Mentor focused on improving teacher pedagogy and classroom outcomes.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(12, '111', 'Academics',            'Department Head / Lead',                  'Administrative lead for a specific academic subject area.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(13, '112', 'Academics',            'Substitute Teacher',                      'Temporary instructional staff for short-term classroom coverage.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Curriculum
(14, '113', 'Curriculum',           'Curriculum Developer',                    'Designer of educational programs and learning frameworks.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(15, '114', 'Curriculum',           'Assessment Coordinator',                  'Manager of standardized testing and internal examination data.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(16, '115', 'Curriculum',           'Educational Technologist',                 'Specialist in digital learning platforms and classroom tech integration.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(17, '116', 'Curriculum',           'Learning Support Specialist',             'Targeted interventionist for students requiring academic assistance.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(18, '117', 'Curriculum',           'Data Analyst',                            'Specialist in student performance metrics and academic reporting.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Student Support
(19, '118', 'Student_Support',      'School Counselor',                        'Provider of academic, career, and social-emotional guidance.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(20, '119', 'Student_Support',      'School Psychologist',                     'Clinical mental health professional focusing on learning and behavior.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(21, '120', 'Student_Support',      'Social Worker',                           'Liaison between families, the school, and social welfare services.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(22, '121', 'Student_Support',      'Behavior Interventionist',                'Specialist in managing and improving student behavioral outcomes.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(23, '122', 'Student_Support',      'Attendance Officer',                      'Manager of student presence records and truancy intervention.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(24, '123', 'Student_Support',      'Mentor / Homeroom Advisor',               'Faculty member providing pastoral care to a specific student group.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Library
(25, '124', 'Library',              'Librarian / Media Specialist',            'Curator of physical and digital information resources.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(26, '125', 'Library',              'Library Assistant / Aide',                'Operational support for circulation and resource cataloging.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(27, '126', 'Library',              'Digital Resources Coordinator',           'Manager of online databases, e-books, and digital archives.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(28, '127', 'Library',              'Reading Specialist',                      'Literacy coach focused on student reading proficiency.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Nutrition Services
(29, '128', 'Nutrition_Services',   'Cafeteria Manager',                       'Lead for food procurement, kitchen staff, and hygiene compliance.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(30, '129', 'Nutrition_Services',   'School Cook / Chef',                      'Professional responsible for meal preparation and safety.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(31, '130', 'Nutrition_Services',   'Cafeteria Assistant',                     'Support staff for food service and kitchen operations.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(32, '131', 'Nutrition_Services',   'Nutritionist / Dietitian',                'Specialist ensuring meals meet health and dietary standards.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(33, '132', 'Nutrition_Services',   'Food Safety Officer',                     'Inspector ensuring strict adherence to health and safety codes.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Sports
(34, '133', 'Sports',               'Physical Education Teacher',              'Instructor for health, fitness, and physical movement.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(35, '134', 'Sports',               'Athletic Director',                       'Administrator for all sports programs and coaching staff.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(36, '135', 'Sports',               'Sports Coach',                            'Instructional lead for specific teams (Soccer, Basketball, etc.).', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(37, '136', 'Sports',               'Strength Coach',                          'Specialist in physical conditioning and athlete development.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(38, '137', 'Sports',               'Athletic Trainer',                        'Healthcare professional for injury prevention and first response.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(39, '138', 'Sports',               'Equipment Manager',                       'Coordinator of athletic gear, uniforms, and facility inventory.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(40, '139', 'Sports',               'Scorekeeper / Referee',                   'Official for competitive games and athletic events.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Arts & Creative
(41, '140', 'Arts_Creative',        'Visual Arts Teacher',                     'Instructor for fine arts, painting, and studio disciplines.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(42, '141', 'Arts_Creative',        'Music / Band Director',                   'Lead for musical instruction and performance ensembles.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(43, '142', 'Arts_Creative',        'Drama / Theater Instructor',              'Instructor for performing arts and stage production.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(44, '143', 'Arts_Creative',        'Dance Instructor',                        'Instructor for movement and choreography.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(45, '144', 'Arts_Creative',        'Art Technician',                          'Studio manager responsible for materials and equipment upkeep.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Technology
(46, '145', 'Technology',           'IT Director / SysAdmin',                  'Lead for network infrastructure and enterprise IT strategy.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(47, '146', 'Technology',           'Network Administrator',                   'Specialist managing connectivity, servers, and hardware.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(48, '147', 'Technology',           'EdTech Integrationist',                   'Specialist helping faculty use technology in the classroom.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(49, '148', 'Technology',           'Lab Technician',                          'Front-line support for student computer lab environments.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(50, '149', 'Technology',           'AV Support Staff',                        'Technician for audio-visual equipment and event production.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(51, '150', 'Technology',           'Cybersecurity Officer',                   'Specialist focused on data protection and network integrity.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Facilities
(52, '151', 'Facilities',           'Facilities Manager',                      'Head of physical plant operations and building maintenance.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(53, '152', 'Facilities',           'Maintenance Technician',                  'Specialist in electrical, plumbing, or HVAC systems.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(54, '153', 'Facilities',           'Custodian / Janitor',                     'Staff responsible for campus cleanliness and sanitation.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(55, '154', 'Facilities',           'Groundskeeper / Gardener',                'Professional maintaining campus landscaping and outdoor areas.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(56, '155', 'Facilities',           'Health & Safety Officer',                 'Lead for workplace safety and fire regulation compliance.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(57, '156', 'Facilities',           'Sustainability Coordinator',              'Specialist managing waste reduction and green initiatives.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Security
(58, '157', 'Security',             'Security Guard',                          'On-site officer for access control and campus monitoring.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(59, '158', 'Security',             'Resource Officer (SRO)',                  'Law enforcement liaison within the school environment.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(60, '159', 'Security',             'Emergency Coordinator',                   'Planner for disaster recovery and safety drills.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(61, '160', 'Security',             'CCTV Monitor',                            'Staff focused on surveillance and security technology.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Admissions
(62, '161', 'Admissions',           'Admissions Director',                     'Lead for student recruitment strategy and enrollment targets.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(63, '162', 'Admissions',           'Enrollment Officer',                      'Manager of the administrative application pipeline.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(64, '163', 'Admissions',           'Registrar',                               'Official guardian of student records, transcripts, and schedules.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(65, '164', 'Admissions',           'Admissions Assistant',                    'Support staff for tours, applications, and intake events.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Finance
(66, '165', 'Finance',              'Business Manager / CFO',                  'Executive lead for budgeting, audits, and financial strategy.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(67, '166', 'Finance',              'Accountant / Bookkeeper',                 'Manager of day-to-day ledgers and financial reporting.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(68, '167', 'Finance',              'Payroll Officer',                         'Specialist in staff compensation and benefits administration.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(69, '168', 'Finance',              'Procurement Officer',                     'Manager of purchasing, vendor contracts, and school supplies.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(70, '169', 'Finance',              'Grant Writer',                            'Specialist in securing external funding and donations.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- HR
(71, '170', 'Hr',                   'HR Manager / Director',                   'Lead for recruitment, employee relations, and policy.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(72, '171', 'Hr',                   'Recruitment Officer',                     'Specialist in staff sourcing and onboarding workflows.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(73, '172', 'Hr',                   'Training Coordinator',                    'Manager of professional development and staff certifications.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(74, '173', 'Hr',                   'Employee Relations Officer',              'Liaison for staff disputes, performance, and workplace culture.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Communications
(75, '174', 'Communications',       'Communications Director',                 'Lead for school branding and external media relations.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(76, '175', 'Communications',       'Public Relations Officer',                'Coordinator of press releases and community perception.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(77, '176', 'Communications',       'Social Media Manager',                    'Coordinator of digital content and community engagement.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(78, '177', 'Communications',       'Graphic Designer',                        'Visual content creator for school marketing and reports.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(79, '178', 'Communications',       'Alumni Coordinator',                      'Manager of relationships with former students and graduates.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Transportation
(80, '179', 'Transportation',       'Transportation Coordinator',              'Manager of bus routes, scheduling, and driver logistics.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(81, '180', 'Transportation',       'School Bus Driver',                       'Licensed operator for safe student transit.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(82, '181', 'Transportation',       'Bus Monitor / Attendant',                 'Staff responsible for student safety during transit.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(83, '182', 'Transportation',       'Fleet Technician',                        'Specialist in maintaining school vehicles and buses.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Health Services
(84, '183', 'health_services',      'School Nurse',                            'Clinical provider for student injuries and health records.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(85, '184', 'health_services',      'Health Educator',                         'Instructor focused on wellness and preventative health.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(86, '185', 'health_services',      'Mental Health Counselor',                 'Specialist providing psychological support and therapy.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(87, '186', 'health_services',      'Screening Technician',                    'Specialist for vision, hearing, and health assessments.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Extracurricular
(88, '187', 'Extracurricular',      'Clubs Coordinator',                       'Manager of after-school activities and student organizations.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(89, '188', 'Extracurricular',      'Student Council Advisor',                 'Mentor for student government and leadership initiatives.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(90, '189', 'Extracurricular',      'STEM / Robotics Coach',                   'Instructor for specialized extracurricular clubs.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(91, '190', 'Extracurricular',      'Yearbook Advisor',                        'Lead for the production of the annual school yearbook.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(92, '191', 'Extracurricular',      'Chaperone',                               'Staff or volunteer supervising off-campus trips and events.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Community
(93,  '192', 'Community',            'Parent Liaison',                          'Facilitator of communication between school and families.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(94,  '193', 'Community',            'Volunteer Coordinator',                   'Manager of parent and community volunteer programs.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(95,  '194', 'Community',            'Partnerships Manager',                    'Liaison for corporate and local community collaborations.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- Boarding Life
(96,  '195', 'Boarding Life',        'Dormitory / House Parent',                'Residential mentor providing 24/7 pastoral care.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(97,  '196', 'Boarding_Life',        'Res-Life Coordinator',                    'Administrator of boarding house programs and logistics.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(98,  '197', 'Boarding_Life',        'Night Supervisor',                        'Staff responsible for student safety during evening hours.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(99,  '198', 'Boarding_Life',        'Housekeeping Staff',                      'Staff responsible for residential laundry and cleaning.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),

-- External Stakeholders
(100, '199', 'Vendors',              'Vendors',                                 'external businesses or individuals contracted to provide goods or services:', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(101, '200', 'Parents',              'Parents/guardians',                       'Parents and guardians of student(s)', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(102, '201', 'Volunteers',           'Volunteers',                              'Local residents offering time/skills (e.g., tutoring, mentoring).', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(103, '202', 'Partners',             'Experts',                                 'Experts in STEM, arts, career fields, etc.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(104, '203', 'Community_services',   'Health & community services',             'Provide immunizations or health screenings  or other kind of services', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(105, '204', 'Inspections',          'Compliance experts',                      'Conduct program reviews or audits from Ministry of Education or regional or international bodies', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(106, '205', 'Media',                'Media & PR',                              'Cover school events or achievements.', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(107, '206', 'Alumni',               'Alumnis',                                 'Alumni Association Members ', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(108, '207', 'System',               'System Admin',                            'System-wide settings and setups', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(109, '208', 'studentsmgt',             'studentsmgt',                                'Cover students access', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL),
(110, '209', 'School',               'Admin',                                   'School Administration of the system', 'false', '2026-01-19 08:09:44.263709+00', NULL, '2026-01-19 08:09:44.263709+00', NULL, 'false', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

--- Role_Permissions Seed Data ---

INSERT INTO public.role_permissions (
    role_id, permission_key, school_id, is_active, created_by, updated_by
)
SELECT 
    r.id,
    p.permission_key,              -- ✅ permission_key from permissions table
    s.id,
    TRUE,
    1,
    1
FROM (
    VALUES
    -- School 10001: Nakwero Secondary School
    (100, 'students.create', 10001),
    (100, 'students.read', 10001),
    (100, 'students.update', 10001),
    (100, 'students.delete', 10001),
    (100, 'students.promote', 10001),
    (100, 'enrollments.manage', 10001),
    (100, 'staff.create', 10001),
    (100, 'staff.read', 10001),
    (100, 'staff.update', 10001),
    (100, 'staff.delete', 10001),
    (100, 'staffmgt_roles.manage', 10001),
    (100, 'class.create', 10001),
    (100, 'class.read', 10001),
    (100, 'subjects.manage', 10001),
    (100, 'curriculum.manage', 10001),
    (100, 'grade_levels.manage', 10001),
    (100, 'term.manage', 10001),
    (100, 'academic_years.manage', 10001),
    (100, 'exams.manage', 10001),
    (100, 'assessment_results.manage', 10001),
    (100, 'gradebook.read', 10001),
    (100, 'student_report.read', 10001),
    (100, 'assessment_calendar.read', 10001),
    (100, 'report_cards.read', 10001),
    (100, 'report_cards.export', 10001),
    (100, 'attendance_status.manage', 10001),
    (100, 'schools.manage', 10001),
    (100, 'settings.manage', 10001),
    (100, 'locations.manage', 10001),
    (100, 'dashboard.read', 10001),
    (100, 'auditlogs.read', 10001),

    -- Vice Principal (101)
    (101, 'students.read', 10001),
    (101, 'students.update', 10001),
    (101, 'students.promote', 10001),
    (101, 'enrollments.manage', 10001),
    (101, 'staff.read', 10001),
    (101, 'staff.update', 10001),
    (101, 'staffmgt_roles.manage', 10001),
    (101, 'class.read', 10001),
    (101, 'class.assign_student', 10001),
    (101, 'subjects.manage', 10001),
    (101, 'grade_levels.manage', 10001),
    (101, 'term.manage', 10001),
    (101, 'assessment.approve', 10001),
    (101, 'report_cards.read', 10001),
    (101, 'attendance.record', 10001),
    (101, 'lesson.manage', 10001),
    (101, 'timetable.manage', 99999),
    -- Registrar (163)
    (163, 'students.create', 10001),
    (163, 'students.read', 10001),
    (163, 'students.update', 10001),
    (163, 'students.delete', 10001),
    (163, 'enrollments.manage', 10001),
    (163, 'class.read', 10001),
    (163, 'class.assign_student', 10001),
    (163, 'report_cards.read', 10001),
    (163, 'report_cards.export', 10001),
    (163, 'attendance.read', 10001),
    (163, 'attendance.record', 10001),

    -- Classroom Teacher (105)
    (105, 'students.read', 10001),
    (105, 'class.read', 10001),
    (105, 'assessments.create', 10001),
    (105, 'assessments.read', 10001),
    (105, 'assessments.update', 10001),
    (105, 'assessment_results.read', 10001),
    (105, 'assessment_results.create', 10001),
    (105, 'assessment_results.update', 10001),
    (105, 'exam_results.read', 10001),
    (105, 'attendance.record', 10001),
    (105, 'assignments.create', 10001),
    (105, 'assignments.grade', 10001),

    -- Subject Teacher (106) – same as above
    (106, 'students.read', 10001),
    (106, 'class.read', 10001),
    (106, 'assessments.create', 10001),
    (106, 'assessments.read', 10001),
    (106, 'assessments.update', 10001),
    (106, 'exam_results.read', 10001),
    (106, 'attendances.record', 10001),
    (106, 'assignments.create', 10001),
    (106, 'assignments.grade', 10001),

    -- IT Director / SysAdmin (145)
    (145, 'settings.manage', 10001),
    (145, 'custom_fields.manage', 10001),
    (145, 'contact_types.manage', 10001),
    (145, 'relationship_types.manage', 10001),
    (145, 'genders.manage', 10001),
    (145, 'locations.manage', 10001),
    (145, 'buckets.manage', 10001),
    (145, 'objects.upload', 10001),
    (145, 'objects.read', 10001),
    (145, 'objects.delete', 10001),
    (145, 'secrets.manage', 10001),
    (145, 'api_keys.manage', 10001),
    (145, 'integrations.manage', 10001),
    (145, 'webhooks.manage', 10001),
    (145, 'workflows.manage', 10001),

    -- Admissions Director (161)
    (161, 'enquiries.manage', 10001),
    (161, 'enquiries.read', 10001),
    (161, 'students.create', 10001),
    (161, 'enrollments.manage', 10001),

    -- HR Manager (170)
    (170, 'staff.create', 10001),
    (170, 'staff.read', 10001),
    (170, 'staff.update', 10001),
    (170, 'staff.delete', 10001),
    (170, 'staff.promote', 10001),
    (170, 'staffmgt_roles.manage', 10001),
    (170, 'departments.manage', 10001),
    (170, 'employment_types.manage', 10001),
    (170, 'education_levels.manage', 10001),

    -- Business Manager / CFO (165)
    (165, 'dashboard.read', 10001),
    (165, 'dashboard.export', 10001),
    (165, 'kpi.manage', 10001),

    -- === School 10002: Kampala International Academy ===
    (100, 'students.create', 10002),
    (100, 'students.read', 10002),
    (100, 'students.update', 10002),
    (100, 'students.delete', 10002),
    (100, 'students.promote', 10002),
    (100, 'enrollments.manage', 10002),
    (100, 'staff.create', 10002),
    (100, 'staff.read', 10002),
    (100, 'staff.update', 10002),
    (100, 'staff.delete', 10002),
    (100, 'staffmgt_roles.manage', 10002),
    (100, 'class.create', 10002),
    (100, 'class.read', 10002),
    (100, 'subjects.manage', 10002),
    (100, 'curriculum.manage', 10002),
    (100, 'grade_levels.manage', 10002),
    (100, 'terms.manage', 10002),
    (100, 'exams.manage', 10002),
    (100, 'report_cards.read', 10002),
    (100, 'report_cards.export', 10002),
    (100, 'attendance_status.manage', 10002),
    (100, 'schools.manage', 10002),
    (100, 'settings.manage', 10002),
    (100, 'locations.manage', 10002),
    (100, 'dashboard.read', 10002),
    (100, 'audit.read', 10002),

    (101, 'students.read', 10002),
    (101, 'students.update', 10002),
    (101, 'students.promote', 10002),
    (101, 'enrollments.manage', 10002),
    (101, 'staff.read', 10002),
    (101, 'staff.update', 10002),
    (101, 'staffmgt_roles.manage', 10002),
    (101, 'class.read', 10002),
    (101, 'class.assign_student', 10002),
    (101, 'subjects.manage', 10002),
    (101, 'grade_levels.manage', 10002),
    (101, 'terms.manage', 10002),
    (101, 'assessments.approve', 10002),
    (101, 'report_cards.read', 10002),
    (101, 'attendance.record', 10002),
    (101, 'lesson.manage', 10002),
    (101, 'timetable.manage', 10002),

    (163, 'students.create', 10002),
    (163, 'students.read', 10002),
    (163, 'students.update', 10002),
    (163, 'students.delete', 10002),
    (163, 'enrollments.manage', 10002),
    (163, 'class.read', 10002),
    (163, 'class.assign_student', 10002),
    (163, 'report_cards.read', 10002),
    (163, 'report_cards.export', 10002),
    (163, 'attendance.read', 10002),
    (163, 'attendance.record', 10002),

    (105, 'students.read', 10002),
    (105, 'class.read', 10002),
    (105, 'assessments.create', 10002),
    (105, 'assessments.read', 10002),
    (105, 'assessments.update', 10002),
    (105, 'exam_results.read', 10002),
    (105, 'attendance.record', 10002),
    (105, 'assignment.create', 10002),
    (105, 'assignment.grade', 10002),

    (106, 'students.read', 10002),
    (106, 'class.read', 10002),
    (106, 'assessments.create', 10002),
    (106, 'assessments.read', 10002),
    (106, 'assessments.update', 10002),
    (106, 'exam_results.read', 10002),
    (106, 'attendance.record', 10002),
    (106, 'assignment.create', 10002),
    (106, 'assignment.grade', 10002),

    (145, 'settings.manage', 10002),
    (145, 'custom_fields.manage', 10002),
    (145, 'contact_types.manage', 10002),
    (145, 'relationship_types.manage', 10002),
    (145, 'genders.manage', 10002),
    (145, 'locations.manage', 10002),
    (145, 'buckets.manage', 10002),
    (145, 'objects.upload', 10002),
    (145, 'objects.read', 10002),
    (145, 'objects.delete', 10002),
    (145, 'secrets.manage', 10002),
    (145, 'api_keys.manage', 10002),
    (145, 'integration.manage', 10002),
    (145, 'webhooks.manage', 10002),
    (145, 'workflows.manage', 10002),

    (161, 'enquiries.manage', 10002),
    (161, 'enquiries.read', 10002),
    (161, 'students.create', 10002),
    (161, 'enrollments.manage', 10002),

    (170, 'staff.create', 10002),
    (170, 'staff.read', 10002),
    (170, 'staff.update', 10002),
    (170, 'staff.delete', 10002),
    (170, 'staff.promote', 10002),
    (170, 'staffmgt_roles.manage', 10002),
    (170, 'departments.manage', 10002),
    (170, 'employment_types.manage', 10002),
    (170, 'education_levels.manage', 10002),

    (165, 'dashboard.read', 10002),
    (165, 'dashboard.export', 10002),
    (165, 'kpi.manage', 10002),

    -- === School 10003: Mbarara High School ===
    (100, 'students.create', 10003),
    (100, 'students.read', 10003),
    (100, 'students.update', 10003),
    (100, 'students.delete', 10003),
    (100, 'students.promote', 10003),
    (100, 'enrollments.manage', 10003),
    (100, 'staff.create', 10003),
    (100, 'staff.read', 10003),
    (100, 'staff.update', 10003),
    (100, 'staff.delete', 10003),
    (100, 'staffmgt_roles.manage', 10003),
    (100, 'class.create', 10003),
    (100, 'class.read', 10003),
    (100, 'subjects.manage', 10003),
    (100, 'curriculum.manage', 10003),
    (100, 'grade_levels.manage', 10003),
    (100, 'terms.manage', 10003),
    (100, 'exams.manage', 10003),
    (100, 'report_cards.read', 10003),
    (100, 'report_cards.export', 10003),
    (100, 'attendance_status.manage', 10003),
    (100, 'school.manage', 10003),
    (100, 'setting.manage', 10003),
    (100, 'location.manage', 10003),
    (100, 'dashboard.read', 10003),
    (100, 'audit.read', 10003),

    (101, 'students.read', 10003),
    (101, 'students.update', 10003),
    (101, 'students.promote', 10003),
    (101, 'enrollments.manage', 10003),
    (101, 'staff.read', 10003),
    (101, 'staff.update', 10003),
    (101, 'staffmgt_roles.manage', 10003),
    (101, 'class.read', 10003),
    (101, 'class.assign_student', 10003),
    (101, 'subjects.manage', 10003),
    (101, 'grade_levels.manage', 10003),
    (101, 'terms.manage', 10003),
    (101, 'assessments.approve', 10003),
    (101, 'report_cards.read', 10003),
    (101, 'attendance.record', 10003),
    (101, 'lesson.manage', 10003),
    (101, 'timetable.manage', 10003),

    (163, 'students.create', 10003),
    (163, 'students.read', 10003),
    (163, 'students.update', 10003),
    (163, 'students.delete', 10003),
    (163, 'enrollments.manage', 10003),
    (163, 'class.read', 10003),
    (163, 'class.assign_student', 10003),
    (163, 'report_cards.read', 10003),
    (163, 'report_cards.export', 10003),
    (163, 'attendances.read', 10003),
    (163, 'attendances.record', 10003),

    (105, 'students.read', 10003),
    (105, 'class.read', 10003),
    (105, 'assessments.create', 10003),
    (105, 'assessments.read', 10003),
    (105, 'assessments.update', 10003),
    (105, 'exam_results.read', 10003),
    (105, 'attendances.record', 10003),
    (105, 'assignments.create', 10003),
    (105, 'assignments.grade', 10003),

    (106, 'students.read', 10003),
    (106, 'class.read', 10003),
    (106, 'assessments.create', 10003),
    (106, 'assessments.read', 10003),
    (106, 'assessments.update', 10003),
    (106, 'exam_results.read', 10003),
    (106, 'attendances.record', 10003),
    (106, 'assignments.create', 10003),
    (106, 'assignments.grade', 10003),

    (145, 'settings.manage', 10003),
    (145, 'custom_fields.manage', 10003),
    (145, 'contact_types.manage', 10003),
    (145, 'relationship_types.manage', 10003),
    (145, 'genders.manage', 10003),
    (145, 'locations.manage', 10003),
    (145, 'buckets.manage', 10003),
    (145, 'objects.upload', 10003),
    (145, 'objects.read', 10003),
    (145, 'objects.delete', 10003),
    (145, 'secrets.manage', 10003),
    (145, 'api_keys.manage', 10003),
    (145, 'integrations.manage', 10003),
    (145, 'webhooks.manage', 10003),
    (145, 'workflows.manage', 10003),

    (161, 'enquiries.manage', 10003),
    (161, 'enquiries.read', 10003),
    (161, 'students.create', 10003),
    (161, 'enrollments.manage', 10003),

    (170, 'staff.create', 10003),
    (170, 'staff.read', 10003),
    (170, 'staff.update', 10003),
    (170, 'staff.delete', 10003),
    (170, 'staff.promote', 10003),
    (170, 'staffmgt_roles.manage', 10003),
    (170, 'departments.manage', 10003),
    (170, 'employment_types.manage', 10003),
    (170, 'education_levels.manage', 10003),

    (165, 'dashboard.read', 10003),
    (165, 'dashboard.export', 10003),
    (165, 'kpi.manage', 10003)

) AS input(role_code, perm_code, school_id)
JOIN public.roles r ON r.code = input.role_code
JOIN public.permissions p ON p.resource = input.perm_code   -- ✅ match text to resource
JOIN public.schools s ON s.id = input.school_id
ON CONFLICT (role_id, permission_key, school_id) DO NOTHING;

--- ============================================
-- Seed baseline users for schools
-- ============================================

INSERT INTO public.users (
    school_id, username, email, phone, password,
    first_name, last_name, date_of_birth, nationality,
    role_id, is_active, created_by, updated_by,
    auth_uid -- Added this to fix the "Ghost" user issue
)
SELECT s.id, input.username, input.email, input.phone, input.password,
       input.first_name, input.last_name, input.date_of_birth, input.nationality,
       r.id, input.is_active, input.created_by, input.updated_by,
       gen_random_uuid() -- Generates a unique identity for RLS to use
FROM (VALUES
    -- Nakwero Secondary School (10001)
    (10001, 'principal_nss', 'principal@nakwero.edu.ug', '+256700000001',
     crypt('Password123!', gen_salt('bf')),
     'Grace', 'Nankunda', DATE '1975-03-12', 'Ugandan', 100, TRUE, 1, 1),
    (10001, 'vp_nss', 'vp@nakwero.edu.ug', '+256700000002',
     crypt('Password123!', gen_salt('bf')),
     'James', 'Okello', DATE '1980-07-22', 'Ugandan', 101, TRUE, 1, 1),
    (10001, 'teacher1_nss', 'teacher1@nakwero.edu.ug', '+256700000003',
     crypt('Password123!', gen_salt('bf')),
     'Sarah', 'Kato', DATE '1990-01-15', 'Ugandan', 105, TRUE, 1, 1),
    (10001, 'student1_nss', 'student1@nakwero.edu.ug', '+256700000004',
     crypt('Password123!', gen_salt('bf')),
     'Daniel','Lutaaya', DATE '2008-05-18', 'Ugandan', 300, TRUE, 1, 1),

    -- Kampala International Academy (10002)
    (10002, 'principal_kia', 'principal@kia.ac.ug', '+256700000005',
     crypt('Password123!', gen_salt('bf')),
     'Henry', 'Mukasa', DATE '1972-09-30', 'Ugandan', 100, TRUE, 1, 1),
    (10002, 'vp_kia', 'vp@kia.ac.ug', '+256700000006',
     crypt('Password123!', gen_salt('bf')),
     'Rose', 'Namatovu', DATE '1981-04-10', 'Ugandan', 101, TRUE, 1, 1),
    (10002, 'teacher1_kia', 'teacher@kia.ac.ug', '+256700000007',
     crypt('Password123!', gen_salt('bf')),
     'David', 'Ssemboga', DATE '1989-06-25', 'Ugandan', 105, TRUE, 1, 1),
    (10002, 'student1_kia', 'student1@kia.ac.ug', '+256700000008',
     crypt('Password123!', gen_salt('bf')),
     'Maria', 'Najjemba', DATE '2009-02-14', 'Ugandan', 300, TRUE, 1, 1),

    -- Mbarara High School (10003)
    (10003, 'principal_mhs', 'principal@mbararahigh.sc.ug', '+256700000009',
     crypt('Password123!', gen_salt('bf')),
     'Samuel','Atwine', DATE '1970-12-05', 'Ugandan', 100, TRUE, 1, 1),
    (10003, 'vp_mhs', 'vp@mbararahigh.sc.ug', '+256700000010',
     crypt('Password123!', gen_salt('bf')),
     'Agnes', 'Tumusiime', DATE '1983-08-19','Ugandan', 101, TRUE, 1, 1),
    (10003, 'teacher1_mhs', 'teacher1@mbararahigh.sc.ug', '+256700000011',
     crypt('Password123!', gen_salt('bf')),
     'Peter', 'Kanyesigye', DATE '1991-11-30','Ugandan', 105, TRUE, 1, 1),
    (10003, 'student1_mhs', 'student1@mbararahigh.sc.ug', '+256700000012',
     crypt('Password123!', gen_salt('bf')),
     'Annet', 'Akello', DATE '2007-07-07','Ugandan', 300, TRUE, 1, 1)
) AS input(
    school_id, username, email, phone, password,
    first_name, last_name, date_of_birth, nationality,
    role_code, is_active, created_by, updated_by
)
JOIN public.roles r ON r.code = input.role_code
JOIN public.schools s ON s.id = input.school_id
ON CONFLICT (username) DO UPDATE 
SET auth_uid = COALESCE(public.users.auth_uid, EXCLUDED.auth_uid),
    school_id = EXCLUDED.school_id;
-- Seed user_roles based on the above users and their role_codes

INSERT INTO public.user_roles (
    user_id, role_id, school_id, is_active, created_by, updated_by
)
SELECT u.id, r.id, s.id, TRUE, 1, 1
FROM (VALUES
    -- Nakwero Secondary School (10001)
    ('principal_nss', 100, 10001),
    ('vp_nss',        101, 10001),
    ('teacher1_nss',  105, 10001),
    ('student1_nss',  300, 10001),

    -- Kampala International Academy (10002)
    ('principal_kia', 100, 10002),
    ('vp_kia',        101, 10002),
    ('teacher1_kia',  105, 10002),
    ('student1_kia',  300, 10002),

    -- Mbarara High School (10003)
    ('principal_mhs', 100, 10003),
    ('vp_mhs',        101, 10003),
    ('teacher1_mhs',  105, 10003),
    ('student1_mhs',  300, 10003)

) AS input(username, role_code, school_id)
JOIN public.users u ON u.username = input.username
JOIN public.roles r ON r.code = input.role_code
JOIN public.schools s ON s.id = input.school_id
ON CONFLICT (user_id, role_id, school_id) DO NOTHING;



-- Seed Academic Years for Nakwero Secondary School (10001)
INSERT INTO public.academic_years (
  school_id, name, start_date, end_date, is_current, is_active, created_by
) VALUES
(10001, '2024 Academic Year', '2024-01-15', '2024-12-15', false, true, 1),
(10001, '2025 Academic Year', '2025-01-15', '2025-12-15', true, true, 1)
ON CONFLICT (school_id, name) DO NOTHING;

-- Seed Academic Years for Kampala International Academy (10002)
INSERT INTO public.academic_years (
  school_id, name, start_date, end_date, is_current, is_active, created_by
) VALUES
(10002, '2024 Academic Year', '2024-02-01', '2024-11-30', false, true, 2),
(10002, '2025 Academic Year', '2025-02-01', '2025-11-30', true, true, 2)
ON CONFLICT (school_id, name) DO NOTHING;

-- Seed Academic Years for School 10003
INSERT INTO public.academic_years (
  school_id, name, start_date, end_date, is_current, is_active, created_by
) VALUES
(10003, '2024 Academic Year', '2024-03-01', '2024-12-01', false, true, 3),
(10003, '2025 Academic Year', '2025-03-01', '2025-12-01', true, true, 3)
ON CONFLICT (school_id, name) DO NOTHING;

-- ============================================
-- Seed baseline user_permissions
-- ============================================


/*
-- 2. PROFESSIONAL AUTO-ASSIGNMENT (School 1 Example)
-- This maps the permissions to the roles you defined from the image

-- A. Assign EVERYTHING to Principal (Role Code 1)
INSERT INTO public.role_permissions (role_id, permission_key, school_id)
SELECT 
    (SELECT id FROM roles WHERE code = 1 LIMIT 1),
    p.id,
    1
FROM permissions p
ON CONFLICT DO NOTHING;

-- B. Assign ACADEMIC permissions to Teachers (Role Code 7)
INSERT INTO public.role_permissions (role_id, permission_key, school_id)
SELECT 
    (SELECT id FROM roles WHERE code = 7 LIMIT 1),
    p.id,
    1
FROM permissions p
WHERE p.module IN ('studentsmgt', 'academics') 
  AND p.action IN ('read', 'create') -- Teachers usually can't delete
  AND p.resource NOT IN ('student.delete', 'class.delete')
ON CONFLICT DO NOTHING;

-- C. Assign ADMISSIONS permissions to Registrar (Role Code 64)
INSERT INTO public.role_permissions (role_id, permission_key, school_id)
SELECT 
    (SELECT id FROM roles WHERE code = 64 LIMIT 1),
    p.id,
    1
FROM permissions p
WHERE p.module IN ('studentsmgt', 'admissions', 'filesmgt')
ON CONFLICT DO NOTHING;

COMMIT;

*/


CREATE EXTENSION IF NOT EXISTS hstore;


-- 2. Flag 'read' and 'manage' actions as the primary sidebar entries
UPDATE public.route_permissions
SET is_menu_item = true 
WHERE action LIKE '%.read' OR action LIKE '%.manage';

-- 3. Assign Professional Icons based on Modules
UPDATE public.route_permissions SET icon = 'BookOpen' WHERE module = 'academics';
UPDATE public.route_permissions SET icon = 'Users' WHERE module = 'studentsmgt';
UPDATE public.route_permissions SET icon = '💼' WHERE module = 'staffmgt';
UPDATE public.route_permissions SET icon = '📁' WHERE module = 'filesmgt';
UPDATE public.route_permissions SET icon = '💬' WHERE module = 'communications';
UPDATE public.route_permissions SET icon = '⚙️' WHERE module = 'system';
UPDATE public.route_permissions SET icon = '📊' WHERE module = 'reporting';
UPDATE public.route_permissions SET icon = 'envelope' WHERE module = 'admissions';
UPDATE public.route_permissions SET icon = '☁️' WHERE module = 'storage';

-- 4. Set display_order for academics sidebar
UPDATE public.route_permissions SET display_order = 10  WHERE resource = 'dashboard'              AND module = 'academics';
UPDATE public.route_permissions SET display_order = 20  WHERE resource = 'classes'                AND module = 'academics';
UPDATE public.route_permissions SET display_order = 30  WHERE resource = 'timetables'             AND module = 'academics';
UPDATE public.route_permissions SET display_order = 40  WHERE resource = 'lessons'                AND module = 'academics';
UPDATE public.route_permissions SET display_order = 50  WHERE resource = 'assessments'            AND module = 'academics';
UPDATE public.route_permissions SET display_order = 60  WHERE resource = 'exams'                  AND module = 'academics';
UPDATE public.route_permissions SET display_order = 65  WHERE resource = 'exam_results'           AND module = 'academics';
UPDATE public.route_permissions SET display_order = 70  WHERE resource = 'assignments'            AND module = 'academics';
UPDATE public.route_permissions SET display_order = 80  WHERE resource = 'assignment_submissions' AND module = 'academics';
UPDATE public.route_permissions SET display_order = 90  WHERE resource = 'student_grades'         AND module = 'academics';
UPDATE public.route_permissions SET display_order = 100 WHERE resource = 'class_schedule'         AND module = 'academics';
UPDATE public.route_permissions SET display_order = 110 WHERE resource = 'report_cards'           AND module = 'academics';
UPDATE public.route_permissions SET display_order = 200 WHERE resource = 'academic_years'         AND module = 'academics';
UPDATE public.route_permissions SET display_order = 201 WHERE resource = 'terms'                  AND module = 'academics';
UPDATE public.route_permissions SET display_order = 202 WHERE resource = 'grade_levels'           AND module = 'academics';
UPDATE public.route_permissions SET display_order = 203 WHERE resource = 'subjects'               AND module = 'academics';
UPDATE public.route_permissions SET display_order = 204 WHERE resource = 'curricula'              AND module = 'academics';
UPDATE public.route_permissions SET display_order = 15  WHERE resource = 'academic_setup'         AND module = 'academics';

-- Insert classes_scheduling as a single menu item (like academic_setup, not a collapsible group)
INSERT INTO public.route_permissions (route, method, action, module, resource, permission_key, display_name, icon, is_menu_item, display_order, group_name)
VALUES ('/academics/classes_scheduling', 'GET', 'classes_scheduling.manage', 'academics', 'classes_scheduling', 'classes_scheduling.manage', 'Classroom Management', 'calendar', TRUE, 16, '_flat')
ON CONFLICT (route, method, action) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  icon = EXCLUDED.icon,
  is_menu_item = EXCLUDED.is_menu_item,
  display_order = EXCLUDED.display_order,
  group_name = EXCLUDED.group_name;

-- Fix permissions sequence to prevent duplicate key errors
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));

-- Insert assessments_grading permission first
INSERT INTO permissions (module, resource, action, name, description, is_active)
VALUES ('academics', 'assessments_grading', 'manage', 'Manage Assessments & Grading', 'Can manage assessments and grading', true)
ON CONFLICT (resource, action) DO UPDATE SET
  module = EXCLUDED.module,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Insert assessments_grading as a single menu item (like classes_scheduling, not a collapsible group)
INSERT INTO public.route_permissions (route, method, action, module, resource, permission_key, display_name, icon, is_menu_item, display_order, group_name)
VALUES ('/academics/assessments_grading', 'GET', 'assessments_grading.manage', 'academics', 'assessments_grading', 'assessments_grading.manage', 'Assessments & Grading', 'award', TRUE, 17, '_flat')
ON CONFLICT (route, method, action) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  icon = EXCLUDED.icon,
  is_menu_item = EXCLUDED.is_menu_item,
  display_order = EXCLUDED.display_order,
  group_name = EXCLUDED.group_name;

-- 5. Set group_name for academics sidebar grouping
UPDATE public.route_permissions SET group_name = '_flat' WHERE resource IN ('dashboard', 'academic_setup', 'classes_scheduling', 'assessments_grading') AND module = 'academics';
UPDATE public.route_permissions SET group_name = 'classes_scheduling' WHERE resource IN ('classes', 'timetables', 'lessons', 'lesson_deliveries') AND module = 'academics';
UPDATE public.route_permissions SET group_name = 'assessments_grading' WHERE resource IN ('assessments', 'exams', 'assignments') AND module = 'academics';
UPDATE public.route_permissions SET group_name = 'reports_analytics' WHERE resource IN ('report_cards', 'exam_results', 'assignment_submissions', 'class_schedule', 'student_grades') AND module = 'academics';

-- 6. Set is_menu_item: control sidebar visibility
UPDATE public.route_permissions SET is_menu_item = TRUE  WHERE resource IN ('dashboard', 'academic_setup', 'classes_scheduling', 'classes', 'timetables', 'assessments', 'exams', 'assignments') AND module = 'academics';
UPDATE public.route_permissions SET is_menu_item = FALSE WHERE resource IN ('management', 'academic_years', 'terms', 'grade_levels', 'subjects', 'curricula', 'streams', 'lessons', 'lesson_deliveries', 'report_cards', 'exam_results', 'assignment_submissions', 'class_schedule', 'student_grades') AND module = 'academics';

-- Seed users for every role in school_id = 10003
-- Password hash below is bcrypt for "Password123"
-- Replace with your own if needed

WITH staff_data (fname, lname, role_name) AS (
  VALUES 
    ('Bright', 'Ondury', 'Super Admin'),
    ('Sarah', 'Nansubuga', 'School Admin'),
    ('John', 'Mukasa', 'Teacher'),
    ('Alice', 'Namono', 'Bursar'),
    ('David', 'Okello', 'Registrar')
),
pwd AS (
  -- Using the hash you provided
  SELECT '$2y$10$xghSQ6Fpna.IfUcb8s1utu7xBEZvbykNaQ7L8bDDMVABIMw9CLuDi'::text AS hash
)
INSERT INTO public.users (
  school_id,
  auth_uid,
  username,
  email,
  phone,
  password,
  first_name,
  last_name,
  role_id,
  nationality,
  is_active
)
SELECT
  10003,
  NULL, -- ⬅️ Set to NULL so we can sync with real Supabase Auth later
  lower(s.fname || '.' || s.lname), -- e.g. bright.ondury
  lower(s.fname || '.' || s.lname || '@school.edu.ug'), -- e.g. bright.ondury@school.edu.ug
  '+256703' || floor(random() * 900000 + 100000)::text, -- Random Ugandan-style phone
  (SELECT hash FROM pwd),
  s.fname,
  s.lname,
  r.id,
  'Ugandan',
  true
FROM staff_data s
JOIN public.roles r ON r.name = s.role_name
ON CONFLICT (email) DO NOTHING;

--- ✅ Seed Script: Users + User Roles for school_id = 10003

-- Password hash for "Password123"

WITH pwd AS (
  SELECT '$2y$10$xghSQ6Fpna.IfUcb8s1utu7xBEZvbykNaQ7L8bDDMVABIMw9CLuDi'::text AS hash
)
INSERT INTO public.users (
  school_id,
  auth_uid,
  username,
  email,
  phone,
  password,
  first_name,
  last_name,
  date_of_birth,
  nationality,
  role_id,
  is_active,
  created_by,
  updated_by
)
SELECT
  10003,
  gen_random_uuid(),
  -- username: short, role name + id
  regexp_replace(lower(r.name), '[^a-z0-9]+', '', 'g') || r.id,
  -- email: role name + id, short domain
  regexp_replace(lower(r.name), '[^a-z0-9]+', '', 'g') || r.id || '@sch10003.ug',
  '+256701' || lpad(r.id::text, 3, '0'),
  (SELECT hash FROM pwd),
  split_part(r.name, ' ', 1),
  COALESCE(NULLIF(split_part(r.name, ' ', 2), ''), 'User'),
  '1990-01-01',
  'Ugandan',
  r.id,
  true,
  1,
  1
FROM public.roles r
ON CONFLICT (username, school_id) DO NOTHING;

--role permissions for school_id = 10003/2/1
-- ============================================
-- Seed Role Permissions (Randomized Sample)
-- ============================================

INSERT INTO public.role_permissions (role_id, permission_key, school_id)
VALUES
    -- Principal (Role Code 100): High-level Management & Oversight
    ((SELECT id FROM roles WHERE code = '100'), 'auditlogs_report.read', 10003),
    ((SELECT id FROM roles WHERE code = '100'), 'staff.promote', 10003),
    ((SELECT id FROM roles WHERE code = '100'), 'departments.manage', 10003),

    -- Classroom Teacher (Role Code 105): Academic & Student Interaction
    ((SELECT id FROM roles WHERE code = '105'), 'student_grades.read', 10003),
    ((SELECT id FROM roles WHERE code = '105'), 'attendances.record', 10003),
    ((SELECT id FROM roles WHERE code = '105'), 'assessments.create', 10003),
    ((SELECT id FROM roles WHERE code = '105'), 'class_schedule.read', 10003),

    -- IT Director / SysAdmin (Role Code 145): System Maintenance
    ((SELECT id FROM roles WHERE code = '145'), 'system_roleroute_access_view.read', 10003),
    ((SELECT id FROM roles WHERE code = '145'), 'auditroute_report.read', 10003),
    ((SELECT id FROM roles WHERE code = '145'), 'secrets.manage', 10003),

    -- Attendance Officer (Role Code 122): Specialized Student Support
    ((SELECT id FROM roles WHERE code = '122'), 'attendances.read', 10003),
    ((SELECT id FROM roles WHERE code = '122'), 'attendance_status.manage', 10003),

    -- Admissions Director (Role Code 161): Recruitment & Entry
    ((SELECT id FROM roles WHERE code = '161'), 'students.create', 10003),
    ((SELECT id FROM roles WHERE code = '161'), 'enrollments.manage', 10003),

        -- Principal (Role Code 100): High-level Management & Oversight
    ((SELECT id FROM roles WHERE code = '100'), 'auditlogs_report.read', 10002),
    ((SELECT id FROM roles WHERE code = '100'), 'staff.promote', 10002),
    ((SELECT id FROM roles WHERE code = '100'), 'departments.manage', 10002),

    -- Classroom Teacher (Role Code 105): Academic & Student Interaction
    ((SELECT id FROM roles WHERE code = '105'), 'student_grades.read', 10002),
    ((SELECT id FROM roles WHERE code = '105'), 'attendances.record', 10002),
    ((SELECT id FROM roles WHERE code = '105'), 'assessments.create', 10002),
    ((SELECT id FROM roles WHERE code = '105'), 'class_schedule.read', 10002),

    -- IT Director / SysAdmin (Role Code 145): System Maintenance
    ((SELECT id FROM roles WHERE code = '145'), 'system_roleroute_access_view.read', 10002),
    ((SELECT id FROM roles WHERE code = '145'), 'auditroute_report.read', 10002),
    ((SELECT id FROM roles WHERE code = '145'), 'secrets.manage', 10002),

    -- Attendance Officer (Role Code 122): Specialized Student Support
    ((SELECT id FROM roles WHERE code = '122'), 'attendances.read', 10002),
    ((SELECT id FROM roles WHERE code = '122'), 'attendance_status.manage', 10002),

    -- Admissions Director (Role Code 161): Recruitment & Entry
    ((SELECT id FROM roles WHERE code = '161'), 'students.create', 10002),
    ((SELECT id FROM roles WHERE code = '161'), 'enrollments.manage', 10002),

        -- Principal (Role Code 100): High-level Management & Oversight
    ((SELECT id FROM roles WHERE code = '100'), 'auditlogs_report.read', 10001),
    ((SELECT id FROM roles WHERE code = '100'), 'staff.promote', 10001),
    ((SELECT id FROM roles WHERE code = '100'), 'departments.manage', 10001),

    -- Classroom Teacher (Role Code 105): Academic & Student Interaction
    ((SELECT id FROM roles WHERE code = '105'), 'student_grades.read', 10001),
    ((SELECT id FROM roles WHERE code = '105'), 'attendances.record', 10001),
    ((SELECT id FROM roles WHERE code = '105'), 'assessments.create', 10001),
    ((SELECT id FROM roles WHERE code = '105'), 'class_schedule.read', 10001),

    -- IT Director / SysAdmin (Role Code 145): System Maintenance
    ((SELECT id FROM roles WHERE code = '145'), 'system_roleroute_access_view.read', 10002),
    ((SELECT id FROM roles WHERE code = '145'), 'auditroute_report.read', 10002),
    ((SELECT id FROM roles WHERE code = '145'), 'secrets.manage', 10002),

    -- Attendance Officer (Role Code 122): Specialized Student Support
    ((SELECT id FROM roles WHERE code = '122'), 'attendances.read', 10001),
    ((SELECT id FROM roles WHERE code = '122'), 'attendance_status.manage', 10001),

    -- Admissions Director (Role Code 161): Recruitment & Entry
    ((SELECT id FROM roles WHERE code = '161'), 'students.create', 10002),
    ((SELECT id FROM roles WHERE code = '161'), 'enrollments.manage', 10002)
ON CONFLICT DO NOTHING;



INSERT INTO public.leave_types (
    school_id, 
    name, 
    code, 
    description, 
    max_days_per_year, 
    max_consecutive_days, 
    requires_approval, 
    is_paid, 
    is_active
) VALUES 
(10001, 'Annual Leave', 'ANNUAL', 'Paid time off for rest and personal use.', 21, 21, true, true, true),
(10001, 'Sick Leave', 'SICK', 'Paid or unpaid time off for health issues or medical appointments.', 14, 14, true, true, true),
(10001, 'Maternity Leave', 'MATERNITY', 'Time off to care for a new child (Birth/Adoption).', 90, 90, true, true, true),
(10001, 'Paternity Leave', 'PATERNITY', 'Time off for fathers to care for a new child.', 5, 5, true, true, true),
(10001, 'Bereavement Leave', 'BEREAVE', 'Paid/unpaid leave to grieve a loved one.', 5, 5, true, true, true),
(10001, 'Loss of Pay (LOP)', 'LOP', 'Time off taken when leave balances are exhausted or not approved.', NULL, NULL, true, false, true),
(10001, 'Compensatory Leave', 'COMP', 'Time off given in lieu of overtime pay.', NULL, NULL, true, true, true),
(10001, 'Emergency/Casual Leave', 'EMERGENCY', 'Short-notice leave for urgent personal matters.', 7, 7, true, true, true),
(10001, 'Public Holiday', 'HOLIDAY', 'Paid days off for national or local holidays.', NULL, NULL, false, true, true),
(10001, 'Medical Leave (Long Term)', 'MEDICAL', 'Extended time off for serious health conditions.', 180, 180, true, true, true)
ON CONFLICT (school_id, code) DO NOTHING;

-- Seed Data for School 10002
INSERT INTO public.leave_types (
    school_id, name, code, description, max_days_per_year, 
    max_consecutive_days, requires_approval, is_paid, is_active
) VALUES 
(10002, 'Annual Leave', 'ANNUAL', 'Paid time off for rest and personal use.', 21, 21, true, true, true),
(10002, 'Sick Leave', 'SICK', 'Health issues or medical appointments.', 14, 14, true, true, true),
(10002, 'Maternity Leave', 'MATERNITY', 'Care for a new child.', 90, 90, true, true, true),
(10002, 'Paternity Leave', 'PATERNITY', 'Care for a new child (Fathers).', 5, 5, true, true, true),
(10002, 'Bereavement Leave', 'BEREAVE', 'Grieve a loved one.', 5, 5, true, true, true),
(10002, 'Loss of Pay (LOP)', 'LOP', 'Unpaid leave when balances are exhausted.', NULL, NULL, true, false, true),
(10002, 'Compensatory Leave', 'COMP', 'Time off in lieu of overtime.', NULL, NULL, true, true, true),
(10002, 'Emergency/Casual Leave', 'EMERGENCY', 'Urgent personal matters.', 7, 7, true, true, true),
(10002, 'Public Holiday', 'HOLIDAY', 'National or local holidays.', NULL, NULL, false, true, true),
(10002, 'Medical Leave', 'MEDICAL', 'Extended health conditions.', 180, 180, true, true, true)
ON CONFLICT (school_id, code) DO NOTHING;

-- Seed Data for School 10003
INSERT INTO public.leave_types (
    school_id, name, code, description, max_days_per_year, 
    max_consecutive_days, requires_approval, is_paid, is_active
) VALUES 
(10003, 'Annual Leave', 'ANNUAL', 'Paid time off for rest and personal use.', 21, 21, true, true, true),
(10003, 'Sick Leave', 'SICK', 'Health issues or medical appointments.', 14, 14, true, true, true),
(10003, 'Maternity Leave', 'MATERNITY', 'Care for a new child.', 90, 90, true, true, true),
(10003, 'Paternity Leave', 'PATERNITY', 'Care for a new child (Fathers).', 5, 5, true, true, true),
(10003, 'Bereavement Leave', 'BEREAVE', 'Grieve a loved one.', 5, 5, true, true, true),
(10003, 'Loss of Pay (LOP)', 'LOP', 'Unpaid leave when balances are exhausted.', NULL, NULL, true, false, true),
(10003, 'Compensatory Leave', 'COMP', 'Time off in lieu of overtime.', NULL, NULL, true, true, true),
(10003, 'Emergency/Casual Leave', 'EMERGENCY', 'Urgent personal matters.', 7, 7, true, true, true),
(10003, 'Public Holiday', 'HOLIDAY', 'National or local holidays.', NULL, NULL, false, true, true),
(10003, 'Medical Leave', 'MEDICAL', 'Extended health conditions.', 180, 180, true, true, true)
ON CONFLICT (school_id, code) DO NOTHING;

-- ⚠️ REMOVED: Old enquiry lookup tables (status_types, priority_levels, subjects)
-- These have been replaced with simplified schema in 0006_enquiries.sql
-- The new seed data is in 0006_enquiries.sql

-- COMMENT ON TABLE enquiry_status_types IS 'Lookup table for enquiry status types';
-- COMMENT ON TABLE enquiry_priority_levels IS 'Lookup table for enquiry priority levels';
-- COMMENT ON TABLE enquiry_subjects IS 'Lookup table for enquiry subjects/topics (hierarchical)';


-- ⚠️ REMOVED: Old enquiry lookup tables seed data for school 10003
-- These have been replaced with simplified schema in 0006_enquiries.sql


-- =============================================================
-- GENERIC PERMISSION ALIGNMENT (The "Total Access" Strategy)
-- This grants EVERY user EVERY permission within their own school.
-- =============================================================
/*
INSERT INTO public.user_permissions (
    school_id, 
    user_id, 
    module, 
    resource, 
    action, 
    permission_id, 
    is_allowed
)
SELECT 
    u.school_id,     -- Pulls the school from the user record
    u.id,            -- Pulls the actual database ID of the user
    p.module,        -- Pulls from the global permissions table
    p.resource, 
    p.action, 
    p.id,            -- Links the permission_id
    true             -- Sets access to true
FROM public.users u
CROSS JOIN public.permissions p
WHERE u.is_deleted = false
  AND u.is_active = true
ON CONFLICT (school_id, user_id, module, resource, action) 
DO UPDATE SET is_allowed = EXCLUDED.is_allowed;
*/
-- =============================================================
-- VERIFICATION QUERY
-- Run this to confirm no "cross-school" permissions exist
-- =============================================================
/*
SELECT COUNT(*) as mismatched_permissions
FROM public.user_permissions up
JOIN public.users u ON up.user_id = u.id
WHERE up.school_id <> u.school_id;
*/


/*

-- Map each user to their role in user_roles
-- Add ON CONFLICT DO NOTHING to avoid duplicate mappings
INSERT INTO public.user_roles (user_id, role_id, school_id, is_active, created_at)
SELECT u.id, u.role_id, u.school_id, true, now()
FROM public.users u
WHERE u.school_id = 10003
ON CONFLICT (user_id, role_id, school_id) DO NOTHING;


--role permissions for school_id = 10003
INSERT INTO public.role_permissions (role_id, permission_key, is_active)
SELECT r.id, p.permission_key, TRUE
FROM public.roles r
CROSS JOIN public.route_permissions p
WHERE p.permission_key IN (1001, 1002)
ON CONFLICT (role_id, permission_key, school_id) DO NOTHING;
*/

/*

-- === ACADEMICS DOMAIN ===
-- Academic Years
UPDATE public.permissions
SET code = 'academic_years.manage', name = 'Manage Academic Years'
WHERE code = 'academic_year.manage';
UPDATE public.route_permissions
SET route = '/academics/academic_years', resource = 'academic_years'
WHERE resource = 'academic_year';

-- Classes
UPDATE public.permissions
SET code = 'classes.create', name = 'Create Class'
WHERE code = 'class.create';
UPDATE public.permissions
SET code = 'classes.read', name = 'View Class'
WHERE code = 'class.read';
UPDATE public.permissions
SET code = 'classes.update', name = 'Update Class'
WHERE code = 'class.update';
UPDATE public.permissions
SET code = 'classes.delete', name = 'Delete Class'
WHERE code = 'class.delete';
UPDATE public.route_permissions
SET route = '/academics/classes', resource = 'classes'
WHERE resource = 'class';

-- Subjects
UPDATE public.permissions
SET code = 'subjects.manage', name = 'Manage Subjects'
WHERE code = 'subject.manage';
UPDATE public.route_permissions
SET route = '/academics/subjects', resource = 'subjects'
WHERE resource = 'subject';

-- Grade Levels
UPDATE public.permissions
SET code = 'grade_levels.manage', name = 'Manage Grade Levels'
WHERE code = 'grade_level.manage';
UPDATE public.route_permissions
SET route = '/academics/grade_levels', resource = 'grade_levels'
WHERE resource = 'grade_level';

-- Terms
UPDATE public.permissions
SET code = 'terms.manage', name = 'Manage Terms'
WHERE code = 'term.manage';
UPDATE public.route_permissions
SET route = '/academics/terms', resource = 'terms'
WHERE resource = 'term';

-- Lessons
UPDATE public.permissions
SET code = 'lessons.manage', name = 'Manage Lessons'
WHERE code = 'lesson.manage';
UPDATE public.route_permissions
SET route = '/academics/lessons', resource = 'lessons'
WHERE resource = 'lesson';

-- Assignments
UPDATE public.permissions
SET code = 'assignments.create', name = 'Create Assignments'
WHERE code = 'assignments.create';
UPDATE public.permissions
SET code = 'assignments.submit', name = 'Submit Assignments'
WHERE code = 'assignments.submit';
UPDATE public.permissions
SET code = 'assignments.grade', name = 'Grade Assignments'
WHERE code = 'assignments.grade';
UPDATE public.route_permissions
SET route = '/academics/assignments', resource = 'assignments'
WHERE resource = 'assignments';

-- Exam Results
UPDATE public.permissions
SET code = 'exam_results.read', name = 'View Exam Results'
WHERE code = 'exam_results.read';
UPDATE public.route_permissions
SET route = '/academics/exam_results', resource = 'exam_results'
WHERE resource = 'exam_results';

-- Report Cards
UPDATE public.permissions
SET code = 'report_cards.read', name = 'View Report Cards'
WHERE code = 'report_cards.read';
UPDATE public.permissions
SET code = 'report_cards.export', name = 'Export Report Cards'
WHERE code = 'report_cards.export';
UPDATE public.route_permissions
SET route = '/academics/report_cards', resource = 'report_cards'
WHERE resource = 'report_cards';

-- === SYSTEM DOMAIN ===
-- Contact Types
UPDATE public.permissions
SET code = 'contact_types.manage', name = 'Manage Contact Types'
WHERE code = 'contact_type.manage';
UPDATE public.route_permissions
SET route = '/system/contact_types', resource = 'contact_types'
WHERE resource = 'contact_type';

-- Relationship Types
UPDATE public.permissions
SET code = 'relationship_types.manage', name = 'Manage Relationship Types'
WHERE code = 'relationship_type.manage';
UPDATE public.route_permissions
SET route = '/system/relationship_types', resource = 'relationship_types'
WHERE resource = 'relationship_type';

-- Custom Fields
UPDATE public.permissions
SET code = 'custom_fields.manage', name = 'Manage Custom Fields'
WHERE code = 'custom_field.manage';
UPDATE public.route_permissions
SET route = '/system/custom_fields', resource = 'custom_fields'
WHERE resource = 'custom_field';

-- Genders
UPDATE public.permissions
SET code = 'genders.manage', name = 'Manage Genders'
WHERE code = 'gender.manage';
UPDATE public.route_permissions
SET route = '/system/genders', resource = 'genders'
WHERE resource = 'gender';

-- Schools
UPDATE public.permissions
SET resource = 'schools.manage', name = 'Manage Schools'
WHERE resource = 'school.manage';
UPDATE public.route_permissions
SET route = '/system/schools', resource = 'schools'
WHERE resource = 'school';

-- Settings
UPDATE public.permissions
SET resource = 'settings.manage', name = 'Manage Settings'
WHERE resource = 'setting.manage';
UPDATE public.route_permissions
SET route = '/system/settings', resource = 'settings'
WHERE resource = 'setting';

-- API Keys
UPDATE public.permissions
SET resource = 'api_keys.manage', name = 'Manage API Keys'
WHERE resource = 'api_keys.manage';
UPDATE public.route_permissions
SET route = '/system/api_keys', resource = 'api_keys'
WHERE resource = 'api_keys';

-- Integrations
UPDATE public.permissions
SET resource = 'integrations.manage', name = 'Manage Integrations'
WHERE resource = 'integration.manage';
UPDATE public.route_permissions
SET route = '/system/integrations', resource = 'integrations'
WHERE resource = 'integration';

-- Webhooks
UPDATE public.permissions
SET resource = 'webhooks.manage', name = 'Manage Webhooks'
WHERE resource = 'webhook.manage';
UPDATE public.route_permissions
SET route = '/system/webhooks', resource = 'webhooks'
WHERE resource = 'webhook';

-- Workflows
UPDATE public.permissions
SET resource = 'workflows.manage', name = 'Manage Workflows'
WHERE resource = 'workflow.manage';
UPDATE public.route_permissions
SET route = '/system/workflows', resource = 'workflows'
WHERE resource = 'workflow';

-- === FILES DOMAIN ===
-- Files
UPDATE public.permissions
SET resource = 'files.upload', name = 'Upload File'
WHERE resource = 'file.upload';
UPDATE public.permissions
SET resource = 'files.read', name = 'View File'
WHERE resource = 'file.read';
UPDATE public.permissions
SET resource = 'files.share', name = 'Share File'
WHERE resource = 'file.share';
UPDATE public.permissions
SET resource = 'files.delete', name = 'Delete File'
WHERE resource = 'file.delete';
UPDATE public.route_permissions
SET route = '/files', resource = 'filesmgt'
WHERE resource = 'file';

-- Document Types
UPDATE public.permissions
SET resource = 'document_types.manage', name = 'Manage Document Types'
WHERE resource = 'document_type.manage';
UPDATE public.route_permissions
SET route = '/files/document_types', resource = 'document_types'
WHERE resource = 'document_type';

-- === COMMUNICATIONS DOMAIN ===
-- Messages
UPDATE public.permissions
SET resource = 'messages.send', name = 'Send Message'
WHERE resource = 'message.send';
UPDATE public.permissions
SET resource = 'messages.read', name = 'Read Message'
WHERE resource = 'message.read';
UPDATE public.route_permissions
SET route = '/communications/messages', resource = 'messages'
WHERE resource = 'message';

-- Notifications
UPDATE public.permissions
SET resource = 'notifications.create', name = 'Create Notification'
WHERE resource = 'notification.create';
UPDATE public.permissions
SET resource = 'notifications.read', name = 'View Notifications'
WHERE resource = 'notification.read';
UPDATE public.route_permissions
SET route = '/communications/notifications', resource = 'notifications'
WHERE resource = 'notification';

-- === ADMISSIONS DOMAIN ===
-- Inquiries (existing)
UPDATE public.permissions
SET resource = 'inquiries.manage', name = 'Manage Inquiries'
WHERE resource = 'inquiries.manage';
UPDATE public.permissions
SET resource = 'inquiries.read', name = 'View Inquiries'
WHERE resource = 'inquiries.read';
UPDATE public.route_permissions
SET route = '/admissions/inquiries', resource = 'inquiries'
WHERE resource = 'inquiries';

-- Enquiries (New Enhanced System)
-- First insert permissions (permission_key will be auto-generated as 'resource.action')
INSERT INTO permissions (module, resource, action, name, description, is_active)
VALUES
  ('admissions', 'enquiries', 'read', 'View Enquiries', 'Can view enquiries', true),

-- ============================================
-- STAFF MANAGEMENT SEED DATA (IDs 300-378)
-- Permissions, Route Permissions, and Sidebar Configuration
-- ============================================

-- PART 1: ADD MISSING PERMISSIONS (IDs 300-378)
INSERT INTO permissions (id, name, module, resource, action)
VALUES
  -- Core Staff Management
  (300, 'Manage Staff Dashboard', 'staffmgt', 'staff_dashboard', 'manage'),
  (301, 'View Staff Dashboard', 'staffmgt', 'staff_dashboard', 'read'),
  
  -- Staff Attendance
  (302, 'View Attendance Records', 'staffmgt', 'staff_attendance', 'read'),
  (303, 'Create Attendance Record', 'staffmgt', 'staff_attendance', 'create'),
  (304, 'Update Attendance Record', 'staffmgt', 'staff_attendance', 'update'),
  (305, 'Delete Attendance Record', 'staffmgt', 'staff_attendance', 'delete'),
  (306, 'Clock In/Out', 'staffmgt', 'staff_attendance', 'clock'),
  (307, 'View Attendance Statistics', 'staffmgt', 'staff_attendance', 'statistics'),
  (308, 'Export Attendance Report', 'staffmgt', 'staff_attendance', 'export'),
  
  -- Leave Management
  (309, 'View Leave Requests', 'staffmgt', 'leave_requests', 'read'),
  (310, 'Create Leave Request', 'staffmgt', 'leave_requests', 'create'),
  (311, 'Update Leave Request', 'staffmgt', 'leave_requests', 'update'),
  (312, 'Delete Leave Request', 'staffmgt', 'leave_requests', 'delete'),
  (313, 'Approve Leave Request', 'staffmgt', 'leave_requests', 'approve'),
  (314, 'Reject Leave Request', 'staffmgt', 'leave_requests', 'reject'),
  (315, 'Manage Leave Types', 'staffmgt', 'leave_types', 'manage'),
  (316, 'View Leave Types', 'staffmgt', 'leave_types', 'read'),
  (317, 'Manage Leave Quotas', 'staffmgt', 'leave_quotas', 'manage'),
  (318, 'View Leave Quotas', 'staffmgt', 'leave_quotas', 'read'),
  (319, 'View Leave Calendar', 'staffmgt', 'leave_calendar', 'read'),
  (320, 'View Leave Statistics', 'staffmgt', 'leave_requests', 'statistics'),
  
  -- Performance Reviews
  (321, 'View Performance Reviews', 'staffmgt', 'performance_reviews', 'read'),
  (322, 'Create Performance Review', 'staffmgt', 'performance_reviews', 'create'),
  (323, 'Update Performance Review', 'staffmgt', 'performance_reviews', 'update'),
  (324, 'Delete Performance Review', 'staffmgt', 'performance_reviews', 'delete'),
  (325, 'Approve Performance Review', 'staffmgt', 'performance_reviews', 'approve'),
  (326, 'View Performance Templates', 'staffmgt', 'performance_templates', 'read'),
  (327, 'Manage Performance Templates', 'staffmgt', 'performance_templates', 'manage'),
  (328, 'View Performance Statistics', 'staffmgt', 'performance_reviews', 'statistics'),
  
  -- Contracts
  (329, 'View Staff Contracts', 'staffmgt', 'staff_contracts', 'read'),
  (330, 'Create Staff Contract', 'staffmgt', 'staff_contracts', 'create'),
  (331, 'Update Staff Contract', 'staffmgt', 'staff_contracts', 'update'),
  (332, 'Delete Staff Contract', 'staffmgt', 'staff_contracts', 'delete'),
  (333, 'Sign Contract', 'staffmgt', 'staff_contracts', 'sign'),
  (334, 'Renew Contract', 'staffmgt', 'staff_contracts', 'renew'),
  (335, 'Terminate Contract', 'staffmgt', 'staff_contracts', 'terminate'),
  (336, 'View Contract Statistics', 'staffmgt', 'staff_contracts', 'statistics'),
  
  -- Training
  (337, 'View Training Courses', 'staffmgt', 'training_courses', 'read'),
  (338, 'Create Training Course', 'staffmgt', 'training_courses', 'create'),
  (339, 'Update Training Course', 'staffmgt', 'training_courses', 'update'),
  (340, 'Delete Training Course', 'staffmgt', 'training_courses', 'delete'),
  (341, 'Enroll in Training', 'staffmgt', 'training_enrollments', 'enroll'),
  (342, 'View Training Enrollments', 'staffmgt', 'training_enrollments', 'read'),
  (343, 'Complete Training', 'staffmgt', 'training_enrollments', 'complete'),
  (344, 'View Training Statistics', 'staffmgt', 'training_courses', 'statistics'),
  
  -- Payroll
  (345, 'View Payroll Records', 'staffmgt', 'staff_payroll', 'read'),
  (346, 'Create Payroll Record', 'staffmgt', 'staff_payroll', 'create'),
  (347, 'Update Payroll Record', 'staffmgt', 'staff_payroll', 'update'),
  (348, 'Delete Payroll Record', 'staffmgt', 'staff_payroll', 'delete'),
  (349, 'Process Payroll', 'staffmgt', 'staff_payroll', 'process'),
  (350, 'View Payroll Statistics', 'staffmgt', 'staff_payroll', 'statistics'),
  (351, 'Export Payroll Report', 'staffmgt', 'staff_payroll', 'export'),
  
  -- Hiring/Recruitment
  (352, 'View Job Postings', 'staffmgt', 'hiring_jobs', 'read'),
  (353, 'Create Job Posting', 'staffmgt', 'hiring_jobs', 'create'),
  (354, 'Update Job Posting', 'staffmgt', 'hiring_jobs', 'update'),
  (355, 'Delete Job Posting', 'staffmgt', 'hiring_jobs', 'delete'),
  (356, 'View Job Applications', 'staffmgt', 'hiring_applications', 'read'),
  (357, 'Create Job Application', 'staffmgt', 'hiring_applications', 'create'),
  (358, 'Update Job Application', 'staffmgt', 'hiring_applications', 'update'),
  (359, 'Delete Job Application', 'staffmgt', 'hiring_applications', 'delete'),
  (360, 'Schedule Interview', 'staffmgt', 'hiring_applications', 'interview'),
  (361, 'View Hiring Statistics', 'staffmgt', 'hiring', 'statistics'),
  
  -- ID & Access
  (362, 'View Staff ID Access', 'staffmgt', 'staff_id_access', 'read'),
  (363, 'Create Staff ID Access', 'staffmgt', 'staff_id_access', 'create'),
  (364, 'Update Staff ID Access', 'staffmgt', 'staff_id_access', 'update'),
  (365, 'Delete Staff ID Access', 'staffmgt', 'staff_id_access', 'delete'),
  (366, 'Activate/Deactivate Access', 'staffmgt', 'staff_id_access', 'toggle'),
  (367, 'View Access Statistics', 'staffmgt', 'staff_id_access', 'statistics'),
  
  -- Disciplinary
  (368, 'View Disciplinary Actions', 'staffmgt', 'disciplinary_actions', 'read'),
  (369, 'Create Disciplinary Action', 'staffmgt', 'disciplinary_actions', 'create'),
  (370, 'Update Disciplinary Action', 'staffmgt', 'disciplinary_actions', 'update'),
  (371, 'Delete Disciplinary Action', 'staffmgt', 'disciplinary_actions', 'delete'),
  (372, 'Approve Disciplinary Action', 'staffmgt', 'disciplinary_actions', 'approve'),
  (373, 'View Disciplinary Statistics', 'staffmgt', 'disciplinary_actions', 'statistics'),
  
  -- Promotions
  (374, 'View Staff Promotions', 'staffmgt', 'staff_promotions', 'read'),
  (375, 'Create Staff Promotion', 'staffmgt', 'staff_promotions', 'create'),
  (376, 'Update Staff Promotion', 'staffmgt', 'staff_promotions', 'update'),
  (377, 'Delete Staff Promotion', 'staffmgt', 'staff_promotions', 'delete'),
  (378, 'Approve Staff Promotion', 'staffmgt', 'staff_promotions', 'approve')
ON CONFLICT (id) DO NOTHING;

-- PART 2: ROUTE PERMISSIONS FOR SIDEBAR
INSERT INTO public.route_permissions (route, method, action, module, resource, permission_key, display_name, icon, is_menu_item, display_order, group_name)
VALUES 
  ('/staffmgt/dashboard', 'GET', 'staffmgt.staff_dashboard.manage', 'staffmgt', 'staff_dashboard', 'staffmgt.staff_dashboard.manage', 'Dashboard', 'LayoutDashboard', TRUE, 1, NULL),
  ('/staffmgt/staff', 'GET', 'staffmgt.staff.read', 'staffmgt', 'staff', 'staffmgt.staff.read', 'Staff Directory', 'Users', TRUE, 10, NULL),
  ('/staffmgt/staff/new', 'GET', 'staffmgt.staff.create', 'staffmgt', 'staff', 'staffmgt.staff.create', 'Add Staff Member', 'UserPlus', FALSE, 11, 'staff'),
  ('/staffmgt/staff/:id', 'GET', 'staffmgt.staff.read', 'staffmgt', 'staff', 'staffmgt.staff.read', 'View Staff Details', 'User', FALSE, 12, 'staff'),
  ('/staffmgt/staff/:id/edit', 'GET', 'staffmgt.staff.update', 'staffmgt', 'staff', 'staffmgt.staff.update', 'Edit Staff', 'Edit', FALSE, 13, 'staff'),
  ('/staffmgt/attendance', 'GET', 'staffmgt.staff_attendance.read', 'staffmgt', 'staff_attendance', 'staffmgt.staff_attendance.read', 'Attendance', 'Clock', TRUE, 20, NULL),
  ('/staffmgt/attendance/clock-in', 'POST', 'staffmgt.staff_attendance.clock', 'staffmgt', 'staff_attendance', 'staffmgt.staff_attendance.clock', 'Clock In', 'LogIn', FALSE, 21, 'attendance'),
  ('/staffmgt/attendance/clock-out', 'POST', 'staffmgt.staff_attendance.clock', 'staffmgt', 'staff_attendance', 'staffmgt.staff_attendance.clock', 'Clock Out', 'LogOut', FALSE, 22, 'attendance'),
  ('/staffmgt/attendance/statistics', 'GET', 'staffmgt.staff_attendance.statistics', 'staffmgt', 'staff_attendance', 'staffmgt.staff_attendance.statistics', 'Attendance Analytics', 'BarChart3', FALSE, 23, 'attendance'),
  ('/staffmgt/leave', 'GET', 'staffmgt.leave_requests.read', 'staffmgt', 'leave_requests', 'staffmgt.leave_requests.read', 'Leave Management', 'CalendarDays', TRUE, 30, NULL),
  ('/staffmgt/leave/requests', 'GET', 'staffmgt.leave_requests.read', 'staffmgt', 'leave_requests', 'staffmgt.leave_requests.read', 'Leave Requests', 'FileText', FALSE, 31, 'leave'),
  ('/staffmgt/leave/requests/new', 'GET', 'staffmgt.leave_requests.create', 'staffmgt', 'leave_requests', 'staffmgt.leave_requests.create', 'New Leave Request', 'PlusCircle', FALSE, 32, 'leave'),
  ('/staffmgt/leave/types', 'GET', 'staffmgt.leave_types.read', 'staffmgt', 'leave_types', 'staffmgt.leave_types.read', 'Leave Types', 'Tag', FALSE, 33, 'leave'),
  ('/staffmgt/leave/quotas', 'GET', 'staffmgt.leave_quotas.read', 'staffmgt', 'leave_quotas', 'staffmgt.leave_quotas.read', 'Leave Quotas', 'PieChart', FALSE, 34, 'leave'),
  ('/staffmgt/leave/calendar', 'GET', 'staffmgt.leave_calendar.read', 'staffmgt', 'leave_calendar', 'staffmgt.leave_calendar.read', 'Leave Calendar', 'Calendar', FALSE, 35, 'leave'),
  ('/staffmgt/performance', 'GET', 'staffmgt.performance_reviews.read', 'staffmgt', 'performance_reviews', 'staffmgt.performance_reviews.read', 'Performance', 'TrendingUp', TRUE, 40, NULL),
  ('/staffmgt/performance/reviews', 'GET', 'staffmgt.performance_reviews.read', 'staffmgt', 'performance_reviews', 'staffmgt.performance_reviews.read', 'Reviews', 'ClipboardCheck', FALSE, 41, 'performance'),
  ('/staffmgt/performance/reviews/new', 'GET', 'staffmgt.performance_reviews.create', 'staffmgt', 'performance_reviews', 'staffmgt.performance_reviews.create', 'New Review', 'PlusCircle', FALSE, 42, 'performance'),
  ('/staffmgt/performance/templates', 'GET', 'staffmgt.performance_templates.read', 'staffmgt', 'performance_templates', 'staffmgt.performance_templates.read', 'Templates', 'FileTemplate', FALSE, 43, 'performance'),
  ('/staffmgt/contracts', 'GET', 'staffmgt.staff_contracts.read', 'staffmgt', 'staff_contracts', 'staffmgt.staff_contracts.read', 'Contracts', 'FileSignature', TRUE, 50, NULL),
  ('/staffmgt/contracts/new', 'GET', 'staffmgt.staff_contracts.create', 'staffmgt', 'staff_contracts', 'staffmgt.staff_contracts.create', 'New Contract', 'FilePlus', FALSE, 51, 'contracts'),
  ('/staffmgt/contracts/expiring', 'GET', 'staffmgt.staff_contracts.read', 'staffmgt', 'staff_contracts', 'staffmgt.staff_contracts.read', 'Expiring Contracts', 'AlertTriangle', FALSE, 52, 'contracts'),
  ('/staffmgt/training', 'GET', 'staffmgt.training_courses.read', 'staffmgt', 'training_courses', 'staffmgt.training_courses.read', 'Training', 'GraduationCap', TRUE, 60, NULL),
  ('/staffmgt/training/courses', 'GET', 'staffmgt.training_courses.read', 'staffmgt', 'training_courses', 'staffmgt.training_courses.read', 'Courses', 'BookOpen', FALSE, 61, 'training'),
  ('/staffmgt/training/courses/new', 'GET', 'staffmgt.training_courses.create', 'staffmgt', 'training_courses', 'staffmgt.training_courses.create', 'New Course', 'PlusCircle', FALSE, 62, 'training'),
  ('/staffmgt/training/enrollments', 'GET', 'staffmgt.training_enrollments.read', 'staffmgt', 'training_enrollments', 'staffmgt.training_enrollments.read', 'Enrollments', 'UserCheck', FALSE, 63, 'training'),
  ('/staffmgt/payroll', 'GET', 'staffmgt.staff_payroll.read', 'staffmgt', 'staff_payroll', 'staffmgt.staff_payroll.read', 'Payroll', 'DollarSign', TRUE, 70, NULL),
  ('/staffmgt/payroll/process', 'GET', 'staffmgt.staff_payroll.process', 'staffmgt', 'staff_payroll', 'staffmgt.staff_payroll.process', 'Process Payroll', 'CreditCard', FALSE, 71, 'payroll'),
  ('/staffmgt/payroll/statistics', 'GET', 'staffmgt.staff_payroll.statistics', 'staffmgt', 'staff_payroll', 'staffmgt.staff_payroll.statistics', 'Payroll Analytics', 'BarChart3', FALSE, 72, 'payroll'),
  ('/staffmgt/hiring', 'GET', 'staffmgt.hiring_jobs.read', 'staffmgt', 'hiring_jobs', 'staffmgt.hiring_jobs.read', 'Recruitment', 'Briefcase', TRUE, 80, NULL),
  ('/staffmgt/hiring/jobs', 'GET', 'staffmgt.hiring_jobs.read', 'staffmgt', 'hiring_jobs', 'staffmgt.hiring_jobs.read', 'Job Postings', 'FileText', FALSE, 81, 'hiring'),
  ('/staffmgt/hiring/jobs/new', 'GET', 'staffmgt.hiring_jobs.create', 'staffmgt', 'hiring_jobs', 'staffmgt.hiring_jobs.create', 'New Job Posting', 'PlusCircle', FALSE, 82, 'hiring'),
  ('/staffmgt/hiring/applications', 'GET', 'staffmgt.hiring_applications.read', 'staffmgt', 'hiring_applications', 'staffmgt.hiring_applications.read', 'Applications', 'Inbox', FALSE, 83, 'hiring'),
  ('/staffmgt/id-access', 'GET', 'staffmgt.staff_id_access.read', 'staffmgt', 'staff_id_access', 'staffmgt.staff_id_access.read', 'ID & Access', 'Key', TRUE, 90, NULL),
  ('/staffmgt/id-access/manage', 'GET', 'staffmgt.staff_id_access.read', 'staffmgt', 'staff_id_access', 'staffmgt.staff_id_access.read', 'Manage Access', 'Settings', FALSE, 91, 'id-access'),
  ('/staffmgt/disciplinary', 'GET', 'staffmgt.disciplinary_actions.read', 'staffmgt', 'disciplinary_actions', 'staffmgt.disciplinary_actions.read', 'Disciplinary', 'AlertCircle', TRUE, 100, NULL),
  ('/staffmgt/disciplinary/actions', 'GET', 'staffmgt.disciplinary_actions.read', 'staffmgt', 'disciplinary_actions', 'staffmgt.disciplinary_actions.read', 'Actions', 'FileWarning', FALSE, 101, 'disciplinary'),
  ('/staffmgt/disciplinary/actions/new', 'GET', 'staffmgt.disciplinary_actions.create', 'staffmgt', 'disciplinary_actions', 'staffmgt.disciplinary_actions.create', 'New Action', 'PlusCircle', FALSE, 102, 'disciplinary'),
  ('/staffmgt/promotions', 'GET', 'staffmgt.staff_promotions.read', 'staffmgt', 'staff_promotions', 'staffmgt.staff_promotions.read', 'Promotions', 'Award', TRUE, 110, NULL),
  ('/staffmgt/promotions/new', 'GET', 'staffmgt.staff_promotions.create', 'staffmgt', 'staff_promotions', 'staffmgt.staff_promotions.create', 'New Promotion', 'PlusCircle', FALSE, 111, 'promotions'),
  ('/staffmgt/departments', 'GET', 'staffmgt.departments.manage', 'staffmgt', 'departments', 'staffmgt.departments.manage', 'Departments', 'Building2', FALSE, 200, 'configuration'),
  ('/staffmgt/roles', 'GET', 'staffmgt.staffmgt_roles.manage', 'staffmgt', 'staffmgt_roles', 'staffmgt.staffmgt_roles.manage', 'Staff Roles', 'Shield', FALSE, 201, 'configuration'),
  ('/staffmgt/employment-types', 'GET', 'staffmgt.employment_types.manage', 'staffmgt', 'employment_types', 'staffmgt.employment_types.manage', 'Employment Types', 'Briefcase', FALSE, 202, 'configuration'),
  ('/staffmgt/education-levels', 'GET', 'staffmgt.education_levels.manage', 'staffmgt', 'education_levels', 'staffmgt.education_levels.manage', 'Education Levels', 'GraduationCap', FALSE, 203, 'configuration'),
  ('/staffmgt/settings', 'GET', 'staffmgt.settings.manage', 'staffmgt', 'settings', 'staffmgt.settings.manage', 'Settings', 'Settings', TRUE, 210, NULL)
ON CONFLICT (route, method, action) DO NOTHING;

-- PART 3: SIDEBAR GROUPING CONFIGURATION
UPDATE route_permissions
SET is_menu_item = TRUE, group_name = '_flat'
WHERE module = 'staffmgt'
  AND resource IN (
    'staff_dashboard', 'staff', 'staff_attendance', 'leave_requests',
    'performance_reviews', 'staff_contracts', 'training_courses', 'staff_payroll',
    'hiring_jobs', 'staff_id_access', 'disciplinary_actions', 'staff_promotions', 'settings'
  )
  AND display_order < 150;

UPDATE route_permissions SET group_name = 'staff' WHERE module = 'staffmgt' AND resource = 'staff' AND display_order > 10 AND display_order < 20;
UPDATE route_permissions SET group_name = 'attendance' WHERE module = 'staffmgt' AND resource = 'staff_attendance' AND display_order > 20 AND display_order < 30;
UPDATE route_permissions SET group_name = 'leave' WHERE module = 'staffmgt' AND resource IN ('leave_requests', 'leave_types', 'leave_quotas', 'leave_calendar') AND display_order >= 30 AND display_order < 40;
UPDATE route_permissions SET group_name = 'performance' WHERE module = 'staffmgt' AND resource IN ('performance_reviews', 'performance_templates') AND display_order >= 40 AND display_order < 50;
UPDATE route_permissions SET group_name = 'contracts' WHERE module = 'staffmgt' AND resource = 'staff_contracts' AND display_order >= 50 AND display_order < 60;
UPDATE route_permissions SET group_name = 'training' WHERE module = 'staffmgt' AND resource IN ('training_courses', 'training_enrollments') AND display_order >= 60 AND display_order < 70;
UPDATE route_permissions SET group_name = 'payroll' WHERE module = 'staffmgt' AND resource = 'staff_payroll' AND display_order >= 70 AND display_order < 80;
UPDATE route_permissions SET group_name = 'hiring' WHERE module = 'staffmgt' AND resource IN ('hiring_jobs', 'hiring_applications') AND display_order >= 80 AND display_order < 90;
UPDATE route_permissions SET group_name = 'id-access' WHERE module = 'staffmgt' AND resource = 'staff_id_access' AND display_order >= 90 AND display_order < 100;
UPDATE route_permissions SET group_name = 'disciplinary' WHERE module = 'staffmgt' AND resource = 'disciplinary_actions' AND display_order >= 100 AND display_order < 110;
UPDATE route_permissions SET group_name = 'promotions' WHERE module = 'staffmgt' AND resource = 'staff_promotions' AND display_order >= 110 AND display_order < 120;
UPDATE route_permissions SET group_name = 'configuration' WHERE module = 'staffmgt' AND resource IN ('departments', 'staffmgt_roles', 'employment_types', 'education_levels') AND display_order >= 200;

-- PART 4: ICONS FOR STAFF MANAGEMENT
UPDATE route_permissions SET icon = 'LayoutDashboard' WHERE module = 'staffmgt' AND resource = 'staff_dashboard';
UPDATE route_permissions SET icon = 'Users' WHERE module = 'staffmgt' AND resource = 'staff';
UPDATE route_permissions SET icon = 'Clock' WHERE module = 'staffmgt' AND resource = 'staff_attendance';
UPDATE route_permissions SET icon = 'CalendarDays' WHERE module = 'staffmgt' AND resource = 'leave_requests';
UPDATE route_permissions SET icon = 'Tag' WHERE module = 'staffmgt' AND resource = 'leave_types';
UPDATE route_permissions SET icon = 'PieChart' WHERE module = 'staffmgt' AND resource = 'leave_quotas';
UPDATE route_permissions SET icon = 'Calendar' WHERE module = 'staffmgt' AND resource = 'leave_calendar';
UPDATE route_permissions SET icon = 'TrendingUp' WHERE module = 'staffmgt' AND resource = 'performance_reviews';
UPDATE route_permissions SET icon = 'FileTemplate' WHERE module = 'staffmgt' AND resource = 'performance_templates';
UPDATE route_permissions SET icon = 'FileSignature' WHERE module = 'staffmgt' AND resource = 'staff_contracts';
UPDATE route_permissions SET icon = 'GraduationCap' WHERE module = 'staffmgt' AND resource = 'training_courses';
UPDATE route_permissions SET icon = 'UserCheck' WHERE module = 'staffmgt' AND resource = 'training_enrollments';
UPDATE route_permissions SET icon = 'DollarSign' WHERE module = 'staffmgt' AND resource = 'staff_payroll';
UPDATE route_permissions SET icon = 'Briefcase' WHERE module = 'staffmgt' AND resource = 'hiring_jobs';
UPDATE route_permissions SET icon = 'Inbox' WHERE module = 'staffmgt' AND resource = 'hiring_applications';
UPDATE route_permissions SET icon = 'Key' WHERE module = 'staffmgt' AND resource = 'staff_id_access';
UPDATE route_permissions SET icon = 'AlertCircle' WHERE module = 'staffmgt' AND resource = 'disciplinary_actions';
UPDATE route_permissions SET icon = 'Award' WHERE module = 'staffmgt' AND resource = 'staff_promotions';
UPDATE route_permissions SET icon = 'Building2' WHERE module = 'staffmgt' AND resource = 'departments';
UPDATE route_permissions SET icon = 'Shield' WHERE module = 'staffmgt' AND resource = 'staffmgt_roles';
UPDATE route_permissions SET icon = 'Briefcase' WHERE module = 'staffmgt' AND resource = 'employment_types';
UPDATE route_permissions SET icon = 'Settings' WHERE module = 'staffmgt' AND resource = 'settings';

-- PART 5: DISPLAY ORDER OPTIMIZATION
UPDATE route_permissions SET display_order = 1 WHERE module = 'staffmgt' AND resource = 'staff_dashboard';
UPDATE route_permissions SET display_order = 10 WHERE module = 'staffmgt' AND resource = 'staff';
UPDATE route_permissions SET display_order = 20 WHERE module = 'staffmgt' AND resource = 'staff_attendance';
UPDATE route_permissions SET display_order = 30 WHERE module = 'staffmgt' AND resource = 'leave_requests';
UPDATE route_permissions SET display_order = 40 WHERE module = 'staffmgt' AND resource = 'performance_reviews';
UPDATE route_permissions SET display_order = 50 WHERE module = 'staffmgt' AND resource = 'staff_contracts';
UPDATE route_permissions SET display_order = 60 WHERE module = 'staffmgt' AND resource = 'training_courses';
UPDATE route_permissions SET display_order = 70 WHERE module = 'staffmgt' AND resource = 'staff_payroll';
UPDATE route_permissions SET display_order = 80 WHERE module = 'staffmgt' AND resource = 'hiring_jobs';
UPDATE route_permissions SET display_order = 90 WHERE module = 'staffmgt' AND resource = 'staff_id_access';
UPDATE route_permissions SET display_order = 100 WHERE module = 'staffmgt' AND resource = 'disciplinary_actions';
UPDATE route_permissions SET display_order = 110 WHERE module = 'staffmgt' AND resource = 'staff_promotions';
UPDATE route_permissions SET display_order = 210 WHERE module = 'staffmgt' AND resource = 'settings';

-- PART 6: HIDE CONFIGURATION GROUP FROM MAIN MENU
UPDATE route_permissions
SET is_menu_item = FALSE
WHERE module = 'staffmgt'
  AND resource IN ('departments', 'staffmgt_roles', 'employment_types', 'education_levels');
  ('admissions', 'enquiries', 'manage', 'Manage Enquiries', 'Can create, update, delete enquiries', true),
  ('admissions', 'enquiry_types', 'read', 'View Enquiry Types', 'Can view enquiry types', true),
  ('admissions', 'enquiry_types', 'manage', 'Manage Enquiry Types', 'Can manage enquiry types', true),
  ('admissions', 'enquiry_sources', 'read', 'View Enquiry Sources', 'Can view enquiry sources', true),
  ('admissions', 'enquiry_sources', 'manage', 'Manage Enquiry Sources', 'Can manage enquiry sources', true)
ON CONFLICT (resource, action) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Skip role_permissions for now - will be auto-generated
-- Route permissions will be auto-generated by the registry

-- === STORAGE DOMAIN ===
-- Buckets
UPDATE public.permissions
SET resource = 'buckets.manage', name = 'Manage Buckets'
WHERE resource = 'bucket.manage';
UPDATE public.route_permissions
SET route = '/storage/buckets', resource = 'buckets'
WHERE resource = 'bucket';

-- Objects
UPDATE public.permissions
SET resource = 'objects.upload', name = 'Upload Object'
WHERE resource = 'object.upload';
UPDATE public.permissions
SET resource = 'objects.read', name = 'View Object'
WHERE resource = 'object.read';
UPDATE public.permissions
SET resource = 'objects.delete', name = 'Delete Object'
WHERE resource = 'object.delete';
UPDATE public.route_permissions
SET route = '/storage/objects', resource = 'objects'
WHERE resource = 'object';

-- === VAULT DOMAIN ===
-- Secrets
UPDATE public.permissions
SET resource = 'secrets.manage', name = 'Manage Secrets'
WHERE resource = 'secret.manage';
UPDATE public.route_permissions
SET route = '/vault/secrets', resource = 'secrets'
WHERE resource = 'secret';

*/

INSERT INTO grade_levels (school_id, name, code, display_order, is_active) VALUES
(10001, 'Primary 1', 'P1', 1, TRUE),
(10001, 'Primary 2', 'P2', 2, TRUE),
(10001, 'Primary 3', 'P3', 3, TRUE),
(10001, 'Primary 4', 'P4', 4, TRUE),
(10001, 'Primary 5', 'P5', 5, TRUE),
(10001, 'Primary 6', 'P6', 6, TRUE),
(10001, 'Primary 7', 'P7', 7, TRUE),
(10001, 'Senior 1', 'S1', 8, TRUE),
(10001, 'Senior 2', 'S2', 9, TRUE),
(10001, 'Senior 3', 'S3', 10, TRUE),
(10001, 'Senior 4', 'S4', 11, TRUE),
(10001, 'Senior 5', 'S5', 12, TRUE),
(10001, 'Senior 6', 'S6', 13, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO grade_levels (school_id, name, code, display_order, is_active) VALUES
(10002, 'Primary 1', 'P1', 1, TRUE),
(10002, 'Primary 2', 'P2', 2, TRUE),
(10002, 'Primary 3', 'P3', 3, TRUE),
(10002, 'Primary 4', 'P4', 4, TRUE),
(10002, 'Primary 5', 'P5', 5, TRUE),
(10002, 'Primary 6', 'P6', 6, TRUE),
(10002, 'Primary 7', 'P7', 7, TRUE),
(10002, 'Senior 1', 'S1', 8, TRUE),
(10002, 'Senior 2', 'S2', 9, TRUE),
(10002, 'Senior 3', 'S3', 10, TRUE),
(10002, 'Senior 4', 'S4', 11, TRUE),
(10002, 'Senior 5', 'S5', 12, TRUE),
(10002, 'Senior 6', 'S6', 13, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO grade_levels (school_id, name, code, display_order, is_active) VALUES
(10003, 'Primary 1', 'P1', 1, TRUE),
(10003, 'Primary 2', 'P2', 2, TRUE),
(10003, 'Primary 3', 'P3', 3, TRUE),
(10003, 'Primary 4', 'P4', 4, TRUE),
(10003, 'Primary 5', 'P5', 5, TRUE),
(10003, 'Primary 6', 'P6', 6, TRUE),
(10003, 'Primary 7', 'P7', 7, TRUE),
(10003, 'Senior 1', 'S1', 8, TRUE),
(10003, 'Senior 2', 'S2', 9, TRUE),
(10003, 'Senior 3', 'S3', 10, TRUE),
(10003, 'Senior 4', 'S4', 11, TRUE),
(10003, 'Senior 5', 'S5', 12, TRUE),
(10003, 'Senior 6', 'S6', 13, TRUE)
ON CONFLICT DO NOTHING;


-- Seed curricula for Nakwero Secondary School (school_id = 10001)
INSERT INTO curricula (school_id, name, code, description, is_active) VALUES
(10001, 'Uganda National Curriculum', 'UNC', 'Uganda National Curriculum framework', TRUE),
(10001, 'Cambridge International', 'CIE', 'Cambridge International Examination syllabus', TRUE),
(10001, 'International Baccalaureate', 'IB', 'International Baccalaureate Diploma Programme', TRUE),
(10001, 'Kenya Curriculum', 'KCSE', 'Kenya Certificate of Secondary Education', TRUE)
ON CONFLICT DO NOTHING;

-- Seed curricula for Nakwero Secondary School (school_id = 10001)
INSERT INTO curricula (school_id, name, code, description, is_active) VALUES
(10002, 'Uganda National Curriculum', 'UNC', 'Uganda National Curriculum framework', TRUE),
(10002, 'Cambridge International', 'CIE', 'Cambridge International Examination syllabus', TRUE),
(10002, 'International Baccalaureate', 'IB', 'International Baccalaureate Diploma Programme', TRUE),
(10002, 'Kenya Curriculum', 'KCSE', 'Kenya Certificate of Secondary Education', TRUE)
ON CONFLICT DO NOTHING;

-- Seed curricula for Nakwero Secondary School (school_id = 10001)
INSERT INTO curricula (school_id, name, code, description, is_active) VALUES
(10003, 'Uganda National Curriculum', 'UNC', 'Uganda National Curriculum framework', TRUE),
(10003, 'Cambridge International', 'CIE', 'Cambridge International Examination syllabus', TRUE),
(10003, 'International Baccalaureate', 'IB', 'International Baccalaureate Diploma Programme', TRUE),
(10003, 'Kenya Curriculum', 'KCSE', 'Kenya Certificate of Secondary Education', TRUE)
ON CONFLICT DO NOTHING;


-- ============================================
-- SEED DATA: Users (for Staff)
-- ============================================

INSERT INTO users (id, school_id, email, username, password, first_name, last_name, phone, is_active)
VALUES
-- School 10001 Users
(1001, 10001, 'grace.nankunda@nakwero.edu.ug', 'grace.nankunda', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'Grace', 'Nankunda', '+256700000001', TRUE),
(1002, 10001, 'joseph.mukasa@nakwero.edu.ug', 'joseph.mukasa', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'Joseph', 'Mukasa', '+256700000002', TRUE),
(1003, 10001, 'sarah.nalubega@nakwero.edu.ug', 'sarah.nalubega', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'Sarah', 'Nalubega', '+256700000003', TRUE),
(1004, 10001, 'david.okello@nakwero.edu.ug', 'david.okello', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'David', 'Okello', '+256700000004', TRUE),
(1005, 10001, 'mary.katushabe@nakwero.edu.ug', 'mary.katushabe', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'Mary', 'Katushabe', '+256700000005', TRUE),
(1006, 10001, 'peter.babirye@nakwero.edu.ug', 'peter.babirye', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'Peter', 'Babirye', '+256700000006', TRUE),
(1007, 10001, 'rose.acen@nakwero.edu.ug', 'rose.acen', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'Rose', 'Acen', '+256700000007', TRUE),
(1008, 10001, 'james.sematimba@nakwero.edu.ug', 'james.sematimba', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'James', 'Sematimba', '+256700000008', TRUE),
-- School 10002 Users
(2001, 10002, 'john.kato@kia.ac.ug', 'john.kato', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'John', 'Kato', '+256700001001', TRUE),
(2002, 10002, 'alice.namuli@kia.ac.ug', 'alice.namuli', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'Alice', 'Namuli', '+256700001002', TRUE),
(2003, 10002, 'robert.mugisha@kia.ac.ug', 'robert.mugisha', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'Robert', 'Mugisha', '+256700001003', TRUE),
-- School 10003 Users
(3001, 10003, 'francis.tumuhaise@mbararahigh.sc.ug', 'francis.tumuhaise', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'Francis', 'Tumuhaise', '+256700002001', TRUE),
(3002, 10003, 'patricia.kembabazi@mbararahigh.sc.ug', 'patricia.kembabazi', '$2a$10$dW6K7Z5K3Z5K3Z5K3Z5K3O5K3Z5K3Z5K3Z5K3Z5K3Z5K3Z5K3', 'Patricia', 'Kembabazi', '+256700002002', TRUE)
ON CONFLICT (username) DO UPDATE SET
    id = EXCLUDED.id,
    school_id = EXCLUDED.school_id,
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    is_active = EXCLUDED.is_active;


-- ============================================
-- SEED DATA: Staff
-- ============================================
-- All users above exist (guaranteed by ON CONFLICT DO UPDATE)

INSERT INTO staff (id, school_id, user_id, employee_no, hire_date, department_id, role_id, is_active)
VALUES
(5001, 10001, 1001, 'EMP-5001', '2024-01-15', NULL, NULL, TRUE),
(5002, 10001, 1002, 'EMP-5002', '2024-01-15', NULL, NULL, TRUE),
(5003, 10001, 1003, 'EMP-5003', '2024-02-01', NULL, NULL, TRUE),
(5004, 10001, 1004, 'EMP-5004', '2024-02-01', NULL, NULL, TRUE),
(5005, 10001, 1005, 'EMP-5005', '2024-03-01', NULL, NULL, TRUE),
(5006, 10001, 1006, 'EMP-5006', '2024-03-01', NULL, NULL, TRUE),
(5007, 10001, 1007, 'EMP-5007', '2024-04-01', NULL, NULL, TRUE),
(5008, 10001, 1008, 'EMP-5008', '2024-04-01', NULL, NULL, TRUE),
(5101, 10002, 2001, 'EMP-5101', '2024-01-15', NULL, NULL, TRUE),
(5102, 10002, 2002, 'EMP-5102', '2024-02-01', NULL, NULL, TRUE),
(5103, 10002, 2003, 'EMP-5103', '2024-02-01', NULL, NULL, TRUE),
(5201, 10003, 3001, 'EMP-5201', '2024-01-15', NULL, NULL, TRUE),
(5202, 10003, 3002, 'EMP-5202', '2024-02-01', NULL, NULL, TRUE)
ON CONFLICT (school_id, user_id) DO NOTHING;


-- ============================================
-- SEED DATA: Staff Roles
-- ============================================

INSERT INTO staffmgt_roles (school_id, name, code, description, is_active)
VALUES
(10001, 'Head Teacher', 'HT', 'Senior leadership role responsible for overall school management', TRUE),
(10001, 'Deputy Head Teacher', 'DHT', 'Assistant to the Head Teacher in school administration', TRUE),
(10001, 'Class Teacher', 'CT', 'Primary classroom teacher responsible for student education', TRUE),
(10001, 'Subject Teacher', 'ST', 'Specialist teacher for specific subjects', TRUE),
(10001, 'Teaching Assistant', 'TA', 'Support staff assisting teachers in classroom activities', TRUE),
(10001, 'School Secretary', 'SEC', 'Administrative support for school operations', TRUE),
(10001, 'Accountant', 'ACC', 'Financial management and accounting', TRUE),
(10001, 'Librarian', 'LIB', 'Library management and information services', TRUE),
(10001, 'IT Support', 'ITS', 'Technical support and systems maintenance', TRUE),
(10001, 'Security Guard', 'SG', 'Campus security and safety', TRUE),

(10002, 'Head Teacher', 'HT', 'Senior leadership role responsible for overall school management', TRUE),
(10002, 'Deputy Head Teacher', 'DHT', 'Assistant to the Head Teacher in school administration', TRUE),
(10002, 'Class Teacher', 'CT', 'Primary classroom teacher responsible for student education', TRUE),
(10002, 'Subject Teacher', 'ST', 'Specialist teacher for specific subjects', TRUE),
(10002, 'Teaching Assistant', 'TA', 'Support staff assisting teachers in classroom activities', TRUE),
(10002, 'School Secretary', 'SEC', 'Administrative support for school operations', TRUE),
(10002, 'Accountant', 'ACC', 'Financial management and accounting', TRUE),
(10002, 'Librarian', 'LIB', 'Library management and information services', TRUE),
(10002, 'IT Support', 'ITS', 'Technical support and systems maintenance', TRUE),
(10002, 'Security Guard', 'SG', 'Campus security and safety', TRUE),

(10003, 'Head Teacher', 'HT', 'Senior leadership role responsible for overall school management', TRUE),
(10003, 'Deputy Head Teacher', 'DHT', 'Assistant to the Head Teacher in school administration', TRUE),
(10003, 'Class Teacher', 'CT', 'Primary classroom teacher responsible for student education', TRUE),
(10003, 'Subject Teacher', 'ST', 'Specialist teacher for specific subjects', TRUE),
(10003, 'Teaching Assistant', 'TA', 'Support staff assisting teachers in classroom activities', TRUE),
(10003, 'School Secretary', 'SEC', 'Administrative support for school operations', TRUE),
(10003, 'Accountant', 'ACC', 'Financial management and accounting', TRUE),
(10003, 'Librarian', 'LIB', 'Library management and information services', TRUE),
(10003, 'IT Support', 'ITS', 'Technical support and systems maintenance', TRUE),
(10003, 'Security Guard', 'SG', 'Campus security and safety', TRUE)
ON CONFLICT (school_id, name) DO NOTHING;


-- ============================================
-- SEED DATA: Subjects (School 10001)
-- ============================================

INSERT INTO subjects (school_id, curriculum_id, grade_level_id, name, code, is_core, is_active)
SELECT 10001, (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'), (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'P1'), 'Mathematics', 'MATH', TRUE, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO subjects (school_id, curriculum_id, grade_level_id, name, code, is_core, is_active)
SELECT 10001, (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'), (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'P1'), 'English', 'ENG', TRUE, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO subjects (school_id, curriculum_id, grade_level_id, name, code, is_core, is_active)
SELECT 10001, (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'), (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'P1'), 'Science', 'SCI', TRUE, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO subjects (school_id, curriculum_id, grade_level_id, name, code, is_core, is_active)
SELECT 10001, (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'), (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'P1'), 'Social Studies', 'SST', TRUE, TRUE
ON CONFLICT (school_id, code) DO NOTHING;


-- ============================================
-- SEED DATA: Classes
-- ============================================

-- School 10001: Nakwero Secondary School (2026 Academic Year)
INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10001,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'P1'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'),
    5001,
    'Primary 1 A', 'P1A', 'A', '2026', 'Room 101', 45, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10001,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'P1'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'),
    5002,
    'Primary 1 B', 'P1B', 'B', '2026', 'Room 102', 45, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10001,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'P2'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'),
    5003,
    'Primary 2 A', 'P2A', 'A', '2026', 'Room 201', 45, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10001,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'P2'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'),
    5004,
    'Primary 2 B', 'P2B', 'B', '2026', 'Room 202', 45, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10001,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'P3'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'),
    5005,
    'Primary 3 A', 'P3A', 'A', '2026', 'Room 301', 45, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10001,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'P3'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'),
    NULL,
    'Primary 3 B', 'P3B', 'B', '2026', 'Room 302', 45, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10001,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'S1'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'),
    5006,
    'Senior 1 A', 'S1A', 'A', '2026', 'Room 401', 50, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10001,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'S1'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'),
    5007,
    'Senior 1 B', 'S1B', 'B', '2026', 'Room 402', 50, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10001,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'S2'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'),
    5008,
    'Senior 2 A', 'S2A', 'A', '2026', 'Room 501', 50, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10001,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10001 AND code = 'S2'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10001 AND code = 'UNC'),
    NULL,
    'Senior 2 B', 'S2B', 'B', '2026', 'Room 502', 50, TRUE
ON CONFLICT (school_id, code) DO NOTHING;


-- School 10002: Kampala International Academy (2026 Academic Year)
INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10002,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10002 AND code = 'P1'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10002 AND code = 'UNC'),
    5101,
    'Primary 1 A', 'P1A-KIA', 'A', '2026', 'Room A1', 40, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10002,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10002 AND code = 'P1'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10002 AND code = 'UNC'),
    5102,
    'Primary 1 B', 'P1B-KIA', 'B', '2026', 'Room A2', 40, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10002,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10002 AND code = 'S1'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10002 AND code = 'UNC'),
    5103,
    'Senior 1 A', 'S1A-KIA', 'A', '2026', 'Room C1', 45, TRUE
ON CONFLICT (school_id, code) DO NOTHING;


-- School 10003: Mbarara High School (2026 Academic Year)
INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10003,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10003 AND code = 'P1'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10003 AND code = 'UNC'),
    5201,
    'Primary 1 A', 'P1A-MHS', 'A', '2026', 'Room 1A', 40, TRUE
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO classes (
    school_id,
    grade_level_id,
    curriculum_id,
    class_teacher_id,
    name,
    code,
    stream,
    academic_year,
    room,
    capacity,
    is_active
)
SELECT
    10003,
    (SELECT MAX(id) FROM grade_levels WHERE school_id = 10003 AND code = 'S1'),
    (SELECT MAX(id) FROM curricula WHERE school_id = 10003 AND code = 'UNC'),
    NULL,
    'Senior 1 A', 'S1A-MHS', 'A', '2026', 'Room 2A', 50, TRUE
ON CONFLICT (school_id, code) DO NOTHING;


-- ============================================
-- SEED DATA: Class Teachers (Junction Table)
-- ============================================

-- School 10001: Assign teachers to classes
INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT
    10001,
    c.id,
    5001, NULL, TRUE, '2026'
FROM classes c WHERE c.school_id = 10001 AND c.code = 'P1A'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT
    10001,
    c.id,
    5002, s.id, FALSE, '2026'
FROM classes c
CROSS JOIN (SELECT id FROM subjects WHERE school_id = 10001 AND code = 'MATH' LIMIT 1) s
WHERE c.school_id = 10001 AND c.code = 'P1A'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT
    10001,
    c.id,
    5003, s.id, FALSE, '2026'
FROM classes c
CROSS JOIN (SELECT id FROM subjects WHERE school_id = 10001 AND code = 'ENG' LIMIT 1) s
WHERE c.school_id = 10001 AND c.code = 'P1A'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT
    10001,
    c.id,
    5002, NULL, TRUE, '2026'
FROM classes c WHERE c.school_id = 10001 AND c.code = 'P1B'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT
    10001,
    c.id,
    5003, NULL, TRUE, '2026'
FROM classes c WHERE c.school_id = 10001 AND c.code = 'P2A'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT
    10001,
    c.id,
    5006, NULL, TRUE, '2026'
FROM classes c WHERE c.school_id = 10001 AND c.code = 'S1A'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT
    10001,
    c.id,
    5007, s.id, FALSE, '2026'
FROM classes c
CROSS JOIN (SELECT id FROM subjects WHERE school_id = 10001 AND code = 'MATH' LIMIT 1) s
WHERE c.school_id = 10001 AND c.code = 'S1A'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT
    10001,
    c.id,
    5007, NULL, TRUE, '2026'
FROM classes c WHERE c.school_id = 10001 AND c.code = 'S1B'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT
    10001,
    c.id,
    5008, NULL, TRUE, '2026'
FROM classes c WHERE c.school_id = 10001 AND c.code = 'S2A'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;


-- School 10002: Assign teachers to classes
INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT 10002, c.id, 5101, NULL, TRUE, '2026'
FROM classes c WHERE c.school_id = 10002 AND c.code = 'P1A-KIA'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT 10002, c.id, 5102, NULL, TRUE, '2026'
FROM classes c WHERE c.school_id = 10002 AND c.code = 'P1B-KIA'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT 10002, c.id, 5103, NULL, TRUE, '2026'
FROM classes c WHERE c.school_id = 10002 AND c.code = 'S1A-KIA'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;


-- School 10003: Assign teachers to classes
INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT 10003, c.id, 5201, NULL, TRUE, '2026'
FROM classes c WHERE c.school_id = 10003 AND c.code = 'P1A-MHS'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

INSERT INTO class_teachers (school_id, class_id, teacher_id, subject_id, is_primary, academic_year)
SELECT 10003, c.id, 5201, NULL, TRUE, '2026'
FROM classes c WHERE c.school_id = 10003 AND c.code = 'S1A-MHS'
ON CONFLICT (school_id, class_id, teacher_id, subject_id) DO NOTHING;

-- Seed students for Nakwero Secondary School (school_id = 10001)
INSERT INTO students (
    school_id, 
    admission_no, 
    first_name, 
    last_name, 
    date_of_birth, 
    gender,
    guardian_name,
    guardian_contact,
    enrollment_status,
    is_active,
    current_grade_id,
    current_stream,
    email,
    phone,
    nationality,
    address
) VALUES
-- Primary 1 (Grade Level P1)
(10001, 10001, 'Amina', 'Nakato', '2019-03-15', 'Female', 'John Nakato', '+256701234501', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'P1' AND school_id = 10001), 'A', 'amina.nakato@student.nakwero.edu.ug', '+256701234501', 'Ugandan', 'Kira, Wakiso'),
(10001, 10002, 'David', 'Mubiru', '2019-05-22', 'Male', 'Sarah Mubiru', '+256701234502', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'P1' AND school_id = 10001), 'A', 'david.mubiru@student.nakwero.edu.ug', '+256701234502', 'Ugandan', 'Kira, Wakiso'),
(10001, 10003, 'Faith', 'Achieng', '2019-01-10', 'Female', 'Peter Achieng', '+256701234503', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'P1' AND school_id = 10001), 'B', 'faith.achieng@student.nakwero.edu.ug', '+256701234503', 'Ugandan', 'Namugongo, Wakiso'),

-- Primary 2 (Grade Level P2)
(10001, 10011, 'Emmanuel', 'Okello', '2018-07-18', 'Male', 'Grace Okello', '+256701234511', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'P2' AND school_id = 10001), 'A', 'emmanuel.okello@student.nakwero.edu.ug', '+256701234511', 'Ugandan', 'Kajjansi, Wakiso'),
(10001, 10012, 'Sarah', 'Nabukeera', '2018-11-05', 'Female', 'Michael Nabukeera', '+256701234512', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'P2' AND school_id = 10001), 'A', 'sarah.nabukeera@student.nakwero.edu.ug', '+256701234512', 'Ugandan', 'Mityana, Wakiso'),

-- Senior 1 (Grade Level S1)
(10001, 20001, 'Joshua', 'Wasswa', '2013-04-12', 'Male', 'Robert Wasswa', '+256702234501', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S1' AND school_id = 10001), 'A', 'joshua.wasswa@student.nakwero.edu.ug', '+256702234501', 'Ugandan', 'Luzira, Kampala'),
(10001, 20002, 'Ruth', 'Namutebi', '2013-08-25', 'Female', 'Joseph Namutebi', '+256702234502', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S1' AND school_id = 10001), 'A', 'ruth.namutebi@student.nakwero.edu.ug', '+256702234502', 'Ugandan', 'Kisenyi, Kampala'),
(10001, 20003, 'Michael', 'Ochieng', '2013-02-28', 'Male', 'Paul Ochieng', '+256702234503', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S1' AND school_id = 10001), 'B', 'michael.ochieng@student.nakwero.edu.ug', '+256702234503', 'Ugandan', 'Bweyogerere, Wakiso'),
(10001, 20004, 'Grace', 'Adongo', '2013-12-01', 'Female', 'James Adongo', '+256702234504', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S1' AND school_id = 10001), 'B', 'grace.adongo@student.nakwero.edu.ug', '+256702234504', 'Ugandan', 'Kireka, Wakiso'),

-- Senior 2 (Grade Level S2)
(10001, 20011, 'Daniel', 'Kato', '2012-06-14', 'Male', 'Francis Kato', '+256702234511', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S2' AND school_id = 10001), 'A', 'daniel.kato@student.nakwero.edu.ug', '+256702234511', 'Ugandan', 'Ntungamo, Wakiso'),
(10001, 20012, 'Esther', 'Mbabazi', '2012-10-30', 'Female', 'David Mbabazi', '+256702234512', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S2' AND school_id = 10001), 'A', 'esther.mbabazi@student.nakwero.edu.ug', '+256702234512', 'Ugandan', 'Mengo, Kampala'),

-- Senior 3 (Grade Level S3)
(10001, 20021, 'John', 'Mukasa', '2011-03-22', 'Male', 'George Mukasa', '+256702234521', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S3' AND school_id = 10001), 'A', 'john.mukasa@student.nakwero.edu.ug', '+256702234521', 'Ugandan', 'Kasokoso, Wakiso'),
(10001, 20022, 'Mary', 'Gorret', '2011-09-08', 'Female', 'Simon Gorret', '+256702234522', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S3' AND school_id = 10001), 'A', 'mary.gorret@student.nakwero.edu.ug', '+256702234522', 'Ugandan', 'Kawempe, Kampala'),

-- Senior 4 (Grade Level S4)
(10001, 20031, 'Peter', 'Ssentamu', '2010-01-17', 'Male', 'Charles Ssentamu', '+256702234531', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S4' AND school_id = 10001), 'Science', 'peter.ssentamu@student.nakwero.edu.ug', '+256702234531', 'Ugandan', 'Wakiso, Central'),
(10001, 20032, 'Joyce', 'Nansubuga', '2010-05-11', 'Female', 'Thomas Nansubuga', '+256702234532', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S4' AND school_id = 10001), 'Science', 'joyce.nansubuga@student.nakwero.edu.ug', '+256702234532', 'Ugandan', 'Makerere, Kampala'),

-- Senior 5 (Grade Level S5)
(10001, 20041, 'Brian', 'Tumusiime', '2009-08-03', 'Male', 'Martin Tumusiime', '+256702234541', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S5' AND school_id = 10001), 'Science', 'brian.tumusiime@student.nakwero.edu.ug', '+256702234541', 'Ugandan', 'Rubaga, Kampala'),
(10001, 20042, 'Alice', 'Nakato', '2009-11-19', 'Female', 'John Nakato', '+256702234542', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S5' AND school_id = 10001), 'Science', 'alice.nakato@student.nakwero.edu.ug', '+256702234542', 'Ugandan', 'Nsambya, Kampala'),

-- Senior 6 (Grade Level S6)
(10001, 20051, 'Simon', 'Akol', '2008-02-27', 'Male', 'Patrick Akol', '+256702234551', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S6' AND school_id = 10001), 'Science', 'simon.akol@student.nakwero.edu.ug', '+256702234551', 'Ugandan', 'Mulago, Kampala'),
(10001, 20052, 'Dorothy', 'Akello', '2008-07-14', 'Female', 'Vincent Akello', '+256702234552', 'active', TRUE, (SELECT id FROM grade_levels WHERE code = 'S6' AND school_id = 10001), 'Science', 'dorothy.akello@student.nakwero.edu.ug', '+256702234552', 'Ugandan', 'Bugolobi, Kampala')
ON CONFLICT DO NOTHING;

-- Enroll students into classes (via class_students table)
-- First, create classes
INSERT INTO classes (school_id, grade_level_id, curriculum_id, name, code, stream, academic_year, room, capacity, is_active)
SELECT 10001, gl.id, c.id, gl.name || ' ' || g.stream, gl.code || g.stream, g.stream, '2026', g.stream || '-Room', 40, TRUE
FROM grade_levels gl
CROSS JOIN (VALUES ('A'), ('B'), ('Science')) AS g(stream)
JOIN curricula c ON c.school_id = 10001 AND c.code = 'UNC'
WHERE gl.school_id = 10001
ON CONFLICT DO NOTHING;

-- Enroll students into class_students for each class
INSERT INTO class_students (school_id, class_id, student_id, enrollment_date, is_active)
SELECT s.school_id, cl.id, s.id, '2026-01-15', TRUE
FROM students s
JOIN grade_levels gl ON gl.id = s.current_grade_id AND gl.school_id = s.school_id
JOIN classes cl ON cl.grade_level_id = gl.id AND cl.school_id = s.school_id AND cl.stream = s.current_stream
WHERE s.school_id = 10001
ON CONFLICT DO NOTHING;

-- Create enrollments linked to applications
INSERT INTO enrollments (
    school_id,
    application_id,
    student_id,
    enrollment_date,
    academic_year,
    grade_id,
    stream_id,
    enrollment_status,
    fees_category,
    fees_paid,
    fees_amount,
    is_active,
    is_deleted,
    completed_at
)
SELECT 
    s.school_id,
    a.id,
    s.id,
    '2026-01-15',
    '2026',
    s.current_grade_id,
    (SELECT id FROM streams WHERE name = s.current_stream AND school_id = s.school_id),
    'completed',
    'full',
    TRUE,
    CASE 
        WHEN gl.code LIKE 'P%' THEN 450000
        WHEN gl.code = 'S1' OR gl.code = 'S2' OR gl.code = 'S3' THEN 650000
        WHEN gl.code = 'S4' OR gl.code = 'S5' OR gl.code = 'S6' THEN 850000
        ELSE 500000
    END,
    TRUE,
    FALSE,
    '2026-01-15'
FROM students s
JOIN grade_levels gl ON gl.id = s.current_grade_id
JOIN applications a ON a.enrolled_student_id = s.id
WHERE s.school_id = 10001
ON CONFLICT DO NOTHING;


-- ============================================
-- ACADEMIC YEARS (2025, 2026, 2027)
-- ============================================

-- School 10001 Academic Years
INSERT INTO academic_years (school_id, name, start_date, end_date, is_current, is_active, created_by)
VALUES
(10001, '2025 Academic Year', '2025-01-15', '2025-12-15', false, true, 1),
(10001, '2026 Academic Year', '2026-01-15', '2026-12-15', true, true, 1),
(10001, '2027 Academic Year', '2027-01-15', '2027-12-15', false, true, 1)
ON CONFLICT (school_id, name) DO NOTHING;

-- School 10002 Academic Years
INSERT INTO academic_years (school_id, name, start_date, end_date, is_current, is_active, created_by)
VALUES
(10002, '2025 Academic Year', '2025-02-01', '2025-11-30', false, true, 1),
(10002, '2026 Academic Year', '2026-02-01', '2026-11-30', true, true, 1),
(10002, '2027 Academic Year', '2027-02-01', '2027-11-30', false, true, 1)
ON CONFLICT (school_id, name) DO NOTHING;

-- School 10003 Academic Years
INSERT INTO academic_years (school_id, name, start_date, end_date, is_current, is_active, created_by)
VALUES
(10003, '2025 Academic Year', '2025-03-01', '2025-12-01', false, true, 1),
(10003, '2026 Academic Year', '2026-03-01', '2026-12-01', true, true, 1),
(10003, '2027 Academic Year', '2027-03-01', '2027-12-01', false, true, 1)
ON CONFLICT (school_id, name) DO NOTHING;


-- ============================================
-- TERMS (for 2025, 2026, 2027 Academic Years)
-- ============================================

-- School 10001 Terms (2025)
INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10001, ay.id, 'Term 1', 'T1', '2025-01-20', '2025-04-15', false
FROM academic_years ay WHERE ay.school_id = 10001 AND ay.name = '2025 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10001, ay.id, 'Term 2', 'T2', '2025-05-04', '2025-08-14', false
FROM academic_years ay WHERE ay.school_id = 10001 AND ay.name = '2025 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10001, ay.id, 'Term 3', 'T3', '2025-08-24', '2025-12-10', false
FROM academic_years ay WHERE ay.school_id = 10001 AND ay.name = '2025 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

-- School 10001 Terms (2026)
INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10001, ay.id, 'Term 1', 'T1', '2026-01-20', '2026-04-15', true
FROM academic_years ay WHERE ay.school_id = 10001 AND ay.name = '2026 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10001, ay.id, 'Term 2', 'T2', '2026-05-04', '2026-08-14', true
FROM academic_years ay WHERE ay.school_id = 10001 AND ay.name = '2026 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10001, ay.id, 'Term 3', 'T3', '2026-08-24', '2026-12-10', true
FROM academic_years ay WHERE ay.school_id = 10001 AND ay.name = '2026 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

-- School 10001 Terms (2027)
INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10001, ay.id, 'Term 1', 'T1', '2027-01-20', '2027-04-15', false
FROM academic_years ay WHERE ay.school_id = 10001 AND ay.name = '2027 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10001, ay.id, 'Term 2', 'T2', '2027-05-04', '2027-08-14', false
FROM academic_years ay WHERE ay.school_id = 10001 AND ay.name = '2027 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10001, ay.id, 'Term 3', 'T3', '2027-08-24', '2027-12-10', false
FROM academic_years ay WHERE ay.school_id = 10001 AND ay.name = '2027 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

-- School 10002 Terms (2025)
INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10002, ay.id, 'Term 1', 'T1', '2025-02-02', '2025-04-24', false
FROM academic_years ay WHERE ay.school_id = 10002 AND ay.name = '2025 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10002, ay.id, 'Term 2', 'T2', '2025-05-11', '2025-08-21', false
FROM academic_years ay WHERE ay.school_id = 10002 AND ay.name = '2025 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10002, ay.id, 'Term 3', 'T3', '2025-09-01', '2025-11-27', false
FROM academic_years ay WHERE ay.school_id = 10002 AND ay.name = '2025 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

-- School 10002 Terms (2026)
INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10002, ay.id, 'Term 1', 'T1', '2026-02-02', '2026-04-24', true
FROM academic_years ay WHERE ay.school_id = 10002 AND ay.name = '2026 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10002, ay.id, 'Term 2', 'T2', '2026-05-11', '2026-08-21', true
FROM academic_years ay WHERE ay.school_id = 10002 AND ay.name = '2026 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10002, ay.id, 'Term 3', 'T3', '2026-09-01', '2026-11-27', true
FROM academic_years ay WHERE ay.school_id = 10002 AND ay.name = '2026 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

-- School 10002 Terms (2027)
INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10002, ay.id, 'Term 1', 'T1', '2027-02-02', '2027-04-24', false
FROM academic_years ay WHERE ay.school_id = 10002 AND ay.name = '2027 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10002, ay.id, 'Term 2', 'T2', '2027-05-11', '2027-08-21', false
FROM academic_years ay WHERE ay.school_id = 10002 AND ay.name = '2027 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10002, ay.id, 'Term 3', 'T3', '2027-09-01', '2027-11-27', false
FROM academic_years ay WHERE ay.school_id = 10002 AND ay.name = '2027 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

-- School 10003 Terms (2025)
INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10003, ay.id, 'Term 1', 'T1', '2025-03-02', '2025-05-22', false
FROM academic_years ay WHERE ay.school_id = 10003 AND ay.name = '2025 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10003, ay.id, 'Term 2', 'T2', '2025-06-08', '2025-08-28', false
FROM academic_years ay WHERE ay.school_id = 10003 AND ay.name = '2025 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10003, ay.id, 'Term 3', 'T3', '2025-09-14', '2025-11-30', false
FROM academic_years ay WHERE ay.school_id = 10003 AND ay.name = '2025 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

-- School 10003 Terms (2026)
INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10003, ay.id, 'Term 1', 'T1', '2026-03-02', '2026-05-22', true
FROM academic_years ay WHERE ay.school_id = 10003 AND ay.name = '2026 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10003, ay.id, 'Term 2', 'T2', '2026-06-08', '2026-08-28', true
FROM academic_years ay WHERE ay.school_id = 10003 AND ay.name = '2026 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

INSERT INTO terms (school_id, academic_year_id, name, code, start_date, end_date, is_active)
SELECT 10003, ay.id, 'Term 3', 'T3', '2026-09-14', '2026-11-30', true
FROM academic_years ay WHERE ay.school_id = 10003 AND ay.name = '2026 Academic Year'
ON CONFLICT (school_id, academic_year_id, name) DO NOTHING;

-- Schools 10002 & 10003 subjects already seeded above
-- Skipping duplicate subject seeding for other schools

-- ============================================
-- Route Permissions: Sidebar Menu Configuration
-- ============================================

-- Lesson Deliveries
UPDATE route_permissions
SET
  display_name = 'Lesson Deliveries',
  icon = 'pi-bookmark',
  is_menu_item = TRUE,
  display_order = 25,
  group_name = 'classes_scheduling',
  updated_at = NOW()
WHERE module = 'academics' AND resource = 'lesson_deliveries';

-- Hide Assessment Results as a standalone menu item (it's part of the Grade Book)
UPDATE route_permissions
SET is_menu_item = FALSE
WHERE module = 'academics' AND resource = 'assessment_results';

-- Hide Assessment Calendar as a standalone menu item (it's part of the Assessments page)
UPDATE route_permissions
SET is_menu_item = FALSE
WHERE module = 'academics' AND resource = 'assessment_calendar';

-- Academic Setup group
UPDATE route_permissions
SET group_name = 'academic_setup', display_order = 10
WHERE module = 'academics'
  AND resource IN ('academic_setup', 'academic_years', 'terms', 'subjects', 'curricula', 'grade_levels', 'streams')
  AND (group_name IS NULL OR group_name = '');

-- Classes & Scheduling single menu item (like Academic Setup, not a group)
UPDATE route_permissions
SET group_name = '_flat', display_order = 15, is_menu_item = TRUE, display_name = 'Classroom Management'
WHERE module = 'academics'
  AND resource = 'classes_scheduling';

-- Classes & Scheduling sub-items group
UPDATE route_permissions
SET group_name = 'classes_scheduling', display_order = 20
WHERE module = 'academics'
  AND resource IN ('classes', 'timetables', 'lessons', 'lesson_deliveries');

-- Assessments & Grading single menu item (like Classroom Management, not a group)
UPDATE route_permissions
SET group_name = '_flat', display_order = 17, is_menu_item = TRUE, display_name = 'Assessments & Grading'
WHERE module = 'academics'
  AND resource = 'assessments_grading';

-- Assessments & Grading sub-items group
UPDATE route_permissions
SET group_name = 'assessments_grading', display_order = 30
WHERE module = 'academics'
  AND resource IN ('assessments', 'exams', 'exam_results', 'assignments', 'assignment_submissions', 'gradebook', 'student_report', 'assessment_calendar', 'assessment_results')
  AND (group_name IS NULL OR group_name = '');

-- Reports & Analytics group (Hidden from menu)
UPDATE route_permissions 
SET group_name = 'reports_analytics', display_order = 40, is_menu_item = FALSE
WHERE module = 'academics' 
  AND resource IN ('report_cards', 'student_grades', 'class_schedule', 'exam_results', 'assignment_submissions')
  AND (group_name IS NULL OR group_name = '');

-- Hide Reports & Analytics group itself from menu
UPDATE route_permissions
SET is_menu_item = FALSE, display_name = 'Reports & Analytics'
WHERE module = 'academics' AND resource = 'reports_analytics';

-- Dashboard & Management
UPDATE route_permissions 
SET display_name = 'Dashboard', icon = 'pi-home', display_order = 1, group_name = NULL
WHERE module = 'academics' AND resource = 'dashboard';

UPDATE route_permissions 
SET display_name = 'Management', icon = 'pi-cog', display_order = 5
WHERE module = 'academics' AND resource = 'management';
