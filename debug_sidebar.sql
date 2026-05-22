-- Debug script to check sidebar menu items
-- Run this to see what's in the route_permissions table

-- 1. Check if route_permissions table has data
SELECT COUNT(*) as total_route_permissions FROM route_permissions;

-- 2. Check how many have is_menu_item = true
SELECT COUNT(*) as menu_items_count FROM route_permissions WHERE is_menu_item = true;

-- 3. Check sample route_permissions data
SELECT 
  rp.id,
  rp.route,
  rp.method,
  rp.action,
  rp.module,
  rp.resource,
  rp.permission_key,
  rp.display_name,
  rp.is_menu_item,
  rp.display_order
FROM route_permissions rp
LIMIT 20;

-- 4. Check permissions table
SELECT 
  p.id,
  p.name,
  p.module,
  p.resource,
  p.action,
  p.permission_key
FROM permissions p
LIMIT 20;

-- 5. Check if trigger is working - see if route_permissions are being created
SELECT 
  p.permission_key as perm_key,
  rp.permission_key as route_perm_key,
  rp.is_menu_item
FROM permissions p
LEFT JOIN route_permissions rp ON rp.permission_key = p.permission_key
WHERE p.permission_key LIKE '%.read' OR p.permission_key LIKE '%.manage'
LIMIT 20;

-- 6. Check user permissions for a specific user (replace USER_ID with actual user ID)
-- SELECT 
--   up.user_id,
--   p.permission_key,
--   rp.route,
--   rp.display_name,
--   rp.is_menu_item
-- FROM user_permissions up
-- JOIN permissions p ON up.permission_id = p.id
-- LEFT JOIN route_permissions rp ON rp.permission_key = p.permission_key
-- WHERE up.user_id = USER_ID AND up.school_id = SCHOOL_ID;

-- 7. Check role permissions for a specific role (replace ROLE_ID with actual role ID)
-- SELECT 
--   rp2.role_id,
--   p.permission_key,
--   rp.route,
--   rp.display_name,
--   rp.is_menu_item
-- FROM role_permissions rp2
-- JOIN permissions p ON rp2.permission_key = p.permission_key
-- LEFT JOIN route_permissions rp ON rp.permission_key = p.permission_key
-- WHERE rp2.role_id = ROLE_ID AND rp2.school_id = SCHOOL_ID;
