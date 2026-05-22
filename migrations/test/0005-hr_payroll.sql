-- Helper function: set_updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function: log_audit
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  -- Example: insert into audit_logs
  INSERT INTO audit_logs(table_name, action, record_id, changed_at)
  VALUES (TG_TABLE_NAME, TG_OP, NEW.id, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- Bit X/HR: departments
-- ============================================

CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,          -- e.g. "Mathematics", "Finance", "Administration"
    code VARCHAR(20),                    -- short code
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,      -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, name),
    UNIQUE(school_id, code)
);

-- RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='departments' AND policyname='departments_isolation'
    ) THEN
        EXECUTE 'DROP POLICY departments_isolation ON departments';
    END IF;
END$$;

CREATE POLICY departments_isolation ON departments
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_departments_school_name 
ON departments(school_id, name);

-- Triggers
DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;
CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_departments_audit ON departments;
CREATE TRIGGER trg_departments_audit
AFTER INSERT OR UPDATE OR DELETE ON departments
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_department(
    _name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    INSERT INTO departments (
        school_id,name,code,description,is_active,created_by
    )
    VALUES (
        current_school_id(),_name,_code,_description,
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_department(
    _id BIGINT,_name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    UPDATE departments SET
        name=COALESCE(_name,name),
        code=COALESCE(_code,code),
        description=COALESCE(_description,description),
        is_active=COALESCE(_is_active,is_active),
        updated_by=current_user_id()
    WHERE id=_id AND school_id=current_school_id() AND is_deleted=FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_department(_id BIGINT) RETURNS VOID AS $$
BEGIN
    UPDATE departments
    SET is_deleted=TRUE,deleted_at=NOW(),deleted_by=current_user_id()
    WHERE id=_id AND school_id=current_school_id() AND is_deleted=FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants
GRANT SELECT,INSERT,UPDATE ON departments TO authenticated;
GRANT EXECUTE ON FUNCTION insert_department TO authenticated;
GRANT EXECUTE ON FUNCTION update_department TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_department TO authenticated;


-- ============================================
-- Bit 1/18: staff
-- ============================================

CREATE TABLE IF NOT EXISTS staff (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ updated
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,     -- link to users table
    employee_no VARCHAR(50),                -- optional staff number
    hire_date DATE NOT NULL,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL, -- ✅ new
    role_id BIGINT REFERENCES staff_roles(id) ON DELETE SET NULL,       -- ✅ new
    is_active BOOLEAN DEFAULT TRUE,         -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, user_id),
    UNIQUE(school_id, employee_no)
);

-- RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='staff' AND policyname='staff_isolation'
    ) THEN
        EXECUTE 'DROP POLICY staff_isolation ON staff';
    END IF;
END$$;

CREATE POLICY staff_isolation ON staff
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_school_user ON staff(school_id, user_id);
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role_id);

