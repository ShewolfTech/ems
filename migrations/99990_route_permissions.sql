-- ============================================
-- 9999_route_permissions_updated.sql
-- Global registry + Multi-tenant UI Bridge
-- ============================================

-- Table definition with route_type discriminator
CREATE TABLE IF NOT EXISTS public.route_permissions (
    id BIGSERIAL PRIMARY KEY,
    route TEXT NOT NULL,                     -- e.g. "/students", "/academics/classes", "/reporting/dashboard"
    method VARCHAR(10) NOT NULL,             -- e.g. "POST", "GET", "PUT", "DELETE"
    action VARCHAR(100) NOT NULL,            -- e.g. "students.create", "classes.read", "dashboards.export"
    module VARCHAR(100) NOT NULL,            -- e.g. "students", "academics", "reporting"
    resource VARCHAR(100) NOT NULL,          -- e.g. "students", "classes", "dashboards"
    permission_key VARCHAR(200) REFERENCES permissions(permission_key) ON DELETE CASCADE,

    -- UI Metadata
    display_name VARCHAR(100),               
    icon VARCHAR(50) DEFAULT 'pi-folder',    
    is_menu_item BOOLEAN DEFAULT TRUE,       
    display_order INTEGER DEFAULT 0,         

    -- Lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- NEW discriminator column
    route_type VARCHAR(20) DEFAULT 'crud',    -- values: 'crud', 'view', 'report'
    is_global BOOLEAN DEFAULT FALSE,              -- Indicates if the route is global (not tenant-specific)

    -- Grouping for sidebar organization
    group_name VARCHAR(50)                        -- e.g., 'academic_setup', 'class_management', 'reports'
);

-- Uniqueness index
CREATE UNIQUE INDEX IF NOT EXISTS idx_route_permissions_unique
ON public.route_permissions(route, method, action);

-- Enhanced Sync Trigger Function
CREATE OR REPLACE FUNCTION sync_route_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Determine route_type based on permission resource
  IF NEW.action = 'read' AND NEW.resource LIKE '%_view' THEN
    -- Views are always read-only
    INSERT INTO public.route_permissions (
      route, method, action, module, resource, permission_key,
      display_name, icon, is_menu_item, route_type, group_name
    )
    VALUES (
      '/' || NEW.module || '/' || regexp_replace(NEW.resource, '\..*$', ''),
      'GET',
      NEW.permission_key,
      NEW.module,
      regexp_replace(NEW.resource, '\..*$', ''),
      NEW.permission_key,
      INITCAP(REPLACE(REPLACE(NEW.resource, '.', ' '), '_', ' ')),
      'pi-chart',
      TRUE,
      'view',
      NULL
    )
    ON CONFLICT (route, method, action) DO UPDATE
      SET module = EXCLUDED.module,
          resource = EXCLUDED.resource,
          permission_key = EXCLUDED.permission_key,
          route_type = 'view',
          updated_at = NOW();

  ELSIF NEW.module = 'reporting' THEN
    -- Reporting routes
    INSERT INTO public.route_permissions (
      route, method, action, module, resource, permission_key,
      display_name, icon, is_menu_item, route_type, group_name
    )
    VALUES (
      '/' || NEW.module || '/' || regexp_replace(NEW.resource, '\..*$', ''),
      'GET',
      NEW.permission_key,
      NEW.module,
      regexp_replace(NEW.resource, '\..*$', ''),
      NEW.permission_key,
      INITCAP(REPLACE(REPLACE(NEW.resource, '.', ' '), '_', ' ')),
      'pi-chart',
      TRUE,
      'report',
      NULL
    )
    ON CONFLICT (route, method, action) DO UPDATE
      SET module = EXCLUDED.module,
          resource = EXCLUDED.resource,
          permission_key = EXCLUDED.permission_key,
          route_type = 'report',
          updated_at = NOW();

  ELSE
    -- CRUD routes
    INSERT INTO public.route_permissions (
      route, method, action, module, resource, permission_key,
      display_name, icon, is_menu_item, route_type, group_name
    )
    VALUES (
      '/' || NEW.module || '/' || regexp_replace(NEW.resource, '\..*$', ''),
      CASE
        WHEN NEW.action = 'create' THEN 'POST'
        WHEN NEW.action = 'read'   THEN 'GET'
        WHEN NEW.action = 'update' THEN 'PUT'
        WHEN NEW.action = 'delete' THEN 'DELETE'
        ELSE 'GET'
      END,
      NEW.permission_key,
      NEW.module,
      regexp_replace(NEW.resource, '\..*$', ''),
      NEW.permission_key,
      INITCAP(REPLACE(REPLACE(NEW.resource, '.', ' '), '_', ' ')),
      'pi-folder',
      TRUE,
      'crud',
      NULL
    )
    ON CONFLICT (route, method, action) DO UPDATE
      SET module = EXCLUDED.module,
          resource = EXCLUDED.resource,
          permission_key = EXCLUDED.permission_key,
          route_type = 'crud',
          updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- Bind trigger to permissions table
DROP TRIGGER IF EXISTS trg_sync_route_permissions ON permissions;
CREATE TRIGGER trg_sync_route_permissions
AFTER INSERT OR UPDATE ON permissions
FOR EACH ROW
EXECUTE FUNCTION sync_route_permissions();

-- Standard Triggers
DROP TRIGGER IF EXISTS permissions_sync ON permissions;
CREATE TRIGGER permissions_sync
AFTER INSERT OR UPDATE ON permissions
FOR EACH ROW
EXECUTE FUNCTION sync_route_permissions();

DROP TRIGGER IF EXISTS set_route_permissions_updated_at ON route_permissions;
CREATE TRIGGER set_route_permissions_updated_at
BEFORE UPDATE ON route_permissions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Role → Route Access (For RBAC Analysis)
DROP VIEW IF EXISTS system_roleroute_access_view;

CREATE VIEW system_roleroute_access_view AS
SELECT 
    r.id::INT AS "roleId",
    COALESCE(r.name, 'Unknown Role') AS "roleName",
    COALESCE(rp.route, '/') AS "route",
    COALESCE(rp.method, 'GET') AS "method",
    COALESCE(rp.display_name, 'Untitled Route') AS "displayName",
    COALESCE(p.permission_key, 'none') AS "permissionKey"
FROM roles r
JOIN role_permissions rpmap ON r.id = rpmap.role_id
JOIN permissions p ON rpmap.permission_key = p.permission_key
JOIN route_permissions rp ON rp.permission_key = p.permission_key
WHERE rp.is_active = TRUE 
  AND r.is_deleted = FALSE; -- Added a check to exclude deleted roles

-- Audit → Route Mapping (For Activity Tracking)
CREATE OR REPLACE VIEW auditroute_report AS
SELECT 
    a.id AS audit_id,
    a.created_at,
    a.user_id,
    a.role_id,
    a.school_id,
    a.permission_resource,
    rp.route,
    rp.method,
    a.action,
    a.resource_type,
    a.resource_id,
    a.diff
FROM auditlogs a
LEFT JOIN permissions p ON p.permission_key = a.permission_resource
LEFT JOIN route_permissions rp ON rp.permission_key = p.permission_key;

-- (Your commented-out sections remain below untouched)
