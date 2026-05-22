-- ============================================
-- Bit X: asset_types (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS asset_types (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,          -- e.g., 'biometric_fingerprint', 'tablet_android'
    name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('hardware','software','mobile_app')),
    subcategory VARCHAR(50) NOT NULL CHECK (subcategory IN ('attendance_capture','assessment_tool','communication_device','general_hardware')),
    purpose VARCHAR(50)[] DEFAULT '{}' CHECK (
        purpose <@ ARRAY['attendance','exam_supervision','communication','reporting','general']::VARCHAR[]
    ),
    is_biometric BOOLEAN DEFAULT false,
    requires_calibration BOOLEAN DEFAULT false,
    vendor_requirements JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);


-- ============================================
-- RLS
-- ============================================
ALTER TABLE asset_types ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='asset_types' AND policyname='asset_types_isolation'
    ) THEN
        EXECUTE 'DROP POLICY asset_types_isolation ON asset_types';
    END IF;
END$$;

CREATE POLICY asset_types_isolation ON asset_types
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_asset_types_code ON asset_types(code);
CREATE INDEX IF NOT EXISTS idx_asset_types_category ON asset_types(category);
CREATE INDEX IF NOT EXISTS idx_asset_types_subcategory ON asset_types(subcategory);
CREATE INDEX IF NOT EXISTS idx_asset_types_school ON asset_types(school_id);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_asset_types_updated_at ON asset_types;
CREATE TRIGGER trg_asset_types_updated_at
BEFORE UPDATE ON asset_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_asset_types_audit ON asset_types;
CREATE TRIGGER trg_asset_types_audit
AFTER INSERT OR UPDATE OR DELETE ON asset_types
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_asset_type(
    _school_id BIGINT,_code TEXT,_name TEXT,_category TEXT,_subcategory TEXT,_purpose TEXT[],_is_biometric BOOLEAN,_requires_calibration BOOLEAN,_vendor_requirements JSONB
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('asset_types','insert');

    INSERT INTO asset_types(school_id,code,name,category,subcategory,purpose,is_biometric,requires_calibration,vendor_requirements,is_active)
    VALUES (_school_id,_code,_name,_category,_subcategory,COALESCE(_purpose,'{}'),COALESCE(_is_biometric,false),COALESCE(_requires_calibration,false),_vendor_requirements,TRUE)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_asset_type(
    _id BIGINT,_code TEXT,_name TEXT,_category TEXT,_subcategory TEXT,_purpose TEXT[],_is_biometric BOOLEAN,_requires_calibration BOOLEAN,_vendor_requirements JSONB,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('asset_types','update');

    UPDATE asset_types SET
        code = COALESCE(_code,code),
        name = COALESCE(_name,name),
        category = COALESCE(_category,category),
        subcategory = COALESCE(_subcategory,subcategory),
        purpose = COALESCE(_purpose,purpose),
        is_biometric = COALESCE(_is_biometric,is_biometric),
        requires_calibration = COALESCE(_requires_calibration,requires_calibration),
        vendor_requirements = COALESCE(_vendor_requirements,vendor_requirements),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_asset_type(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('asset_types','delete');

    UPDATE asset_types
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper
CREATE OR REPLACE FUNCTION select_asset_type(_id BIGINT) RETURNS SETOF asset_types AS $$
BEGIN
    PERFORM require_permission('asset_types','view');

    RETURN QUERY
    SELECT *
    FROM asset_types
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper
CREATE OR REPLACE FUNCTION list_asset_types(_school_id BIGINT) RETURNS SETOF asset_types AS $$
BEGIN
    PERFORM require_permission('asset_types','view');

    RETURN QUERY
    SELECT *
    FROM asset_types
    WHERE school_id = _school_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active asset types
CREATE OR REPLACE FUNCTION list_active_asset_types(_school_id BIGINT) RETURNS SETOF asset_types AS $$
BEGIN
    PERFORM require_permission('asset_types','view');

    RETURN QUERY
    SELECT *
    FROM asset_types
    WHERE school_id = _school_id AND is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_asset_types_summary(_school_id BIGINT) RETURNS TABLE (
    total_types BIGINT,
    active_types BIGINT,
    deleted_types BIGINT
) AS $$
BEGIN
    PERFORM require_permission('asset_types','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_types,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_types,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_types
    FROM asset_types
    WHERE school_id = _school_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON asset_types TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_asset_type(BIGINT,TEXT,TEXT,TEXT,TEXT,TEXT[],BOOLEAN,BOOLEAN,JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_asset_type(BIGINT,TEXT,TEXT,TEXT,TEXT,TEXT[],BOOLEAN,BOOLEAN,JSONB,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_asset_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_asset_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_asset_types(BIGINT) TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_asset_types(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_asset_types_summary(BIGINT) TO authenticated;


-- ============================================
-- Bit X: assets (Unified Registry for Tools, Devices, Software)
-- ============================================

CREATE TABLE IF NOT EXISTS assets (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

    -- Identity
    asset_code VARCHAR(100) NOT NULL UNIQUE,   -- e.g., "BIOM-NSS-001", "MOB-TEACH-01"
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Classification
    asset_type_id BIGINT NOT NULL REFERENCES asset_types(id),

    -- Scannable Identifiers
    qr_code VARCHAR(255) UNIQUE,               -- optional QR code string
    nfc_tag VARCHAR(255) UNIQUE,               -- optional NFC tag
    serial_number VARCHAR(255) UNIQUE,         -- hardware serial number

    -- Location
    location VARCHAR(255),                     -- e.g., "Gate A", "Room 104"

    -- Lifecycle
    status VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    purchase_date DATE,
    warranty_expiry DATE,
    vendor VARCHAR(255),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by BIGINT REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by BIGINT REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='assets' AND policyname='assets_isolation'
    ) THEN
        EXECUTE 'DROP POLICY assets_isolation ON assets';
    END IF;
END$$;

CREATE POLICY assets_isolation ON assets
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_assets_school ON assets(school_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_qr ON assets(qr_code);
CREATE INDEX IF NOT EXISTS idx_assets_nfc ON assets(nfc_tag);
CREATE INDEX IF NOT EXISTS idx_assets_serial ON assets(serial_number);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_assets_updated_at ON assets;
CREATE TRIGGER trg_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_assets_audit ON assets;
CREATE TRIGGER trg_assets_audit
AFTER INSERT OR UPDATE OR DELETE ON assets
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_asset(
    _school_id BIGINT,_asset_code TEXT,_name TEXT,_description TEXT,_asset_type_id BIGINT,
    _qr_code TEXT,_nfc_tag TEXT,_serial_number TEXT,_location TEXT,_status TEXT,
    _purchase_date DATE,_warranty_expiry DATE,_vendor TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('assets','insert');

    INSERT INTO assets(school_id,asset_code,name,description,asset_type_id,
                       qr_code,nfc_tag,serial_number,location,status,
                       purchase_date,warranty_expiry,vendor,is_active)
    VALUES (_school_id,_asset_code,_name,_description,_asset_type_id,
            _qr_code,_nfc_tag,_serial_number,_location,COALESCE(_status,'active'),
            _purchase_date,_warranty_expiry,_vendor,TRUE)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_asset(
    _id BIGINT,_name TEXT,_description TEXT,_asset_type_id BIGINT,
    _qr_code TEXT,_nfc_tag TEXT,_serial_number TEXT,_location TEXT,_status TEXT,
    _purchase_date DATE,_warranty_expiry DATE,_vendor TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assets','update');

    UPDATE assets SET
        name = COALESCE(_name,name),
        description = COALESCE(_description,description),
        asset_type_id = COALESCE(_asset_type_id,asset_type_id),
        qr_code = COALESCE(_qr_code,qr_code),
        nfc_tag = COALESCE(_nfc_tag,nfc_tag),
        serial_number = COALESCE(_serial_number,serial_number),
        location = COALESCE(_location,location),
        status = COALESCE(_status,status),
        purchase_date = COALESCE(_purchase_date,purchase_date),
        warranty_expiry = COALESCE(_warranty_expiry,warranty_expiry),
        vendor = COALESCE(_vendor,vendor),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_asset(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assets','delete');

    UPDATE assets
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_asset(_id BIGINT) RETURNS SETOF assets AS $$
BEGIN
    PERFORM require_permission('assets','view');

    RETURN QUERY
    SELECT *
    FROM assets
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_assets(_school_id BIGINT) RETURNS SETOF assets AS $$
BEGIN
    PERFORM require_permission('assets','view');

    RETURN QUERY
    SELECT *
    FROM assets
    WHERE school_id = _school_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active assets
CREATE OR REPLACE FUNCTION list_active_assets(_school_id BIGINT) RETURNS SETOF assets AS $$
BEGIN
    PERFORM require_permission('assets','view');

    RETURN QUERY
    SELECT *
    FROM assets
    WHERE school_id = _school_id AND is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_assets_summary(_school_id BIGINT) RETURNS TABLE (
    total_assets BIGINT,
    active_assets BIGINT,
    deleted_assets BIGINT
) AS $$
BEGIN
    PERFORM require_permission('assets','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_assets,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_assets,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_assets
    FROM assets
    WHERE school_id = _school_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON assets TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_asset(BIGINT,TEXT,TEXT,TEXT,BIGINT,TEXT,TEXT,TEXT,TEXT,TEXT,DATE,DATE,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_asset(BIGINT,TEXT,TEXT,BIGINT,TEXT,TEXT,TEXT,TEXT,TEXT,DATE,DATE,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_asset(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_asset(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_assets(BIGINT) TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_assets(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_assets_summary(BIGINT) TO authenticated;


-- ============================================
-- Bit X: asset_assignments (Custodianship Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS asset_assignments (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    unassigned_at TIMESTAMPTZ,
    assignment_type VARCHAR(20) NOT NULL DEFAULT 'primary'
      CHECK (assignment_type IN ('primary','secondary','temporary','emergency')),
    assigned_by BIGINT REFERENCES users(id),
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- Enforce one active primary assignment per asset
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_primary_assignment
ON asset_assignments(asset_id, assignment_type)
WHERE assignment_type = 'primary' AND unassigned_at IS NULL AND is_deleted = FALSE;

-- ============================================
-- RLS
-- ============================================
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='asset_assignments' AND policyname='asset_assignments_isolation'
    ) THEN
        EXECUTE 'DROP POLICY asset_assignments_isolation ON asset_assignments';
    END IF;
END$$;

CREATE POLICY asset_assignments_isolation ON asset_assignments
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_asset_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_user ON asset_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_type ON asset_assignments(assignment_type);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_asset_assignments_updated_at ON asset_assignments;
CREATE TRIGGER trg_asset_assignments_updated_at
BEFORE UPDATE ON asset_assignments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_asset_assignments_audit ON asset_assignments;
CREATE TRIGGER trg_asset_assignments_audit
AFTER INSERT OR UPDATE OR DELETE ON asset_assignments
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_asset_assignment(
    _asset_id BIGINT,_user_id BIGINT,_assignment_type TEXT,_assigned_by BIGINT,_notes TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('asset_assignments','insert');

    INSERT INTO asset_assignments(asset_id,user_id,assignment_type,assigned_by,notes,is_deleted)
    VALUES (_asset_id,_user_id,COALESCE(_assignment_type,'primary'),_assigned_by,_notes,FALSE)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_asset_assignment(
    _id BIGINT,_unassigned_at TIMESTAMPTZ,_assignment_type TEXT,_notes TEXT,_is_deleted BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('asset_assignments','update');

    UPDATE asset_assignments SET
        unassigned_at = COALESCE(_unassigned_at,unassigned_at),
        assignment_type = COALESCE(_assignment_type,assignment_type),
        notes = COALESCE(_notes,notes),
        is_deleted = COALESCE(_is_deleted,is_deleted),
        updated_at = NOW()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_asset_assignment(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('asset_assignments','delete');

    UPDATE asset_assignments
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_asset_assignment(_id BIGINT) RETURNS SETOF asset_assignments AS $$
BEGIN
    PERFORM require_permission('asset_assignments','view');

    RETURN QUERY
    SELECT *
    FROM asset_assignments
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for asset)
CREATE OR REPLACE FUNCTION list_asset_assignments(_asset_id BIGINT) RETURNS SETOF asset_assignments AS $$
BEGIN
    PERFORM require_permission('asset_assignments','view');

    RETURN QUERY
    SELECT *
    FROM asset_assignments
    WHERE asset_id = _asset_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active assignments for asset
CREATE OR REPLACE FUNCTION list_active_asset_assignments(_asset_id BIGINT) RETURNS SETOF asset_assignments AS $$
BEGIN
    PERFORM require_permission('asset_assignments','view');

    RETURN QUERY
    SELECT *
    FROM asset_assignments
    WHERE asset_id = _asset_id AND unassigned_at IS NULL AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_asset_assignments_summary(_asset_id BIGINT) RETURNS TABLE (
    total_assignments BIGINT,
    active_assignments BIGINT,
    deleted_assignments BIGINT
) AS $$
BEGIN
    PERFORM require_permission('asset_assignments','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_assignments,
           COUNT(*) FILTER (WHERE unassigned_at IS NULL AND is_deleted = FALSE) AS active_assignments,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_assignments
    FROM asset_assignments
    WHERE asset_id = _asset_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON asset_assignments TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_asset_assignment(BIGINT,BIGINT,TEXT,BIGINT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_asset_assignment(BIGINT,TIMESTAMPTZ,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_asset_assignment(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_asset_assignment(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_asset_assignments(BIGINT) TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_asset_assignments(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_asset_assignments_summary(BIGINT) TO authenticated;



-- ============================================
-- Bit X: asset_maintenance_logs (Calibration, Repairs, Alerts, Inspections)
-- ============================================

CREATE TABLE IF NOT EXISTS asset_maintenance_logs (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    log_type VARCHAR(20) NOT NULL CHECK (log_type IN ('calibration','repair','alert','inspection')),
    technician_id BIGINT REFERENCES users(id),
    logged_at TIMESTAMPTZ DEFAULT now(),
    details JSONB,                              -- e.g., { "accuracy_score": 98.5, "issue": "sensor_drift" }
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE asset_maintenance_logs ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='asset_maintenance_logs' AND policyname='asset_maintenance_logs_isolation'
    ) THEN
        EXECUTE 'DROP POLICY asset_maintenance_logs_isolation ON asset_maintenance_logs';
    END IF;
END$$;

CREATE POLICY asset_maintenance_logs_isolation ON asset_maintenance_logs
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON asset_maintenance_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logtype ON asset_maintenance_logs(log_type);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_asset_maintenance_logs_updated_at ON asset_maintenance_logs;
CREATE TRIGGER trg_asset_maintenance_logs_updated_at
BEFORE UPDATE ON asset_maintenance_logs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_asset_maintenance_logs_audit ON asset_maintenance_logs;
CREATE TRIGGER trg_asset_maintenance_logs_audit
AFTER INSERT OR UPDATE OR DELETE ON asset_maintenance_logs
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_asset_maintenance_log(
    _asset_id BIGINT,_log_type TEXT,_technician_id BIGINT,_details JSONB,_resolution_notes TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('asset_maintenance_logs','insert');

    INSERT INTO asset_maintenance_logs(asset_id,log_type,technician_id,details,resolution_notes,is_deleted)
    VALUES (_asset_id,_log_type,_technician_id,_details,_resolution_notes,FALSE)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_asset_maintenance_log(
    _id BIGINT,_log_type TEXT,_technician_id BIGINT,_details JSONB,_resolved_at TIMESTAMPTZ,_resolution_notes TEXT,_is_deleted BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('asset_maintenance_logs','update');

    UPDATE asset_maintenance_logs SET
        log_type = COALESCE(_log_type,log_type),
        technician_id = COALESCE(_technician_id,technician_id),
        details = COALESCE(_details,details),
        resolved_at = COALESCE(_resolved_at,resolved_at),
        resolution_notes = COALESCE(_resolution_notes,resolution_notes),
        is_deleted = COALESCE(_is_deleted,is_deleted),
        updated_at = NOW()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_asset_maintenance_log(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('asset_maintenance_logs','delete');

    UPDATE asset_maintenance_logs
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_asset_maintenance_log(_id BIGINT) RETURNS SETOF asset_maintenance_logs AS $$
BEGIN
    PERFORM require_permission('asset_maintenance_logs','view');

    RETURN QUERY
    SELECT *
    FROM asset_maintenance_logs
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for asset)
CREATE OR REPLACE FUNCTION list_asset_maintenance_logs(_asset_id BIGINT) RETURNS SETOF asset_maintenance_logs AS $$
BEGIN
    PERFORM require_permission('asset_maintenance_logs','view');

    RETURN QUERY
    SELECT *
    FROM asset_maintenance_logs
    WHERE asset_id = _asset_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List unresolved maintenance logs
CREATE OR REPLACE FUNCTION list_unresolved_asset_maintenance_logs(_asset_id BIGINT) RETURNS SETOF asset_maintenance_logs AS $$
BEGIN
    PERFORM require_permission('asset_maintenance_logs','view');

    RETURN QUERY
    SELECT *
    FROM asset_maintenance_logs
    WHERE asset_id = _asset_id AND resolved_at IS NULL AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_asset_maintenance_summary(_asset_id BIGINT) RETURNS TABLE (
    total_logs BIGINT,
    unresolved_logs BIGINT,
    resolved_logs BIGINT,
    deleted_logs BIGINT
) AS $$
BEGIN
    PERFORM require_permission('asset_maintenance_logs','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_logs,
           COUNT(*) FILTER (WHERE resolved_at IS NULL AND is_deleted = FALSE) AS unresolved_logs,
           COUNT(*) FILTER (WHERE resolved_at IS NOT NULL AND is_deleted = FALSE) AS resolved_logs,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_logs
    FROM asset_maintenance_logs
    WHERE asset_id = _asset_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON asset_maintenance_logs TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_asset_maintenance_log(BIGINT,TEXT,BIGINT,JSONB,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_asset_maintenance_log(BIGINT,TEXT,BIGINT,JSONB,TIMESTAMPTZ,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_asset_maintenance_log(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_asset_maintenance_log(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_asset_maintenance_logs(BIGINT) TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_unresolved_asset_maintenance_logs(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_asset_maintenance_summary(BIGINT) TO authenticated;
