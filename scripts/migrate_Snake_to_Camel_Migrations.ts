/**
 * Script to rename columns in migration files from snake_case to camelCase
 * Uses a list of common column names for targeted replacement
 * Usage: cd scripts && pnpm ts-node migrate_Snake_to_Camel_Migrations.ts
 */
import { promises as fs } from "fs";
import path from "path";

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Common column names that appear throughout the codebase
const commonColumns = [
  'school_id', 'user_id', 'role_id', 'parent_id', 'created_by', 'ammended_by', 'deleted_by',
  'created_at', 'ammended_at', 'deleted_at', 'last_login',
  'is_active', 'is_deleted', 'is_system',
  'first_name', 'last_name', 'date_of_birth', 'phone_number', 'email_address',
  'auth_uid', 'username', 'password', 'token', 'secret',
  'name', 'title', 'description', 'content', 'amount', 'quantity', 'price', 'total',
  'start_date', 'end_date', 'start_time', 'end_time', 'duration',
  'status', 'type', 'category', 'priority', 'level',
  'country', 'city', 'address', 'latitude', 'longitude',
  'file_url', 'file_name', 'file_size', 'mime_type',
  'notes', 'comments', 'metadata', 'settings', 'options', 'data',
  'academic_year_id', 'term_id', 'grade_id', 'section_id', 'subject_id',
  'attendance_id', 'enrollment_id', 'student_id', 'teacher_id', 'class_id',
  'leave_type_id', 'leave_request_id', 'approver_id',
  'is_approved', 'approved_by', 'approved_at', 'reason',
  'is_required', 'is_optional', 'is_visible', 'is_locked', 'is_hidden',
  'view_count', 'like_count', 'share_count', 'download_count',
  'sort_order', 'display_order', 'order_index',
  'created_date', 'modified_date', 'effective_date', 'expiry_date',
  'response', 'result', 'score', 'grade', 'points', 'percentage',
  'session_id', 'device_id', 'ip_address', 'user_agent', 'browser', 'os',
  'table_name', 'column_name', 'constraint_name', 'index_name',
  'old_value', 'new_value', 'previous_value', 'current_value',
  'action', 'event', 'activity', 'operation', 'method', 'endpoint',
  'is_enabled', 'is_verified', 'is_confirmed', 'is_subscribed',
  'entity_type', 'entity_id', 'reference_id', 'reference_type',
  'source', 'destination', 'origin', 'target', 'object',
  'max_attempts', 'attempt_count', 'retry_count', 'fail_count',
  'expires_at', 'activated_at', 'deactivated_at', 'suspended_at',
  'department_id', 'employee_id', 'manager_id', 'supervisor_id',
  'admission_no', 'guardian_name', 'guardian_contact', 'previous_school',
  'admission_status_id', 'admission_date', 'enrollment_date',
  'promotion_date', 'old_role_id', 'new_role_id', 'old_department_id', 'new_department_id',
  'asset_code', 'asset_type_id', 'qr_code', 'nfc_tag', 'serial_number', 'warranty_expiry',
  'is_biometric', 'requires_calibration', 'vendor_requirements',
  'subcategory', 'purpose', 'vendor', 'location',
  'curriculum_id', 'curriculum_subject_id', 'grade_level_id',
  'class_id', 'class_student_id', 'timetable_id',
  'scheduled_date', 'scheduled_time',
  'assessment_type_id', 'assessment_id', 'max_score', 'weight',
  'assignment_id', 'submission_date', 'submission_content',
  'exam_id', 'exam_date', 'grade_letter', 'grade_point',
  'from_class_id', 'to_class_id', 'from_grade_level_id', 'to_grade_level_id',
  'gpa', 'percentage', 'attendancePercentage', 'teacher_comment', 'class_teacher_id',
  'total_days', 'days_present',
  'is_final', 'is_public',
  'resource_type', 'resource_id', 'old_value', 'new_value',
  'key_hash', 'expires_at', 'scopes',
  'field_name', 'field_type', 'default_value',
  'query_template', 'refresh_rate',
  'channel', 'recipient_id', 'sender_id', 'group_id', 'subject', 'body',
  'actor_id', 'target_type', 'target_id', 'details',
  'parent_id', 'student_id', 'priority',
  'module', 'resource', 'action', 'is_allowed',
  'config', 'event', 'secret', 'url',
  'code', 'label', 'value',
  // Add more as needed
];

// Generate all variations (with underscore prefix for parameters)
const allReplacements: { from: RegExp, to: string }[] = [];

commonColumns.forEach(col => {
  // Regular column
  allReplacements.push({
    from: new RegExp(`\\b${col}\\b`, 'g'),
    to: snakeToCamel(col)
  });
  // Parameter with underscore prefix
  const paramName = '_' + col;
  allReplacements.push({
    from: new RegExp(`\\b${paramName}\\b`, 'g'),
    to: '_' + snakeToCamel(col)
  });
});

async function processMigrationFile(filePath: string) {
  let content = await fs.readFile(filePath, "utf-8");
  const originalContent = content;

  // 1. Handle TIMESTAMPTZ -> TIMESTAMP
  content = content.replace(/TIMESTAMPTZ/g, "TIMESTAMP");

  // 2. Apply all column replacements
  for (const { from, to } of allReplacements) {
    content = content.replace(from, to);
  }

  // 3. Handle specific patterns that need special attention
  
  // Handle CURRENT_TIMESTAMP, NOW(), etc. - don't change these
  // Already handled by word boundary \b
  
  // Handle table.column references in ON CONFLICT
  content = content.replace(/ON CONFLICT\s*\(([\w_\s,]+)\)/gi, (match, columns) => {
    const cols = columns.split(',').map((c: string) => c.trim());
    const camelCols = cols.map((c: string) => {
      const found = commonColumns.find(col => col === c);
      return found ? snakeToCamel(found) : c;
    });
    return `ON CONFLICT (${camelCols.join(', ')})`;
  });

  if (content !== originalContent) {
    await fs.writeFile(filePath, content, "utf-8");
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }
  return false;
}

async function main() {
  const migrationsDir = path.resolve("../migrations");
  
  try {
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith(".sql"));
    
    console.log(`Found ${sqlFiles.length} migration files`);
    console.log(`Processing ${commonColumns.length} common columns...\n`);
    
    let ammendedCount = 0;
    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const ammended = await processMigrationFile(filePath);
      if (ammended) ammendedCount++;
    }
    
    console.log(`\n✅ Migration complete! Updated ${ammendedCount} files.`);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
