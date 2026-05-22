-- ============================================
-- Bit X: countries (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS countries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    iso_code VARCHAR(3) UNIQUE NOT NULL,   -- e.g. UG, KE, TZ
    phone_code VARCHAR(10),                -- e.g. +256
    continent VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,        -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,      -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='countries' AND policyname='countries_isolation'
    ) THEN
        EXECUTE 'DROP POLICY countries_isolation ON countries';
    END IF;
END$$;

CREATE POLICY countries_isolation ON countries
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_countries_iso_code ON countries(iso_code);
CREATE INDEX IF NOT EXISTS idx_countries_continent ON countries(continent);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_countries_updated_at ON countries;
CREATE TRIGGER trg_countries_updated_at
BEFORE UPDATE ON countries
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ✅ Use a global audit function that forces school_id = 0
DROP TRIGGER IF EXISTS trg_countries_audit ON countries;
CREATE TRIGGER trg_countries_audit
AFTER INSERT OR UPDATE OR DELETE ON countries
FOR EACH ROW EXECUTE FUNCTION log_audit_global();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_country(
    _name TEXT,_iso_code TEXT,_phone_code TEXT,_continent TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('countries','insert');

    INSERT INTO countries(name,iso_code,phone_code,continent,is_active)
    VALUES (_name,_iso_code,_phone_code,_continent,TRUE)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_country(
    _id BIGINT,_name TEXT,_iso_code TEXT,_phone_code TEXT,_continent TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('countries','update');

    UPDATE countries SET
        name = COALESCE(_name,name),
        iso_code = COALESCE(_iso_code,iso_code),
        phone_code = COALESCE(_phone_code,phone_code),
        continent = COALESCE(_continent,continent),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_country(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('countries','delete');

    UPDATE countries
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_country(_id BIGINT) RETURNS SETOF countries AS $$
BEGIN
    PERFORM require_permission('countries','view');

    RETURN QUERY
    SELECT *
    FROM countries
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_countries() RETURNS SETOF countries AS $$
BEGIN
    PERFORM require_permission('countries','view');

    RETURN QUERY
    SELECT *
    FROM countries
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active countries
CREATE OR REPLACE FUNCTION list_active_countries() RETURNS SETOF countries AS $$
BEGIN
    PERFORM require_permission('countries','view');

    RETURN QUERY
    SELECT *
    FROM countries
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- List countries by continent
CREATE OR REPLACE FUNCTION list_countries_by_continent(_continent TEXT) RETURNS SETOF countries AS $$
BEGIN
    PERFORM require_permission('countries','view');

    RETURN QUERY
    SELECT *
    FROM countries
    WHERE continent = _continent AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_countries_summary() RETURNS TABLE (
    total_countries BIGINT,
    active_countries BIGINT,
    deleted_countries BIGINT
) AS $$
BEGIN
    PERFORM require_permission('countries','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_countries,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_countries,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_countries
    FROM countries;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON countries TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_country(TEXT,TEXT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_country(BIGINT,TEXT,TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_country(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_country(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_countries() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_countries() TO authenticated;
GRANT EXECUTE ON FUNCTION list_countries_by_continent(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_countries_summary() TO authenticated;


-- ============================================
-- Bit X: districts (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS districts (
    id BIGSERIAL PRIMARY KEY,
    --country_id BIGINT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,        -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,      -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='districts' AND policyname='districts_isolation'
    ) THEN
        EXECUTE 'DROP POLICY districts_isolation ON districts';
    END IF;
END$$;

CREATE POLICY districts_isolation ON districts
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
--CREATE INDEX IF NOT EXISTS idx_districts_country ON districts(country_id);
CREATE INDEX IF NOT EXISTS idx_districts_code ON districts(code);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_districts_updated_at ON districts;
CREATE TRIGGER trg_districts_updated_at
BEFORE UPDATE ON districts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_districts_audit ON districts;
CREATE TRIGGER trg_districts_audit
AFTER INSERT OR UPDATE OR DELETE ON districts
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_district(
    _country_id BIGINT,_name TEXT,_code TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('districts','insert');

    INSERT INTO districts(country_id,name,code,is_active,created_at)
    VALUES (_country_id,_name,_code,TRUE,NOW())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_district(
    _id BIGINT,_name TEXT,_code TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('districts','update');

    UPDATE districts SET
        name = COALESCE(_name,name),
        code = COALESCE(_code,code),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_district(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('districts','delete');

    UPDATE districts
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_district(_id BIGINT) RETURNS SETOF districts AS $$
BEGIN
    PERFORM require_permission('districts','view');

    RETURN QUERY
    SELECT *
    FROM districts
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_districts() RETURNS SETOF districts AS $$
BEGIN
    PERFORM require_permission('districts','view');

    RETURN QUERY
    SELECT *
    FROM districts
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active districts
CREATE OR REPLACE FUNCTION list_active_districts() RETURNS SETOF districts AS $$
BEGIN
    PERFORM require_permission('districts','view');

    RETURN QUERY
    SELECT *
    FROM districts
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- List districts by country
/*CREATE OR REPLACE FUNCTION list_districts_by_country(_country_id BIGINT) RETURNS SETOF districts AS $$
BEGIN
    PERFORM require_permission('districts','view');

    RETURN QUERY
    SELECT *
    FROM districts
    WHERE country_id = _country_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
*/
-- Report: summary counts
CREATE OR REPLACE FUNCTION report_districts_summary(_country_id BIGINT) RETURNS TABLE (
    total_districts BIGINT,
    active_districts BIGINT,
    deleted_districts BIGINT
) AS $$
BEGIN
    PERFORM require_permission('districts','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_districts,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_districts,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_districts
    FROM districts
    WHERE country_id = _country_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON districts TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_district(BIGINT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_district(BIGINT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_district(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_district(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_districts() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_districts() TO authenticated;
--GRANT EXECUTE ON FUNCTION list_districts_by_country(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_districts_summary(BIGINT) TO authenticated;

-- ============================================
-- Bit X: education_levels (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS education_levels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,        -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,      -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE education_levels ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='education_levels' AND policyname='education_levels_isolation'
    ) THEN
        EXECUTE 'DROP POLICY education_levels_isolation ON education_levels';
    END IF;
END$$;

CREATE POLICY education_levels_isolation ON education_levels
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_education_levels_name ON education_levels(name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_education_levels_updated_at ON education_levels;

CREATE TRIGGER trg_education_levels_updated_at
BEFORE UPDATE ON education_levels
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_education_levels_audit ON education_levels;
CREATE TRIGGER trg_education_levels_audit
AFTER INSERT OR UPDATE OR DELETE ON education_levels
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_education_level(_name TEXT,_description TEXT) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('education_levels','insert');

    INSERT INTO education_levels(name,description,is_active,created_by)
    VALUES (_name,_description,TRUE,current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_education_level(_id BIGINT,_name TEXT,_description TEXT,_is_active BOOLEAN) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('education_levels','update');

    UPDATE education_levels SET
        name = COALESCE(_name,name),
        description = COALESCE(_description,description),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_education_level(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('education_levels','delete');

    UPDATE education_levels
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_education_level(_id BIGINT) RETURNS SETOF education_levels AS $$
BEGIN
    PERFORM require_permission('education_levels','view');

    RETURN QUERY
    SELECT *
    FROM education_levels
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_education_levels() RETURNS SETOF education_levels AS $$
BEGIN
    PERFORM require_permission('education_levels','view');

    RETURN QUERY
    SELECT *
    FROM education_levels
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active education levels
CREATE OR REPLACE FUNCTION list_active_education_levels() RETURNS SETOF education_levels AS $$
BEGIN
    PERFORM require_permission('education_levels','view');

    RETURN QUERY
    SELECT *
    FROM education_levels
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_education_levels_summary() RETURNS TABLE (
    total_levels BIGINT,
    active_levels BIGINT,
    deleted_levels BIGINT
) AS $$
BEGIN
    PERFORM require_permission('education_levels','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_levels,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_levels,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_levels
    FROM education_levels;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON education_levels TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_education_level(TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_education_level(BIGINT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_education_level(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_education_level(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_education_levels() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_education_levels() TO authenticated;
GRANT EXECUTE ON FUNCTION report_education_levels_summary() TO authenticated;


-- ============================================
-- Bit X: genders (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS genders (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g. Male, Female, Other
    is_active BOOLEAN DEFAULT TRUE,   -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE genders ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='genders' AND policyname='genders_isolation'
    ) THEN
        EXECUTE 'DROP POLICY genders_isolation ON genders';
    END IF;
END$$;

CREATE POLICY genders_isolation ON genders
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_genders_name ON genders(name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_genders_updated_at ON genders;
CREATE TRIGGER trg_genders_updated_at
BEFORE UPDATE ON genders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_genders_audit ON genders;
CREATE TRIGGER trg_genders_audit
AFTER INSERT OR UPDATE OR DELETE ON genders
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_gender(_name TEXT,_is_active BOOLEAN) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('genders','insert');

    INSERT INTO genders(name,is_active,created_by)
    VALUES (_name,COALESCE(_is_active,TRUE),current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_gender(_id BIGINT,_name TEXT,_is_active BOOLEAN) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('genders','update');

    UPDATE genders SET
        name = COALESCE(_name,name),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_gender(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('genders','delete');

    UPDATE genders
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_gender(_id BIGINT) RETURNS SETOF genders AS $$
BEGIN
    PERFORM require_permission('genders','view');

    RETURN QUERY
    SELECT *
    FROM genders
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_genders() RETURNS SETOF genders AS $$
BEGIN
    PERFORM require_permission('genders','view');

    RETURN QUERY
    SELECT *
    FROM genders
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active genders
CREATE OR REPLACE FUNCTION list_active_genders() RETURNS SETOF genders AS $$
BEGIN
    PERFORM require_permission('genders','view');

    RETURN QUERY
    SELECT *
    FROM genders
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_genders_summary() RETURNS TABLE (
    total_genders BIGINT,
    active_genders BIGINT,
    deleted_genders BIGINT
) AS $$
BEGIN
    PERFORM require_permission('genders','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_genders,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_genders,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_genders
    FROM genders;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON genders TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_gender(TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_gender(BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_gender(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_gender(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_genders() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_genders() TO authenticated;
GRANT EXECUTE ON FUNCTION report_genders_summary() TO authenticated;


-- ============================================
-- Bit X: relationship_types (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS relationship_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g. Father, Mother, Guardian, Sponsor
    is_active BOOLEAN DEFAULT TRUE,   -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE relationship_types ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='relationship_types' AND policyname='relationship_types_isolation'
    ) THEN
        EXECUTE 'DROP POLICY relationship_types_isolation ON relationship_types';
    END IF;
END$$;

CREATE POLICY relationship_types_isolation ON relationship_types
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_relationship_types_name ON relationship_types(name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_relationship_types_updated_at ON relationship_types;
CREATE TRIGGER trg_relationship_types_updated_at
BEFORE UPDATE ON relationship_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_relationship_types_audit ON relationship_types;
CREATE TRIGGER trg_relationship_types_audit
AFTER INSERT OR UPDATE OR DELETE ON relationship_types
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_relationship_type(_name TEXT,_is_active BOOLEAN) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('relationship_types','insert');

    INSERT INTO relationship_types(name,is_active,created_by)
    VALUES (_name,COALESCE(_is_active,TRUE),current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_relationship_type(_id BIGINT,_name TEXT,_is_active BOOLEAN) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('relationship_types','update');

    UPDATE relationship_types SET
        name = COALESCE(_name,name),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_relationship_type(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('relationship_types','delete');

    UPDATE relationship_types
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_relationship_type(_id BIGINT) RETURNS SETOF relationship_types AS $$
BEGIN
    PERFORM require_permission('relationship_types','view');

    RETURN QUERY
    SELECT *
    FROM relationship_types
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_relationship_types() RETURNS SETOF relationship_types AS $$
BEGIN
    PERFORM require_permission('relationship_types','view');

    RETURN QUERY
    SELECT *
    FROM relationship_types
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active relationship types
CREATE OR REPLACE FUNCTION list_active_relationship_types() RETURNS SETOF relationship_types AS $$
BEGIN
    PERFORM require_permission('relationship_types','view');

    RETURN QUERY
    SELECT *
    FROM relationship_types
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_relationship_types_summary() RETURNS TABLE (
    total_types BIGINT,
    active_types BIGINT,
    deleted_types BIGINT
) AS $$
BEGIN
    PERFORM require_permission('relationship_types','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_types,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_types,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_types
    FROM relationship_types;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON relationship_types TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_relationship_type(TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_relationship_type(BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_relationship_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_relationship_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_relationship_types() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_relationship_types() TO authenticated;
GRANT EXECUTE ON FUNCTION report_relationship_types_summary() TO authenticated;


-- ============================================
-- Bit X: contact_types (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS contact_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g. Emergency, Guardian, Sponsor
    is_active BOOLEAN DEFAULT TRUE,   -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE contact_types ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='contact_types' AND policyname='contact_types_isolation'
    ) THEN
        EXECUTE 'DROP POLICY contact_types_isolation ON contact_types';
    END IF;
END$$;

CREATE POLICY contact_types_isolation ON contact_types
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contact_types_name ON contact_types(name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_contact_types_updated_at ON contact_types;
CREATE TRIGGER trg_contact_types_updated_at
BEFORE UPDATE ON contact_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_contact_types_audit ON contact_types;
CREATE TRIGGER trg_contact_types_audit
AFTER INSERT OR UPDATE OR DELETE ON contact_types
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_contact_type(_name TEXT,_is_active BOOLEAN) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('contact_types','insert');

    INSERT INTO contact_types(name,is_active,created_by)
    VALUES (_name,COALESCE(_is_active,TRUE),current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_contact_type(_id BIGINT,_name TEXT,_is_active BOOLEAN) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('contact_types','update');

    UPDATE contact_types SET
        name = COALESCE(_name,name),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_contact_type(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('contact_types','delete');

    UPDATE contact_types
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_contact_type(_id BIGINT) RETURNS SETOF contact_types AS $$
BEGIN
    PERFORM require_permission('contact_types','view');

    RETURN QUERY
    SELECT *
    FROM contact_types
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_contact_types() RETURNS SETOF contact_types AS $$
BEGIN
    PERFORM require_permission('contact_types','view');

    RETURN QUERY
    SELECT *
    FROM contact_types
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active contact types
CREATE OR REPLACE FUNCTION list_active_contact_types() RETURNS SETOF contact_types AS $$
BEGIN
    PERFORM require_permission('contact_types','view');

    RETURN QUERY
    SELECT *
    FROM contact_types
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_contact_types_summary() RETURNS TABLE (
    total_types BIGINT,
    active_types BIGINT,
    deleted_types BIGINT
) AS $$
BEGIN
    PERFORM require_permission('contact_types','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_types,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_types,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_types
    FROM contact_types;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON contact_types TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_contact_type(TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_contact_type(BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_contact_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_contact_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_contact_types() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_contact_types() TO authenticated;
GRANT EXECUTE ON FUNCTION report_contact_types_summary() TO authenticated;



-- ============================================
-- Bit X: document_types (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS document_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g. Passport, Birth Certificate, Transcript
    is_active BOOLEAN DEFAULT TRUE,   -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='document_types' AND policyname='document_types_isolation'
    ) THEN
        EXECUTE 'DROP POLICY document_types_isolation ON document_types';
    END IF;
END$$;

CREATE POLICY document_types_isolation ON document_types
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_document_types_name ON document_types(name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_document_types_updated_at ON document_types;
CREATE TRIGGER trg_document_types_updated_at
BEFORE UPDATE ON document_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_document_types_audit ON document_types;
CREATE TRIGGER trg_document_types_audit
AFTER INSERT OR UPDATE OR DELETE ON document_types
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_document_type(_name TEXT,_is_active BOOLEAN) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('document_types','insert');

    INSERT INTO document_types(name,is_active,created_by)
    VALUES (_name,COALESCE(_is_active,TRUE),current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_document_type(_id BIGINT,_name TEXT,_is_active BOOLEAN) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('document_types','update');

    UPDATE document_types SET
        name = COALESCE(_name,name),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_document_type(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('document_types','delete');

    UPDATE document_types
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_document_type(_id BIGINT) RETURNS SETOF document_types AS $$
BEGIN
    PERFORM require_permission('document_types','view');

    RETURN QUERY
    SELECT *
    FROM document_types
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_document_types() RETURNS SETOF document_types AS $$
BEGIN
    PERFORM require_permission('document_types','view');

    RETURN QUERY
    SELECT *
    FROM document_types
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active document types
CREATE OR REPLACE FUNCTION list_active_document_types() RETURNS SETOF document_types AS $$
BEGIN
    PERFORM require_permission('document_types','view');

    RETURN QUERY
    SELECT *
    FROM document_types
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_document_types_summary() RETURNS TABLE (
    total_types BIGINT,
    active_types BIGINT,
    deleted_types BIGINT
) AS $$
BEGIN
    PERFORM require_permission('document_types','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_types,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_types,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_types
    FROM document_types;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON document_types TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_document_type(TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_document_type(BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_document_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_document_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_document_types() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_document_types() TO authenticated;
GRANT EXECUTE ON FUNCTION report_document_types_summary() TO authenticated;


-- ============================================
-- Bit X: attendance_status (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS attendance_status (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g. Present, Absent, Late, Excused
    is_active BOOLEAN DEFAULT TRUE,   -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE attendance_status ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='attendance_status' AND policyname='attendance_status_isolation'
    ) THEN
        EXECUTE 'DROP POLICY attendance_status_isolation ON attendance_status';
    END IF;
END$$;

CREATE POLICY attendance_status_isolation ON attendance_status
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attendance_status_name ON attendance_status(name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_attendance_status_updated_at ON attendance_status;
CREATE TRIGGER trg_attendance_status_updated_at
BEFORE UPDATE ON attendance_status
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_attendance_status_audit ON attendance_status;
CREATE TRIGGER trg_attendance_status_audit
AFTER INSERT OR UPDATE OR DELETE ON attendance_status
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_attendance_status(_name TEXT,_is_active BOOLEAN) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('attendance_status','insert');

    INSERT INTO attendance_status(name,is_active,created_by)
    VALUES (_name,COALESCE(_is_active,TRUE),current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_attendance_status(_id BIGINT,_name TEXT,_is_active BOOLEAN) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('attendance_status','update');

    UPDATE attendance_status SET
        name = COALESCE(_name,name),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_attendance_status(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('attendance_status','delete');

    UPDATE attendance_status
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_attendance_status(_id BIGINT) RETURNS SETOF attendance_status AS $$
BEGIN
    PERFORM require_permission('attendance_status','view');

    RETURN QUERY
    SELECT *
    FROM attendance_status
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_attendance_status() RETURNS SETOF attendance_status AS $$
BEGIN
    PERFORM require_permission('attendance_status','view');

    RETURN QUERY
    SELECT *
    FROM attendance_status
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active attendance statuses
CREATE OR REPLACE FUNCTION list_active_attendance_status() RETURNS SETOF attendance_status AS $$
BEGIN
    PERFORM require_permission('attendance_status','view');

    RETURN QUERY
    SELECT *
    FROM attendance_status
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_attendance_status_summary() RETURNS TABLE (
    total_statuses BIGINT,
    active_statuses BIGINT,
    deleted_statuses BIGINT
) AS $$
BEGIN
    PERFORM require_permission('attendance_status','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_statuses,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_statuses,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_statuses
    FROM attendance_status;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON attendance_status TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_attendance_status(TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_attendance_status(BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_attendance_status(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_attendance_status(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_attendance_status() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_attendance_status() TO authenticated;
GRANT EXECUTE ON FUNCTION report_attendance_status_summary() TO authenticated;


-- ============================================
-- Bit X: grading_scales (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS grading_scales (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,          -- e.g. A-F, GPA, Percentage
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,     -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,   -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(name)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE grading_scales ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='grading_scales' AND policyname='grading_scales_isolation'
    ) THEN
        EXECUTE 'DROP POLICY grading_scales_isolation ON grading_scales';
    END IF;
END$$;

CREATE POLICY grading_scales_isolation ON grading_scales
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_grading_scales_name ON grading_scales(name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_grading_scales_updated_at ON grading_scales;
CREATE TRIGGER trg_grading_scales_updated_at
BEFORE UPDATE ON grading_scales
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_grading_scales_audit ON grading_scales;
CREATE TRIGGER trg_grading_scales_audit
AFTER INSERT OR UPDATE OR DELETE ON grading_scales
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_grading_scale(_name TEXT,_description TEXT,_is_active BOOLEAN) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('grading_scales','insert');

    INSERT INTO grading_scales(name,description,is_active,created_by)
    VALUES (_name,_description,COALESCE(_is_active,TRUE),current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_grading_scale(_id BIGINT,_name TEXT,_description TEXT,_is_active BOOLEAN) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('grading_scales','update');

    UPDATE grading_scales SET
        name = COALESCE(_name,name),
        description = COALESCE(_description,description),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_grading_scale(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('grading_scales','delete');

    UPDATE grading_scales
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_grading_scale(_id BIGINT) RETURNS SETOF grading_scales AS $$
BEGIN
    PERFORM require_permission('grading_scales','view');

    RETURN QUERY
    SELECT *
    FROM grading_scales
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_grading_scales() RETURNS SETOF grading_scales AS $$
BEGIN
    PERFORM require_permission('grading_scales','view');

    RETURN QUERY
    SELECT *
    FROM grading_scales
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active grading scales
CREATE OR REPLACE FUNCTION list_active_grading_scales() RETURNS SETOF grading_scales AS $$
BEGIN
    PERFORM require_permission('grading_scales','view');

    RETURN QUERY
    SELECT *
    FROM grading_scales
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_grading_scales_summary() RETURNS TABLE (
    total_scales BIGINT,
    active_scales BIGINT,
    deleted_scales BIGINT
) AS $$
BEGIN
    PERFORM require_permission('grading_scales','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_scales,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_scales,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_scales
    FROM grading_scales;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON grading_scales TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_grading_scale(TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_grading_scale(BIGINT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_grading_scale(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_grading_scale(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_grading_scales() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_grading_scales() TO authenticated;
GRANT EXECUTE ON FUNCTION report_grading_scales_summary() TO authenticated;


-- ============================================
-- Bit X: employment_types (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS employment_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g. Full-time, Part-time, Contract
    is_active BOOLEAN DEFAULT TRUE,   -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE employment_types ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='employment_types' AND policyname='employment_types_isolation'
    ) THEN
        EXECUTE 'DROP POLICY employment_types_isolation ON employment_types';
    END IF;
END$$;

CREATE POLICY employment_types_isolation ON employment_types
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_employment_types_name ON employment_types(name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_employment_types_updated_at ON employment_types;
CREATE TRIGGER trg_employment_types_updated_at
BEFORE UPDATE ON employment_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_employment_types_audit ON employment_types;
CREATE TRIGGER trg_employment_types_audit
AFTER INSERT OR UPDATE OR DELETE ON employment_types
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_employment_type(_name TEXT,_is_active BOOLEAN) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('employment_types','insert');

    INSERT INTO employment_types(name,is_active,created_by)
    VALUES (_name,COALESCE(_is_active,TRUE),current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_employment_type(_id BIGINT,_name TEXT,_is_active BOOLEAN) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('employment_types','update');

    UPDATE employment_types SET
        name = COALESCE(_name,name),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_employment_type(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('employment_types','delete');

    UPDATE employment_types
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_employment_type(_id BIGINT) RETURNS SETOF employment_types AS $$
BEGIN
    PERFORM require_permission('employment_types','view');

    RETURN QUERY
    SELECT *
    FROM employment_types
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_employment_types() RETURNS SETOF employment_types AS $$
BEGIN
    PERFORM require_permission('employment_types','view');

    RETURN QUERY
    SELECT *
    FROM employment_types
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active employment types
CREATE OR REPLACE FUNCTION list_active_employment_types() RETURNS SETOF employment_types AS $$
BEGIN
    PERFORM require_permission('employment_types','view');

    RETURN QUERY
    SELECT *
    FROM employment_types
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_employment_types_summary() RETURNS TABLE (
    total_types BIGINT,
    active_types BIGINT,
    deleted_types BIGINT
) AS $$
BEGIN
    PERFORM require_permission('employment_types','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_types,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_types,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_types
    FROM employment_types;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON employment_types TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_employment_type(TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_employment_type(BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_employment_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_employment_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_employment_types() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_employment_types() TO authenticated;
GRANT EXECUTE ON FUNCTION report_employment_types_summary() TO authenticated;


-- ============================================
-- Bit X: event_types (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS event_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g. Exam, Holiday, Meeting, Extracurricular
    is_active BOOLEAN DEFAULT TRUE,   -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='event_types' AND policyname='event_types_isolation'
    ) THEN
        EXECUTE 'DROP POLICY event_types_isolation ON event_types';
    END IF;
END$$;

CREATE POLICY event_types_isolation ON event_types
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_event_types_name ON event_types(name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_event_types_updated_at ON event_types;
CREATE TRIGGER trg_event_types_updated_at
BEFORE UPDATE ON event_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_event_types_audit ON event_types;
CREATE TRIGGER trg_event_types_audit
AFTER INSERT OR UPDATE OR DELETE ON event_types
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_event_type(_name TEXT,_is_active BOOLEAN) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('event_types','insert');

    INSERT INTO event_types(name,is_active,created_by)
    VALUES (_name,COALESCE(_is_active,TRUE),current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_event_type(_id BIGINT,_name TEXT,_is_active BOOLEAN) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('event_types','update');

    UPDATE event_types SET
        name = COALESCE(_name,name),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_event_type(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('event_types','delete');

    UPDATE event_types
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_event_type(_id BIGINT) RETURNS SETOF event_types AS $$
BEGIN
    PERFORM require_permission('event_types','view');

    RETURN QUERY
    SELECT *
    FROM event_types
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_event_types() RETURNS SETOF event_types AS $$
BEGIN
    PERFORM require_permission('event_types','view');

    RETURN QUERY
    SELECT *
    FROM event_types
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active event types
CREATE OR REPLACE FUNCTION list_active_event_types() RETURNS SETOF event_types AS $$
BEGIN
    PERFORM require_permission('event_types','view');

    RETURN QUERY
    SELECT *
    FROM event_types
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_event_types_summary() RETURNS TABLE (
    total_types BIGINT,
    active_types BIGINT,
    deleted_types BIGINT
) AS $$
BEGIN
    PERFORM require_permission('event_types','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_types,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_types,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_types
    FROM event_types;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON event_types TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_event_type(TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_event_type(BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_event_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_event_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_event_types() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_event_types() TO authenticated;
GRANT EXECUTE ON FUNCTION report_event_types_summary() TO authenticated;


