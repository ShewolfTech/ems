-- ============================================
-- Leave Application & Approval Workflow
-- Note: The leaves table is already defined in 0005_attendances.sql
-- This file adds notification triggers for leave workflow
-- ============================================

-- ============================================
-- Leave Request Notifications
-- ============================================

-- Create a function to notify approvers when leave is applied
CREATE OR REPLACE FUNCTION fn_notify_leave_requester()
RETURNS TRIGGER AS $$
DECLARE
    _leave_type_name TEXT;
    _requester_name TEXT;
BEGIN
    -- Get leave type name
    SELECT lt.name INTO _leave_type_name 
    FROM leave_types lt 
    WHERE lt.id = NEW.leave_type_id;

    -- Get requester name
    SELECT u.username INTO _requester_name 
    FROM users u 
    WHERE u.id = NEW.user_id;

    -- Notify users with leaves.approve permission
    INSERT INTO notifications (user_id, title, body, type, reference_type, reference_id, is_read, created_at)
    SELECT 
        u.id,
        'New Leave Request',
        format('Leave request from %s: %s (%s to %s)', 
            _requester_name, 
            _leave_type_name,
            NEW.start_date,
            NEW.end_date),
        'leave_request',
        'leave_request',
        NEW.id,
        false,
        NOW()
    FROM users u
    JOIN user_permissions up ON up.user_id = u.id
    JOIN permissions p ON up.permission_key = p.permission_key
    WHERE p.permission_key = 'leaves.approve'
    AND up.is_active = true
    AND up.is_allowed = true
    AND u.school_id = NEW.school_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send notification when leave is applied
DROP TRIGGER IF EXISTS trg_notify_leave_request ON leaves;
CREATE TRIGGER trg_notify_leave_request
AFTER INSERT ON leaves
FOR EACH ROW
WHEN (NEW.status = 'pending')
EXECUTE FUNCTION fn_notify_leave_requester();

-- ============================================
-- Leave Approval/Rejection Notifications
-- ============================================

CREATE OR REPLACE FUNCTION fn_notify_leave_decision()
RETURNS TRIGGER AS $$
DECLARE
    _status_text TEXT;
BEGIN
    -- Only notify on status change
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    _status_text := CASE 
        WHEN NEW.status = 'approved' THEN 'approved'
        WHEN NEW.status = 'rejected' THEN 'rejected'
        ELSE NEW.status
    END;

    -- Notify the requester about the decision
    INSERT INTO notifications (user_id, title, body, type, reference_type, reference_id, is_read, created_at)
    VALUES (
        NEW.user_id,
        format('Leave %s', _status_text),
        format('Your leave request for %s to %s has been %s. %s',
            NEW.start_date,
            NEW.end_date,
            _status_text,
            COALESCE('Feedback: ' || NEW.reject_reason, '')),
        'leave_decision',
        'leave_request',
        NEW.id,
        false,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for approval/rejection notifications
DROP TRIGGER IF EXISTS trg_notify_leave_decision ON leaves;
CREATE TRIGGER trg_notify_leave_decision
AFTER UPDATE ON leaves
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION fn_notify_leave_decision();

-- ============================================
-- Grants
-- ============================================

GRANT SELECT, UPDATE ON leaves TO authenticated;
GRANT EXECUTE ON FUNCTION fn_notify_leave_requester() TO authenticated;
GRANT EXECUTE ON FUNCTION fn_notify_leave_decision() TO authenticated;
