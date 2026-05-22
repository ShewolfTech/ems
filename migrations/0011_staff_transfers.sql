/**
 * Staff Transfers Table
 * Tracks all staff member transfers between departments
 */

-- Create staff_transfers table
CREATE TABLE IF NOT EXISTS staff_transfers (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  old_department_id BIGINT REFERENCES departments(id),
  new_department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  remarks TEXT,
  transferred_by BIGINT REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by BIGINT REFERENCES users(id),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP,
  deleted_by BIGINT REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT fk_staff_transfers_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT fk_staff_transfers_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
  CONSTRAINT fk_staff_transfers_old_dept FOREIGN KEY (old_department_id) REFERENCES departments(id),
  CONSTRAINT fk_staff_transfers_new_dept FOREIGN KEY (new_department_id) REFERENCES departments(id),
  CONSTRAINT fk_staff_transfers_transferred_by FOREIGN KEY (transferred_by) REFERENCES users(id),
  CONSTRAINT fk_staff_transfers_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_staff_transfers_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
  CONSTRAINT fk_staff_transfers_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_staff_transfers_school ON staff_transfers(school_id);
CREATE INDEX idx_staff_transfers_staff ON staff_transfers(staff_id);
CREATE INDEX idx_staff_transfers_old_dept ON staff_transfers(old_department_id);
CREATE INDEX idx_staff_transfers_new_dept ON staff_transfers(new_department_id);
CREATE INDEX idx_staff_transfers_date ON staff_transfers(transfer_date DESC);
CREATE INDEX idx_staff_transfers_active ON staff_transfers(is_active) WHERE NOT is_deleted;

-- Enable RLS
ALTER TABLE staff_transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Users can only see transfers for their school
CREATE POLICY staff_transfers_isolation ON staff_transfers 
  FOR ALL TO authenticated 
  USING (school_id = current_school_id() AND NOT is_deleted) 
  WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON staff_transfers TO authenticated;

-- Helper function to record a staff transfer
CREATE OR REPLACE FUNCTION record_staff_transfer(
  _staff_id BIGINT,
  _new_department_id BIGINT,
  _transfer_date DATE DEFAULT CURRENT_DATE,
  _remarks TEXT DEFAULT NULL,
  _transferred_by BIGINT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  _school_id BIGINT;
  _old_department_id BIGINT;
  _new_id BIGINT;
BEGIN
  -- Get staff school_id and current department
  SELECT school_id, department_id INTO _school_id, _old_department_id FROM staff 
    WHERE id = _staff_id AND is_deleted = FALSE;
  
  IF _school_id IS NULL THEN
    RAISE EXCEPTION 'Staff member not found';
  END IF;

  -- Insert transfer record
  INSERT INTO staff_transfers (
    school_id, staff_id, old_department_id, new_department_id,
    transfer_date, remarks, transferred_by, created_by
  ) VALUES (
    _school_id, _staff_id, _old_department_id, _new_department_id,
    _transfer_date, _remarks, _transferred_by, COALESCE(_transferred_by, current_user_id())
  ) RETURNING id INTO _new_id;

  -- Update staff department
  UPDATE staff SET department_id = _new_department_id, updated_at = NOW(), updated_by = COALESCE(_transferred_by, current_user_id())
    WHERE id = _staff_id;

  RETURN _new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get transfer history for a staff member
CREATE OR REPLACE FUNCTION get_staff_transfer_history(_staff_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  staff_id BIGINT,
  old_department_id BIGINT,
  old_department_name TEXT,
  new_department_id BIGINT,
  new_department_name TEXT,
  transfer_date DATE,
  remarks TEXT,
  transferred_by BIGINT,
  transferred_by_name TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.staff_id,
    st.old_department_id,
    d1.name,
    st.new_department_id,
    d2.name,
    st.transfer_date,
    st.remarks,
    st.transferred_by,
    u.email,
    st.created_at
  FROM staff_transfers st
  LEFT JOIN departments d1 ON st.old_department_id = d1.id
  LEFT JOIN departments d2 ON st.new_department_id = d2.id
  LEFT JOIN users u ON st.transferred_by = u.id
  WHERE st.staff_id = _staff_id 
    AND st.school_id = current_school_id()
    AND st.is_deleted = FALSE
  ORDER BY st.transfer_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
