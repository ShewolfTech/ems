-- ============================================
-- Seed Permissions for All Resources
-- Run this LAST after all tables exist
-- Uses MAX(id) + ROW_NUMBER() to avoid conflicts
-- ============================================

-- Applications Permissions
INSERT INTO permissions (id, name, module, resource, action, description, is_active)
SELECT 
  (SELECT COALESCE(MAX(id), 0) FROM permissions) + ROW_NUMBER() OVER (),
  name, module, resource, action, description, is_active
FROM (
  VALUES
    ('View Applications', 'admissions', 'applications', 'view', 'View applications', TRUE),
    ('Create Applications', 'admissions', 'applications', 'create', 'Create applications', TRUE),
    ('Update Applications', 'admissions', 'applications', 'update', 'Update applications', TRUE),
    ('Delete Applications', 'admissions', 'applications', 'delete', 'Delete applications', TRUE),
    ('Manage Applications', 'admissions', 'applications', 'manage', 'Full applications management', TRUE)
) AS v(name, module, resource, action, description, is_active)
ON CONFLICT ON CONSTRAINT permissions_resource_action_unique DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Interviews Permissions
INSERT INTO permissions (id, name, module, resource, action, description, is_active)
SELECT 
  (SELECT COALESCE(MAX(id), 0) FROM permissions) + ROW_NUMBER() OVER (),
  name, module, resource, action, description, is_active
FROM (
  VALUES
    ('View Interviews', 'admissions', 'interviews', 'view', 'View interviews', TRUE),
    ('Schedule Interviews', 'admissions', 'interviews', 'create', 'Schedule interviews', TRUE),
    ('Update Interviews', 'admissions', 'interviews', 'update', 'Update interviews', TRUE),
    ('Cancel Interviews', 'admissions', 'interviews', 'delete', 'Cancel interviews', TRUE),
    ('Complete Interviews', 'admissions', 'interviews', 'complete', 'Complete interviews', TRUE)
) AS v(name, module, resource, action, description, is_active)
ON CONFLICT ON CONSTRAINT permissions_resource_action_unique DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Entrance Exams Permissions
INSERT INTO permissions (id, name, module, resource, action, description, is_active)
SELECT 
  (SELECT COALESCE(MAX(id), 0) FROM permissions) + ROW_NUMBER() OVER (),
  name, module, resource, action, description, is_active
FROM (
  VALUES
    ('View Exams', 'admissions', 'entrance_exams', 'view', 'View entrance exams', TRUE),
    ('Create Exams', 'admissions', 'entrance_exams', 'create', 'Create entrance exams', TRUE),
    ('Update Exams', 'admissions', 'entrance_exams', 'update', 'Update entrance exams', TRUE),
    ('Delete Exams', 'admissions', 'entrance_exams', 'delete', 'Delete entrance exams', TRUE),
    ('Manage Exams', 'admissions', 'entrance_exams', 'manage', 'Full exam management', TRUE)
) AS v(name, module, resource, action, description, is_active)
ON CONFLICT ON CONSTRAINT permissions_resource_action_unique DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Decisions Permissions
INSERT INTO permissions (id, name, module, resource, action, description, is_active)
SELECT 
  (SELECT COALESCE(MAX(id), 0) FROM permissions) + ROW_NUMBER() OVER (),
  name, module, resource, action, description, is_active
FROM (
  VALUES
    ('View Decisions', 'admissions', 'decisions', 'view', 'View admission decisions', TRUE),
    ('Make Decisions', 'admissions', 'decisions', 'make', 'Make admission decisions', TRUE),
    ('Update Decisions', 'admissions', 'decisions', 'update', 'Update decisions', TRUE)
) AS v(name, module, resource, action, description, is_active)
ON CONFLICT ON CONSTRAINT permissions_resource_action_unique DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Enrollments Permissions
INSERT INTO permissions (id, name, module, resource, action, description, is_active)
SELECT
  (SELECT COALESCE(MAX(id), 0) FROM permissions) + ROW_NUMBER() OVER (),
  name, module, resource, action, description, is_active
