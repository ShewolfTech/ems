/**
 * Script to generate SQL for renaming database columns from snake_case to camelCase
 * This generates the actual SQL commands to run against the database
 * Usage: npx tsx scripts/generate_CamelCase_Migration.ts
 */
import { promises as fs } from "fs";
import path from "path";

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Common column mappings (most used columns)
const commonColumns = [
  'id', 'school_id', 'user_id', 'role_id', 'parent_id', 'created_by', 'ammended_by', 'deleted_by',
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
];

async function generateMigration() {
  const migrationsDir = path.resolve("migrations");
  
  // Read all migration files to understand the schema
  try {
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith(".sql")).sort();
    
    // Collect all tables and their columns
    const tables = new Map<string, Set<string>>();
    
    for (const file of sqlFiles) {
      const content = await fs.readFile(path.join(migrationsDir, file), "utf-8");
      
      // Find CREATE TABLE statements
      const tableMatches = content.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)\s*\(([\s\S]*?)\);/gi);
      
      for (const match of tableMatches) {
        const tableName = match[1];
        const columnsStr = match[2];
        
        if (!tables.has(tableName)) {
          tables.set(tableName, new Set());
        }
        
        // Extract column names
        const columnMatches = columnsStr.matchAll(/^\s*(\w+)\s+/gm);
        for (const colMatch of columnMatches) {
          tables.get(tableName)!.add(colMatch[1]);
        }
      }
    }
    
    // Generate SQL for renaming columns
    let sql = `-- ============================================\n`;
    sql += `-- Migration: Rename columns from snake_case to camelCase\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- ============================================\n\n`;
    sql += `-- ⚠️  WARNING: This migration renames database columns!\n`;
    sql += `-- ⚠️  Make sure to backup your database before running this!\n`;
    sql += `-- ⚠️  Run this in a transaction to ensure atomicity!\n\n`;
    
    sql += `BEGIN;\n\n`;
    
    // Generate rename statements for each table
    for (const [tableName, columns] of tables) {
      const snakeColumns = [...columns].filter(c => c.includes('_'));
      
      if (snakeColumns.length > 0) {
        sql += `-- Table: ${tableName}\n`;
        
        for (const col of snakeColumns) {
          const newCol = snakeToCamel(col);
          sql += `-- ALTER TABLE ${tableName} RENAME COLUMN ${col} TO ${newCol};\n`;
        }
        sql += `\n`;
      }
    }
    
    sql += `-- ============================================\n`;
    sql += `-- Also update indexes and constraints:\n`;
    sql += `-- ============================================\n\n`;
    
    // Generate index renames
    for (const [tableName, columns] of tables) {
      const snakeColumns = [...columns].filter(c => c.includes('_'));
      
      if (snakeColumns.length > 0) {
        sql += `-- Indexes for ${tableName}:\n`;
        
        for (const col of snakeColumns) {
          const newCol = snakeToCamel(col);
          sql += `-- DROP INDEX IF EXISTS idx_${tableName}_${col};\n`;
          sql += `-- CREATE INDEX idx_${tableName}_${newCol} ON ${tableName}(${newCol});\n`;
        }
        sql += `\n`;
      }
    }
    
    sql += `COMMIT;\n`;
    
    // Write to file
    const outputPath = path.join(migrationsDir, "MIGRATION_camelCase_rename.sql");
    await fs.writeFile(outputPath, sql, "utf-8");
    
    console.log(`✅ Generated migration: ${outputPath}`);
    console.log(`\nFound ${tables.size} tables with ${[...tables.values()].reduce((a, b) => a + b.size, 0)} total columns`);
    console.log(`\n⚠️  Review the generated SQL before running it!`);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

generateMigration();