-- Triggers
DROP TRIGGER IF EXISTS trg_staff_updated_at ON staff;
CREATE TRIGGER trg_staff_updated_at
BEFORE UPDATE ON staff
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_staff_audit ON staff;
CREATE TRIGGER trg_staff_audit
AFTER INSERT OR UPDATE OR DELETE ON staff
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_staff(
    _user_id BIGINT,_employee_no TEXT,_hire_date DATE,_department_id BIGINT,_role_id BIGINT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    INSERT INTO staff (
        school_id,user_id,employee_no,hire_date,department_id,role_id,is_active,created_by
    )
    VALUES (
        current_school_id(),_user_id,_employee_no,COALESCE(_hire_date,CURRENT_DATE),
        _department_id,_role_id,COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_staff(
    _id BIGINT,_employee_no TEXT,_hire_date DATE,_department_id BIGINT,_role_id BIGINT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    UPDATE staff SET
        employee_no=COALESCE(_employee_no,employee_no),
        hire_date=COALESCE(_hire_date,hire_date),
        department_id=COALESCE(_department_id,department_id),
        role_id=COALESCE(_role_id,role_id),
        is_active=COALESCE(_is_active,is_active),
        updated_by=current_user_id()
    WHERE id=_id AND school_id=current_school_id() AND is_deleted=FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_staff(_id BIGINT) RETURNS VOID AS $$
BEGIN
    UPDATE staff
    SET is_deleted=TRUE,deleted_at=NOW(),deleted_by=current_user_id()
    WHERE id=_id AND school_id=current_school_id() AND is_deleted=FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants (simplified form)
GRANT SELECT,INSERT,UPDATE ON staff TO authenticated;
GRANT EXECUTE ON FUNCTION insert_staff TO authenticated;
GRANT EXECUTE ON FUNCTION update_staff TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_staff TO authenticated;


-- ============================================
-- Bit X/HR: staff_roles
-- ============================================

CREATE TABLE IF NOT EXISTS staff_roles (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,          -- e.g. "Teacher", "Headmaster", "Accountant"
    code VARCHAR(20),                    -- short code
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,      -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, name),
    UNIQUE(school_id, code)
);

-- RLS
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='staff_roles' AND policyname='staff_roles_isolation'
    ) THEN
        EXECUTE 'DROP POLICY staff_roles_isolation ON staff_roles';
    END IF;
END$$;

CREATE POLICY staff_roles_isolation ON staff_roles
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_roles_school_name 
ON staff_roles(school_id, name);

-- Triggers
DROP TRIGGER IF EXISTS trg_staff_roles_updated_at ON staff_roles;
CREATE TRIGGER trg_staff_roles_updated_at
BEFORE UPDATE ON staff_roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_staff_roles_audit ON staff_roles;
CREATE TRIGGER trg_staff_roles_audit
AFTER INSERT OR UPDATE OR DELETE ON staff_roles
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_staff_role(
    _name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    INSERT INTO staff_roles (
        school_id,name,code,description,is_active,created_by
    )
    VALUES (
        current_school_id(),_name,_code,_description,
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_staff_role(
    _id BIGINT,_name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    UPDATE staff_roles SET
        name=COALESCE(_name,name),
        code=COALESCE(_code,code),
        description=COALESCE(_description,description),
        is_active=COALESCE(_is_active,is_active),
        updated_by=current_user_id()
    WHERE id=_id AND school_id=current_school_id() AND is_deleted=FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_staff_role(_id BIGINT) RETURNS VOID AS $$
BEGIN
    UPDATE staff_roles
    SET is_deleted=TRUE,deleted_at=NOW(),deleted_by=current_user_id()
    WHERE id=_id AND school_id=current_school_id() AND is_deleted=FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants
GRANT SELECT,INSERT,UPDATE ON staff_roles TO authenticated;
GRANT EXECUTE ON FUNCTION insert_staff_role TO authenticated;
GRANT EXECUTE ON FUNCTION update_staff_role TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_staff_role TO authenticated;


-- ============================================
-- Bit X/HR: staff_promotions
-- ============================================

CREATE TABLE IF NOT EXISTS staff_promotions (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    old_role_id BIGINT REFERENCES staff_roles(id) ON DELETE SET NULL,
    new_role_id BIGINT REFERENCES staff_roles(id) ON DELETE SET NULL,
    old_department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    new_department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    promotion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks TEXT,
    is_active BOOLEAN DEFAULT TRUE,      -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- RLS
ALTER TABLE staff_promotions ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='staff_promotions' AND policyname='staff_promotions_isolation'
    ) THEN
        EXECUTE 'DROP POLICY staff_promotions_isolation ON staff_promotions';
    END IF;
END$$;

CREATE POLICY staff_promotions_isolation ON staff_promotions
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_promotions_school_staff 
ON staff_promotions(school_id, staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_promotions_role_change 
ON staff_promotions(old_role_id, new_role_id);

-- Triggers
DROP TRIGGER IF EXISTS trg_staff_promotions_updated_at ON staff_promotions;
CREATE TRIGGER trg_staff_promotions_updated_at
BEFORE UPDATE ON staff_promotions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_staff_promotions_audit ON staff_promotions;
CREATE TRIGGER trg_staff_promotions_audit
AFTER INSERT OR UPDATE OR DELETE ON staff_promotions
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_staff_promotion(
    _staff_id BIGINT,_old_role_id BIGINT,_new_role_id BIGINT,
    _old_department_id BIGINT,_new_department_id BIGINT,
    _promotion_date DATE,_remarks TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    INSERT INTO staff_promotions (
        school_id,staff_id,old_role_id,new_role_id,old_department_id,new_department_id,
        promotion_date,remarks,is_active,created_by
    )
    VALUES (
        current_school_id(),_staff_id,_old_role_id,_new_role_id,_old_department_id,_new_department_id,
        COALESCE(_promotion_date,CURRENT_DATE),_remarks,
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_staff_promotion(
    _id BIGINT,_old_role_id BIGINT,_new_role_id BIGINT,
    _old_department_id BIGINT,_new_department_id BIGINT,
    _promotion_date DATE,_remarks TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    UPDATE staff_promotions SET
        old_role_id=COALESCE(_old_role_id,old_role_id),
        new_role_id=COALESCE(_new_role_id,new_role_id),
        old_department_id=COALESCE(_old_department_id,old_department_id),
        new_department_id=COALESCE(_new_department_id,new_department_id),
        promotion_date=COALESCE(_promotion_date,promotion_date),
        remarks=COALESCE(_remarks,remarks),
        is_active=COALESCE(_is_active,is_active),
        updated_by=current_user_id()
    WHERE id=_id AND school_id=current_school_id() AND is_deleted=FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_staff_promotion(_id BIGINT) RETURNS VOID AS $$
BEGIN
    UPDATE staff_promotions
    SET is_deleted=TRUE,deleted_at=NOW(),deleted_by=current_user_id()
    WHERE id=_id AND school_id=current_school_id() AND is_deleted=FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants
GRANT SELECT,INSERT,UPDATE ON staff_promotions TO authenticated;
GRANT EXECUTE ON FUNCTION insert_staff_promotion TO authenticated;
GRANT EXECUTE ON FUNCTION update_staff_promotion TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_staff_promotion TO authenticated;