FROM (
  VALUES
    ('View Enrollments', 'admissions', 'enrollments', 'view', 'View enrollments', TRUE),
    ('Create Enrollments', 'admissions', 'enrollments', 'create', 'Create enrollments', TRUE),
    ('Update Enrollments', 'admissions', 'enrollments', 'update', 'Update enrollments', TRUE),
    ('Complete Enrollments', 'admissions', 'enrollments', 'complete', 'Complete enrollments', TRUE)
) AS v(name, module, resource, action, description, is_active)
ON CONFLICT ON CONSTRAINT permissions_resource_action_unique DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  is_active = EXCLUDED.is_active;

-- Dashboard Permissions
INSERT INTO permissions (id, name, module, resource, action, description, is_active)
SELECT
  (SELECT COALESCE(MAX(id), 0) FROM permissions) + ROW_NUMBER() OVER (),
  name, module, resource, action, description, is_active
FROM (
  VALUES
    ('View Dashboard', 'admissions', 'dashboard', 'view', 'View admissions dashboard', TRUE)
) AS v(name, module, resource, action, description, is_active)
ON CONFLICT ON CONSTRAINT permissions_resource_action_unique DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- ============================================
-- Sync User Permissions
-- For all active users
-- ============================================

INSERT INTO user_permissions (
  school_id,
  user_id,
  module,
  resource,
  action,
  permission_id,
  is_allowed
)
SELECT 
  u.school_id,
  u.id,
  p.module,
  p.resource,
  p.action,
  p.id,
  TRUE
FROM users u
CROSS JOIN permissions p
WHERE u.is_deleted = false
  AND u.is_active = true
  AND p.is_active = true
  AND p.resource IN (
    'applications',
    'interviews',
    'entrance_exams',
    'decisions',
    'enrollments',
    'dashboard',
    'enquiries'
  )
ON CONFLICT (school_id, user_id, module, resource, action) 
DO UPDATE SET is_allowed = TRUE;

DO $$
DECLARE
  v_user_count INTEGER;
  v_perm_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT user_id) INTO v_user_count 
  FROM user_permissions 
  WHERE resource IN ('applications', 'interviews', 'entrance_exams', 'decisions', 'enrollments');
  
  SELECT COUNT(*) INTO v_perm_count 
  FROM permissions 
  WHERE resource IN ('applications', 'interviews', 'entrance_exams', 'decisions', 'enrollments');
  
  RAISE NOTICE '✅ Synced % permissions for % users', v_perm_count, v_user_count;
END $$;

-- ============================================
-- Verify Permissions
-- ============================================

SELECT 
  p.module,
  p.resource,
  COUNT(p.id) as permission_count,
  COUNT(DISTINCT up.user_id) as users_with_access
FROM permissions p
LEFT JOIN user_permissions up ON p.id = up.permission_id
WHERE p.resource IN (
  'applications',
  'interviews',
  'entrance_exams',
  'exam_sessions',
  'exam_definitions',
  'decisions',
  'enrollments',
  'dashboard',
  'pipeline_stats',
  'enquiries'
)
GROUP BY p.module, p.resource
ORDER BY p.module, p.resource;


 INSERT INTO public.relationship_types (name) VALUES 
('Father'), 
('Mother'),
('Legal Guardian'), 
('Uncle'), 
('Aunt'),
('Sibling'), 
('Sponsor'),
('Other')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE entrance_exams DROP COLUMN percentage;
ALTER TABLE entrance_exams ADD COLUMN percentage NUMERIC(5,2) GENERATED ALWAYS AS (
  CASE WHEN total_marks > 0 THEN (marks_obtained::NUMERIC / total_marks * 100) ELSE 0 END
) STORED;