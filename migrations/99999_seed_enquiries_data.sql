-- ============================================
-- Enquiries Seed Data
-- Run this after database is cleared/created
-- ============================================

DO $$
DECLARE
  v_school_id BIGINT;
BEGIN
  -- Get the first active school
  SELECT id INTO v_school_id FROM schools WHERE is_active = true AND is_deleted = false LIMIT 1;

  IF v_school_id IS NULL THEN
    RAISE EXCEPTION 'No active school found. Create a school first before seeding enquiries data.';
  END IF;

  RAISE NOTICE 'Seeding enquiries data for school %', v_school_id;

  -- Enquiry Categories (WHAT they're enquiring about)
  INSERT INTO enquiry_categories (school_id, name, code, description, parent_id, display_order, color)
  VALUES
    (v_school_id, 'Academic', 'ACADEMIC', 'Academic related enquiries', null, 1, '#3B82F6'),
    (v_school_id, 'Admission Process', 'ADMISSION_PROC', 'Questions about admission procedure', 1, 1, null),
    (v_school_id, 'Curriculum', 'CURRICULUM', 'Questions about curriculum', 1, 2, null),
    (v_school_id, 'Examinations', 'EXAMINATIONS', 'Questions about exams', 1, 3, null),
    
    (v_school_id, 'Fees', 'FEES', 'Fee related enquiries', null, 2, '#F59E0B'),
    (v_school_id, 'Fee Structure', 'FEE_STRUCTURE', 'Questions about fee structure', 5, 1, null),
    (v_school_id, 'Payment Plans', 'PAYMENT_PLANS', 'Questions about payment options', 5, 2, null),
    (v_school_id, 'Scholarships', 'SCHOLARSHIPS', 'Scholarship enquiries', 5, 3, null),
    
    (v_school_id, 'Transport', 'TRANSPORT', 'Transport related enquiries', null, 3, '#8B5CF6'),
    (v_school_id, 'Bus Routes', 'BUS_ROUTES', 'Questions about bus routes', 9, 1, null),
    (v_school_id, 'Transport Fees', 'TRANSPORT_FEES', 'Questions about transport fees', 9, 2, null),
    
    (v_school_id, 'Boarding', 'BOARDING', 'Boarding related enquiries', null, 4, '#EC4899'),
    (v_school_id, 'Hostel Facilities', 'HOSTEL_FACILITIES', 'Questions about hostel', 12, 1, null),
    (v_school_id, 'Boarding Fees', 'BOARDING_FEES', 'Questions about boarding fees', 12, 2, null),
    
    (v_school_id, 'General', 'GENERAL', 'General enquiries', null, 5, '#6B7280'),
    (v_school_id, 'General Inquiry', 'GENERAL_INQUIRY', 'General inquiry - anything not specific', 15, 1, null),
    (v_school_id, 'School Policies', 'POLICIES', 'Questions about policies', 15, 2, null),
    (v_school_id, 'Extracurricular', 'EXTRACURRICULAR', 'Questions about activities', 15, 3, null),
    
    (v_school_id, 'Complaints', 'COMPLAINTS', 'Complaints', null, 6, '#EF4444'),
    (v_school_id, 'Suggestions', 'SUGGESTIONS', 'Suggestions for improvement', null, 7, '#14B8A6')
  ON CONFLICT (school_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    parent_id = EXCLUDED.parent_id,
    display_order = EXCLUDED.display_order,
    color = EXCLUDED.color;

  -- Enquirer Categories (WHO is enquiring)
  INSERT INTO enquirer_categories (school_id, name, code, description, requires_user_id, display_order)
  VALUES
    (v_school_id, 'Existing Parent', 'EXISTING_PARENT', 'Current parent of enrolled student', true, 1),
    (v_school_id, 'Potential Parent', 'POTENTIAL_PARENT', 'Prospective parent', false, 2),
    (v_school_id, 'Existing Student', 'EXISTING_STUDENT', 'Currently enrolled student', true, 3),
    (v_school_id, 'Potential Student', 'POTENTIAL_STUDENT', 'Prospective student', false, 4),
    (v_school_id, 'Vendor', 'VENDOR', 'Service provider/supplier', false, 5),
    (v_school_id, 'Board Member', 'BOARD_MEMBER', 'School board member', true, 6),
    (v_school_id, 'Staff', 'STAFF', 'School staff member', true, 7),
    (v_school_id, 'Alumni', 'ALUMNI', 'Former student', false, 8),
    (v_school_id, 'External Visitor', 'EXTERNAL_VISITOR', 'General external enquiry', false, 9)
  ON CONFLICT (school_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    requires_user_id = EXCLUDED.requires_user_id,
    display_order = EXCLUDED.display_order;

  -- Enquiry Sources (WHERE enquiry came from)
  INSERT INTO enquiry_sources (school_id, name, code, description, is_active)
  VALUES
    (v_school_id, 'Website', 'WEB', 'Enquiry through school website', true),
    (v_school_id, 'Phone Call', 'PHONE', 'Enquiry through phone call', true),
    (v_school_id, 'Walk-in', 'WALKIN', 'In-person visit', true),
    (v_school_id, 'Email', 'EMAIL', 'Enquiry through email', true),
    (v_school_id, 'Social Media', 'SOCIAL', 'Facebook, Instagram, etc.', true),
    (v_school_id, 'Referral', 'REFERRAL', 'Referred by existing parent/student', true),
    (v_school_id, 'Education Fair', 'FAIR', 'Education fair/event', true),
    (v_school_id, 'Advertisement', 'ADVERT', 'Response to advertisement', true)
  ON CONFLICT (school_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

  RAISE NOTICE '✅ Enquiries seed data inserted for school_id: %', v_school_id;
END $$;

-- Verify seed data
SELECT 'Enquiry Categories' as table_name, COUNT(*) as count FROM enquiry_categories WHERE is_deleted = false
UNION ALL
SELECT 'Enquirer Categories', COUNT(*) FROM enquirer_categories WHERE is_deleted = false
UNION ALL
SELECT 'Enquiry Sources', COUNT(*) FROM enquiry_sources WHERE is_deleted = false;

-- Admission Statuses (for tracking application progress)

INSERT INTO admission_statuses (school_id, name, code, description, color, display_order, is_final)
SELECT 
  s.id,
  v.name, v.code, v.description, v.color, v.display_order, v.is_final
FROM schools s
CROSS JOIN (VALUES
  ('Applied', 'APPLIED', 'Application submitted', '#3B82F6', 1, FALSE),
  ('Under Review', 'UNDER_REVIEW', 'Being reviewed by admissions team', '#F59E0B', 2, FALSE),
  ('Interview Scheduled', 'INTERVIEW_SCHEDULED', 'Interview has been scheduled', '#8B5CF6', 3, FALSE),
  ('Interviewed', 'INTERVIEWED', 'Interview completed', '#6B7280', 4, FALSE),
  ('Offered', 'OFFERED', 'Admission offer made', '#10B981', 5, FALSE),
  ('Enrolled', 'ENROLLED', 'Student has enrolled', '#059669', 6, TRUE),
  ('Rejected', 'REJECTED', 'Application rejected', '#EF4444', 7, TRUE),
  ('Waitlisted', 'WAITLISTED', 'On waiting list', '#EC4899', 8, FALSE)
) AS v(name, code, description, color, display_order, is_final)
WHERE s.is_active = true
ON CONFLICT (school_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order,
  is_final = EXCLUDED.is_final;


  -- Seed application_types for all active schools
INSERT INTO application_types (school_id, name, code, description, is_active)
SELECT 
  s.id,
  v.name, v.code, v.description, v.is_active
FROM schools s
CROSS JOIN (VALUES
  ('New Student', 'NEW', 'First-time applicant', TRUE),
  ('Transfer Student', 'TRANSFER', 'Transferring from another school', TRUE),
  ('Returning Student', 'RETURNING', 'Re-enrolling after break', TRUE),
  ('Upgrade', 'UPGRADE', 'Moving to higher grade', TRUE),
  ('Boarding', 'BOARDING', 'Boarding student application', TRUE),
  ('Day Scholar', 'DAY', 'Day student application', TRUE)
) AS v(name, code, description, is_active)
WHERE s.is_active = true
ON CONFLICT (school_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the seed data
SELECT 
  'admission_statuses' as table_name, 
  COUNT(*) as total_records,
  COUNT(DISTINCT school_id) as schools_covered
FROM admission_statuses
UNION ALL
SELECT 
  'application_types', 
  COUNT(*), 
  COUNT(DISTINCT school_id) 
FROM application_types;


-- Create staff records for all active users in school 10001
INSERT INTO staff (school_id, user_id, employee_no, hire_date, is_active)
SELECT 
  10001 as school_id,
  u.id as user_id,
  'EMP-' || LPAD(u.id::text, 5, '0') as employee_no,
  CURRENT_DATE as hire_date,
  true as is_active
FROM users u
WHERE u.school_id = 10001
  AND u.is_active = true
  AND u.is_deleted = false
  AND NOT EXISTS (
    SELECT 1 FROM staff s WHERE s.user_id = u.id
  )
ON CONFLICT (school_id, user_id) DO NOTHING;
