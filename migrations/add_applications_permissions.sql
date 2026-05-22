-- ============================================
-- Add Applications Permissions (Granular CRUD)
-- ============================================
/*
-- Step 1: Insert granular permissions for applications resource
INSERT INTO permissions (id,module, resource, action, name, description, is_active)
VALUES
  (242,'admissions', 'applications', 'create', 'Create Applications', 'Can create new applications', true),
  (243,'admissions', 'applications', 'read', 'View Applications', 'Can view applications', true),
  (244,'admissions', 'applications', 'update', 'Update Applications', 'Can update existing applications', true),
  (245,'admissions', 'applications', 'delete', 'Delete Applications', 'Can delete applications', true),
  (246,'admissions', 'applications', 'manage', 'Manage Applications', 'Full access to all application operations', true)
ON CONFLICT (resource, action) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

*/


/*

-- Step 2: Assign all permissions to Admin role (role_id = 1 or first admin role)
-- Adjust role_id based on your actual admin role ID
INSERT INTO role_permissions (role_id, permission_key, school_id, is_active)
SELECT 
  r.id as role_id,
  pk.permission_key,
  1 as school_id,
  true as is_active
FROM roles r
CROSS JOIN (
  VALUES 
    ('applications.create'),
    ('applications.read'),
    ('applications.update'),
    ('applications.delete'),
    ('applications.manage')
) pk(permission_key)
WHERE r.is_active = true
  AND (r.name ILIKE '%admin%' OR r.code = 100)  -- Adjust to match your admin role
ON CONFLICT (role_id, permission_key, school_id) DO UPDATE SET
  is_active = true;

-- Step 3: Assign read permission to all other active roles (so they can at least view)
INSERT INTO role_permissions (role_id, permission_key, school_id, is_active)
SELECT 
  r.id as role_id,
  'applications.read' as permission_key,
  1 as school_id,
  true as is_active
FROM roles r
WHERE r.is_active = true
  AND NOT (r.name ILIKE '%admin%' OR r.code = 100)  -- Exclude admin roles (already have all)
ON CONFLICT (role_id, permission_key, school_id) DO UPDATE SET
  is_active = true;

-- Step 4: Also assign to all users directly (if you use user_permissions table)
INSERT INTO user_permissions (school_id, user_id, module, resource, action, permission_id, is_allowed)
SELECT
  1 as school_id,
  u.id as user_id,
  'admissions' as module,
  'applications' as resource,
  p.action,
  p.id as permission_id,
  true as is_allowed
FROM users u
CROSS JOIN permissions p
WHERE p.resource = 'applications'
  AND u.is_deleted = false
  AND u.is_active = true
  AND u.school_id = 1
ON CONFLICT (school_id, user_id, module, resource, action) DO UPDATE SET
  is_allowed = true;

-- Step 5: Verify permissions were added
SELECT 
  '✅ Permissions Added' as status,
  COUNT(*) as count
FROM permissions 
WHERE resource = 'applications';

-- Step 6: Show all applications permissions
SELECT 
  resource,
  action,
  permission_key,
  name,
  description,
  is_active
FROM permissions 
WHERE resource = 'applications'
ORDER BY 
  CASE action
    WHEN 'create' THEN 1
    WHEN 'read' THEN 2
    WHEN 'update' THEN 3
    WHEN 'delete' THEN 4
    WHEN 'manage' THEN 5
  END;

-- Step 7: Verify role permissions
SELECT 
  '✅ Role Permissions Assigned' as status,
  r.name as role_name,
  COUNT(*) as permissions_count
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_key = p.permission_key
WHERE p.resource = 'applications'
  AND rp.school_id = 1
GROUP BY r.name;

-- Step 8: Show which roles have which permissions
SELECT 
  r.name as role_name,
  p.action,
  p.name as permission_name,
  rp.is_active
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_key = p.permission_key
WHERE p.resource = 'applications'
  AND rp.school_id = 1
ORDER BY r.name, 
  CASE p.action
    WHEN 'create' THEN 1
    WHEN 'read' THEN 2
    WHEN 'update' THEN 3
    WHEN 'delete' THEN 4
    WHEN 'manage' THEN 5
  END;

*/

